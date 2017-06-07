import { pipe, range } from 'ramda'

import { Actions } from './actions'
import { Point, getCoordinatesOfIndex, getIndexOfCoordinates } from '../../shared/coordinates'

const lifeState = {
    erasing: false,
    cells: new Set(),
    fillDensity: 0.5
}

export function LifeUI(size) {
    // TODO: singleton antipattern please wire up deps
    if (!Actions.initialized) {
        throw Error('No connection.')
    }

    const config = {
        size,
        fpsCap: 60,
        cellWidth: 5,
        inset: 10,
        getIndex: getIndexOfCoordinates(size),
        getCoordinates: getCoordinatesOfIndex(size),
        get canvasWidth() {
            return (this.cellWidth * this.size) + (this.inset * 2) + 1
        }
    }

    const { context, bounds } = setupUI(config)

    const drawCell = CellDrawer(config, context)

    let lastTime, fps

    function renderLoop(timestamp) {
        if (!lastTime) lastTime = timestamp
        fps = 1000 / (timestamp - lastTime)
        if (fps <= config.fpsCap) {
            context.beginPath()
            for (let i = 0; i < size * size; i++) {
                drawCell(i, lifeState.cells.has(i))
            }
            lastTime = timestamp
        }
        context.stroke()
        requestAnimationFrame(renderLoop)
    }

    return {
        renderLoop,
        updateCells(newCells) {
            lifeState.cells.clear()
            lifeState.cells = new Set([...newCells])
        },
        updateStats(stats) {
            stats.fps = Math.round(fps)
            console.log(stats)
        }
    }
}

function setupUI(config) {
    const { bounds, context, canvas } = setupCanvas(config)
    setupInteraction(config, bounds, canvas)
    setupButtons()
    return { bounds, context }
}

function setupCanvas(config) {
    const wrapper = document.getElementById('sim-wrapper')
    wrapper.style.height = `${config.canvasWidth}px`

    const gridCanvas = document.getElementById('grid-canvas')
    gridCanvas.setAttribute('width', config.canvasWidth)
    gridCanvas.setAttribute('height', config.canvasWidth)

    strokeGrid(config, gridCanvas.getContext('2d'))

    const canvas = document.getElementById('sim-canvas')
    canvas.setAttribute('width', config.canvasWidth)
    canvas.setAttribute('height', config.canvasWidth)

    return {
        context: canvas.getContext('2d'),
        bounds: canvas.getBoundingClientRect(),
        canvas
    }
}

function strokeGrid({ size, inset, cellWidth, canvasWidth }, context) {
    context.strokeStyle = "#4d4d4d"
    context.beginPath()
    range(0, size + 1).forEach(i => {
        let loc = i * cellWidth + inset + 0.5
        context.moveTo(loc, inset)
        context.lineTo(loc, canvasWidth - inset)
        context.moveTo(inset, loc)
        context.lineTo(canvasWidth - inset, loc)
    })
    context.stroke()
}

function setupInteraction({ inset, cellWidth, getIndex }, bounds, canvas) {
    function pixelToCell(point) {
        return Point(
            Math.floor((point.x - inset) / cellWidth),
            Math.floor((point.y - inset) / cellWidth)
        )
    }

    function getCanvasPosition(event) {
        return Point(
            event.clientX - bounds.left,
            event.clientY - bounds.top
        )
    }

    const eventToIndex = pipe(
        getCanvasPosition,
        pixelToCell,
        getIndex
    )

    function interact(event) {
        if (event.buttons) {
            const index = eventToIndex(event)
            Actions.draw({ index, erasing: lifeState.erasing })
        }
    }

    canvas.onmousemove = interact
    canvas.onmousedown = interact
}

function setupButtons() {
    const erase = document.getElementById('erase')
    const pause = document.getElementById('pause')
    const randomFill = document.getElementById('random-fill')
    const clear = document.getElementById('clear')
    const fillDensity = document.getElementById('density')
    erase.onchange = function (event) {
        lifeState.erasing = event.target.checked
    }
    pause.onclick = Actions.pause
    randomFill.onclick = () => Actions.randomFill(lifeState.fillDensity)()
    clear.onclick = Actions.clear
    fillDensity.onchange = (event) => { lifeState.fillDensity = parseFloat(event.target.value) }
}

const CellDrawer = ({ inset, cellWidth, getCoordinates }, context) => (index, cellState) => {
    const { x, y } = getCoordinates(index)
    const canvasCoords = [inset + (x * cellWidth), inset + (y * cellWidth)]
    const fillerFunction = (cellState ? context.fillRect : (...args) => {
        context.clearRect(...args)
        //context.rect(...args)
    }).bind(context)
    fillerFunction(...canvasCoords, cellWidth, cellWidth)
}
