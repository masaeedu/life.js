function Point(x, y) {
    return { x, y }
}

const getCoordinatesOfIndex = size => i => {
    return Point(Math.floor(i / size), i % size)
}

const getIndexOfCoordinates = size => point => {
    return point.x * size + point.y
}

export { Point, getCoordinatesOfIndex, getIndexOfCoordinates }