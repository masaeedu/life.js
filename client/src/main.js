import io from 'socket.io-client'

import { Actions } from './actions'
import { LifeUI } from './lifeUI'
import { ChatUI } from './chatUI'

const socket = io()

function run(size) {
  Actions.initialize(socket, () => {
    const lifeUI = LifeUI(size)
    const chatUI = ChatUI()

    socket.on('update', event => {
      const updateData = JSON.parse(event)
      lifeUI.updateCells(updateData.cells)
    })

    socket.on('message', event => {
      const message = JSON.parse(event)
      chatUI.addMessage(message)
    })

    lifeUI.renderLoop()
  })
}

socket.on('start', run)