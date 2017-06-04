// LOGICAL SIZE
const n = 100;

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

function getCoordinatesOfIndex(i) {
  return [Math.floor(i / n), i % n];
}

function getIndexOfCoordinates(x, y) {
  return x * n + y;
}

function drawCell(i, fill) {
  const [x, y] = getCoordinatesOfIndex(i, [n, n]);
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

function liveNeighbors(x, y) {
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
    return cells[n * x + y] && inBounds(pair)
  }).length;
}

function inBounds(coordPair) {
  const [x, y] = coordPair;
  const size = n * n;
  return (x >= 0 && x < size) && (y >= 0 && y < size);
}

function checkForLife(cellState, x, y) {
  const neighbors = liveNeighbors(x, y);
  if (cellState && (neighbors === 2 || neighbors === 3)) return true;
  if (!cellState && (neighbors === 3)) return true;
  return false;
}

function pixelToCell(x, y) {
  return [Math.floor((x - p) / bw), Math.floor((y - p) / bw)];
}

let dirty = new Set();
let renderDirty = new Set();
function getCanvasPos(evt) {
  return [evt.clientX - bounds.left, evt.clientY - bounds.top];
}

/// WORK PRODUCERS
// User interaction
function interact(e) {
  let i = getIndexOfCoordinates(...pixelToCell(...getCanvasPos(e)));
  if (e.buttons && cells[i] === erasing) dirty.add(i);
  return e;
}
canvas.onmousemove = interact;
canvas.onmousedown = interact;

// GOL evolution
(function evolve() {
  if (!paused) {
    for (var i = 0; i < n * n; i++) {
      const [x, y] = getCoordinatesOfIndex(i);
      const alive = checkForLife(cells[i], x, y);
      if (cells[i] !== alive) dirty.add(i);
    }
  }
  setTimeout(evolve, 100);
})()

/// WORK CONSUMERS
// Grid update
(function update() {
  dirty.forEach(i => { cells[i] = !cells[i]; renderDirty.add(i) });
  dirty.clear();
  setTimeout(update, 100);
})();

// Canvas update
let fpsCap = 30;
let last;

(function render(timestamp) {
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
})();