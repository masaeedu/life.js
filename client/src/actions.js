let socket

export const Actions = {
    get initialized() {
        return socket && socket.connected
    },
    initialize (sock, callback) {
        socket = sock
        callback()
    },
    pause () {
        socket.emit('pause')
    },
    draw (data) {
        socket.emit('interaction', JSON.stringify(data))
    },
    randomFill() {
        socket.emit('randomFill')
    }
}