import io from 'socket.io-client'

import { Actions } from './actions'
import { LifeUI } from './lifeUI'

const socket = io()

function run(size) {
  Actions.initialize(socket, () => {
    const lifeUI = LifeUI(size)

    socket.on('update', (event) => {
      const updateData = JSON.parse(event)
      lifeUI.updateCells(updateData.cells)
    })

    lifeUI.renderLoop()
  })
}

socket.on('start', run)