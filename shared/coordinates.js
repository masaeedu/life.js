import { curry } from 'ramda'

function Point(x, y) {
    return Object.freeze({x, y})
}

const getCoordinatesOfIndex = curry((size, i) => {
    return Point(Math.floor(i / size), i % size)
})

const getIndexOfCoordinates = curry((size, point) => {
    return point.x * size + point.y
})

export { Point, getCoordinatesOfIndex, getIndexOfCoordinates }