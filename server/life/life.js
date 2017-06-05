// need a life object
// it needs to expose a step function that returns a set of cells to update
// it needs to expose a function that can add cells to the set of updates (use input)
// expose a function that creates a grid
import { Point, getCoordinatesOfIndex, getIndexOfCoordinates } from '../../shared/coordinates'

export function game(n) {
    const getCoordinates = getCoordinatesOfIndex(n)
    const getIndex = getIndexOfCoordinates(n)

    function liveNeighbors({ x, y }, cells) {
        const neighbors = [
            [x - 1, y - 1],
            [x, y - 1],
            [x + 1, y - 1],
            [x - 1, y],
            [x + 1, y],
            [x - 1, y + 1],
            [x, y + 1],
            [x + 1, y + 1]
        ]
        return neighbors.filter(pair => {
            const [x, y] = pair
            return cells.has(n * x + y) && inBounds(x, y)
        }).length
    }

    function inBounds(x, y) {
        const size = n * n
        return (x >= 0 && x < size) && (y >= 0 && y < size)
    }

    function checkForLife(cellState, point, cells) {
        const neighbors = liveNeighbors(point, cells)
        if (cellState && (neighbors === 2 || neighbors === 3)) return true
        if (!cellState && (neighbors === 3)) return true
        return false
    }

    return function update(cells) {
        const nextCells = new Set()
        for (var i = 0; i < n * n; i++) {
            const point = getCoordinates(i)
            const nextState = checkForLife(cells.has(i), point, cells)
            if (nextState) nextCells.add(i)
        }
        return nextCells
    }
}