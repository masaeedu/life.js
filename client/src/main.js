import io from 'socket.io-client'
import { Point, getCoordinatesOfIndex, getIndexOfCoordinates } from '../../shared/coordinates'

var socket = io()

let cells = []
socket.on('update', (update) => {
  const updateData = JSON.parse(update)
  cells = updateData.cells
})

// LOGICAL SIZE
const n = 100;

const getCoordinates = getCoordinatesOfIndex(n);
const getIndex = getIndexOfCoordinates(n);

// PIXEL SIZES
const bw = 5;
const p = 10.5;
const cw = (bw * n) + (p * 2) + 1;

const canvas = document.createElement('canvas');
canvas.setAttribute("width", cw);
canvas.setAttribute("height", cw);
canvas.style = "cursor:pointer"
document.body.appendChild(canvas);

const bounds = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d");

const erase = document.getElementById('erase');
let erasing = false;
erase.onchange = function (e) {
  erasing = e.target.checked;
};

const pause = document.getElementById('pause');
let paused = false;
pause.onclick = function () {
  socket.emit('pause')
};

function drawCell(i, fill) {
  const { x, y } = getCoordinates(i);
  const coords = [p + (x * bw), p + (y * bw)];
  const f = (fill ? ctx.fillRect : (...args) => {
    ctx.clearRect(...args);
    ctx.rect(...args);
  }).bind(ctx);
  f(...coords, bw, bw);
}

function pixelToCell(point) {
  return Point(Math.floor((point.x - p) / bw), Math.floor((point.y - p) / bw));
}

function getCanvasPos(evt) {
  return Point(evt.clientX - bounds.left, evt.clientY - bounds.top);
}

// User interaction
function interact(e) {
  if (e.buttons) {
    let i = getIndex(pixelToCell(getCanvasPos(e)));
    const interactionMessage = {
      index: i,
      erasing
    }
    socket.emit('interaction', JSON.stringify(interactionMessage))
    return e;
  }
}
canvas.onmousemove = interact;
canvas.onmousedown = interact;

// Canvas update
let fpsCap = 30;
let last;

function render(timestamp) {
  if (!last) last = timestamp;

  if (((timestamp - last) / 1000) >= (1 / fpsCap)) {
    ctx.beginPath();
    for (var i = 0; i < n * n; i++) {
      drawCell(i, cells[i]);
    }
    ctx.stroke();
    last = timestamp;
  }

  requestAnimationFrame(render);
}
socket.on('start', render)