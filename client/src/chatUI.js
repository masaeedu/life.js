import { Actions } from './actions'

let chatState = {
    name: 'Anon'
}

export function ChatUI() {
    const messageList = document.getElementById('message-list')
    const messageInput = document.getElementById('message-input')
    const nameInput = document.getElementById('name')
    const sendButton = document.getElementById('send')

    sendButton.onclick = sendMessage
    messageInput.onkeyup = (key) => {
        console.log(key)
        if (key.key === 'Enter') {
            sendMessage()
            messageInput.value = ""
        }
    }

    function sendMessage() {
        const content = messageInput.value.trim()
        if (content !== '') {
            Actions.sendMessage({ content, name: chatState.name })
        }
    }

    nameInput.onchange = (event) => {
        chatState.name = event.target.value
    }

    return {
        addMessage(message) {
            const { content, name } = message
            const messageElm = document.createElement('li')
            messageElm.textContent = `${name}: ${content}`
            messageList.appendChild(messageElm)
        }
    }
}