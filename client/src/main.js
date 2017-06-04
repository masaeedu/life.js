import io from 'socket.io-client'
import { Point, getCoordinatesOfIndex, getIndexOfCoordinates } from '../../shared/coordinates'

var socket = io('ws://localhost:3000')
socket.emit('message', 'test')

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
document.body.appendChild(canvas);

const bounds = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d");

const erase = document.getElementById('erase');
let erasing = false;
erase.onchange = function(e) {
	erasing = e.target.checked;
};

const pause = document.getElementById('pause');
let paused = false;
pause.onclick = function() {
  paused = !paused;
};

function drawCell(i, fill) {
  const {x, y} = getCoordinates(i);
  const coords = [p + (x * bw), p + (y * bw)];
  const f = (fill ? ctx.fillRect : (...args) => {
    ctx.clearRect(...args);
    ctx.rect(...args);
  }).bind(ctx);
  f(...coords, bw, bw);
}

/// GOL ALGORITHM
const cells = new Array(n * n).fill(0).map(() => {
  var r = Math.random();
  return Math.round(r);
});

function liveNeighbors({x, y}) {
  const neighbors = [
    [x - 1, y - 1],
    [x, y - 1],
    [x + 1, y - 1],
    [x - 1, y],
    [x + 1, y],
    [x - 1, y + 1],
    [x, y + 1],
    [x + 1, y + 1]
  ];
  return neighbors.filter(pair => {
    const [x, y] = pair
    return cells[n * x + y] && inBounds(x, y)
  }).length;
}

function inBounds(x, y) {
  const size = n * n;
  return (x >= 0 && x < size) && (y >= 0 && y < size);
}

function checkForLife(cellState, point) {
  const neighbors = liveNeighbors(point);
  if (cellState && (neighbors === 2 || neighbors === 3)) return true;
  if (!cellState && (neighbors === 3)) return true;
  return false;
}

function pixelToCell(point) {
  return Point(Math.floor((point.x - p) / bw), Math.floor((point.y - p) / bw));
}

let dirty = new Set();
let renderDirty = new Set();

function getCanvasPos(evt) {
  return Point(evt.clientX - bounds.left, evt.clientY - bounds.top);
}

/// WORK PRODUCERS
// User interaction
function interact(e) {
  let i = getIndex(pixelToCell(getCanvasPos(e)));
  if (e.buttons && cells[i] === erasing) dirty.add(i);
  return e;
}
canvas.onmousemove = interact;
canvas.onmousedown = interact;

// GOL evolution
function evolve() {
  if (!paused) {
    for (var i = 0; i < n * n; i++) {
      const point = getCoordinates(i);
      const alive = checkForLife(cells[i], point);
      if (cells[i] !== alive) dirty.add(i);
    }
  }
  setTimeout(evolve, 100);
}
evolve();

/// WORK CONSUMERS
// Grid update
function update() {
  dirty.forEach(i => { cells[i] = !cells[i]; renderDirty.add(i) });
  dirty.clear();
  setTimeout(update, 100);
}
update();

// Canvas update
let fpsCap = 30;
let last;

function render(timestamp) {
  if (!last) last = timestamp;

  if (((timestamp - last) / 1000) >= (1 / fpsCap)) {
    ctx.beginPath();
    for (let i of renderDirty) {
      drawCell(i, cells[i]);
    }
    ctx.stroke();
    last = timestamp;
    renderDirty = new Set();
  }

  requestAnimationFrame(render);
}
render();