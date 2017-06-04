import { togglePause, evolve, renderSetToJSON, applyInteraction, clearRenderSet, update } from './life/life'

var path = require('path')
var express = require('express')


var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../client/views/index.html'))
})

app.use('/static', express.static(path.resolve(__dirname, '../client/build')))

io.on('connection', function(socket) {
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

setInterval(() => evolve(), 100)

http.listen(3000, function () {
    console.log('Listening on port 3000.')
})
