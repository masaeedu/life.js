let socket

export const Actions = {
    get initialized() {
        return socket && socket.connected
    },
    initialize(sock, callback) {
        socket = sock
        callback()
    },
    pause() {
        socket.emit('pause')
    },
    draw(data) {
        socket.emit('interaction', JSON.stringify(data))
    },
    randomFill(fillDensity) {
        return () => socket.emit('randomFill', fillDensity)
    },
    clear() {
        socket.emit('clear')
    },
    sendMessage(message) {
        socket.emit('message', JSON.stringify(message))
    }
}