import { game } from './life/life'

var path = require('path')
var express = require('express')


var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

const n = 100

let updateInterval = 10
let paused = false

function until (cond, action) {
    let status = cond()
    while(!status) {
        action()
        status = cond()
    }
}

function randomCells (filledFraction) {
    const result = new Set()
    const fullEnough = () => result.size >= ((n * n) * filledFraction)
    until(fullEnough, () => result.add(Math.floor((n * n) * Math.random())))
    return result
}

let cells = randomCells(0.5)
let generations = 0

let ups = 0 // updates per second, not accounting for the updateInterval

let lastGeneration = Date.now()
let gps = 0 // generations per second, accounts for interval

const gol = game(n)
setInterval(() => {
    if (!paused) {
        gps = Math.round(1000 / (Date.now() - lastGeneration))
        lastGeneration = Date.now()
        let preUpdate = Date.now()
        cells = gol(cells)
        generations += 1
        ups = Math.round(1000 / (Date.now() - preUpdate))
    }
}, updateInterval)

function update() {
    const updateData = renderDataToJSON()
    return updateData
}

function renderDataToJSON() {
    return JSON.stringify({
        cells: [...cells],
        stats: { gps, ups, generations}
    })
}

function togglePause() {
    paused = !paused
}

function applyInteraction(interactionEvent) {
    const event = JSON.parse(interactionEvent)
    if (event.erasing) {
        if (cells.has(event.index)) cells.delete(event.index)
    } else {
        cells.add(event.index)
    }
}


app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../client/views/index.html'))
})

app.use('/static', express.static(path.resolve(__dirname, '../client/build')))

io.on('connection', function (socket) {
    console.log('a user connected')

    socket.on('message', (m) => console.log(m))
    socket.on('interaction', applyInteraction)
    socket.on('pause', togglePause)
    socket.on('randomFill', (density) => {
        cells = randomCells(density)
    })
    socket.on('clear', () => cells.clear())
    socket.on('message', (message) => {
        socket.emit('message', message)
    })
    setInterval(() => {
        const updateData = update()
        socket.emit('update', updateData)
    }, updateInterval)
    socket.emit('start', n)
})

http.listen(3000, function () {
    console.log('Listening on port 3000.')
})
