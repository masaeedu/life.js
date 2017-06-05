let socket
let _initialized = false

function initialized() {
    return _initialized
}

function initialize(sock, callback) {
    socket = sock
    _initialized = true
    callback()
}

function pause() {
    socket.emit('pause')
}

function draw(drawingData) {
    socket.emit('interaction', JSON.stringify(drawingData))
}

function randomFill() {
    socket.emit('randomFill')
}

export const Actions = {
    initialized,
    initialize,
    pause,
    draw,
    randomFill
}