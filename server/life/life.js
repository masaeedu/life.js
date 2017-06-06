import { any, equals } from 'ramda'

import { Point, getCoordinatesOfIndex, getIndexOfCoordinates } from '../../shared/coordinates'

function Ruleset(born, survives) {
    return (alive, neighbors) => {
        if (!alive) {
            return any(equals(neighbors), born)
        }
        if (alive) {
            return any(equals(neighbors), survives)
        }
        return false
    }
}

const gameOfLife = Ruleset([3], [2, 3])
const highLife = Ruleset([3, 6], [2, 3])

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
        return gameOfLife(cellState, neighbors)
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