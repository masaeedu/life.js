import { game } from './life/life'

var path = require('path')
var express = require('express')


var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

const n = 100
let paused = false
const dirty = new Set()
const cells = new Array(n * n)
    .fill(undefined)
    .map(() => Math.round(Math.random()))
const gol = game(n)
setInterval(() => { if (!paused) gol(cells).forEach(i => dirty.add(i)) }, 100)

function update() {
    const updateData = renderDataToJSON()
    dirty.forEach(i => cells[i] = !cells[i])
    dirty.clear()
    return updateData
}

function renderDataToJSON() {
    return JSON.stringify({ cells })
}

function togglePause() {
    paused = !paused
}

function applyInteraction(interactionEvent) {
    console.log(interactionEvent)
    const event = JSON.parse(interactionEvent)
    if (cells[event.index] === event.erasing) dirty.add(event.index)
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
    setInterval(() => {
        const updateData = update()
        socket.emit('update', updateData)
    }, 100)
    socket.emit('start')
})

http.listen(3000, function () {
    console.log('Listening on port 3000.')
})
