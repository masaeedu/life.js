import { pipe } from 'ramda'

import { Actions } from './actions'
import { Point, getCoordinatesOfIndex, getIndexOfCoordinates } from '../../shared/coordinates'

const lifeState = {
    erasing: false,
    cells: new Set()
}

export function LifeUI(size) {
    // TODO: singleton antipattern please wire up deps
    if (!Actions.initialized()) {
        throw Error('No connection.')
    }

    const config = {
        fpsCap: 30,
        cellWidth: 5,
        inset: 10.5,
        getIndex: getIndexOfCoordinates(size),
        getCoordinates: getCoordinatesOfIndex(size),
        get canvasWidth() {
            return (this.cellWidth * size) + (inset * 2) + 1
        }
    }

    const cellWidth = 5
    const inset = 10.5
    const canvasWidth = (cellWidth * size) + (inset * 2) + 1

    const { context, bounds } = setupUI(config)

    const drawCell = CellDrawer(config, context)

    let lastTime = false

    function renderLoop(timestamp) {
        if (!lastTime) lastTime = timestamp

        if (((timestamp - lastTime) / 1000) >= (1 / config.fpsCap)) {
            console.log('rendering')
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
        }
    }
}

function setupUI(config) {
    const { bounds, context, canvas } = setupCanvas(config.canvasWidth)
    setupInteraction(config, bounds, canvas)
    setupButtons()
    return { bounds, context }
}

function setupCanvas(width) {
    const canvas = document.createElement('canvas')
    const container = document.getElementById('life-container')
    canvas.setAttribute('width', width)
    canvas.setAttribute('height', width)
    canvas.style = "cursor:pointer"
    container.appendChild(canvas)

    return {
        context: canvas.getContext('2d'),
        bounds: canvas.getBoundingClientRect(),
        canvas
    }
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
    erase.onchange = function (event) {
        lifeState.erasing = event.target.checked
    }
    pause.onclick = Actions.pause
    randomFill.onclick = Actions.randomFill
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
