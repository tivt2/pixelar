const board = {
  cachedImage: new Uint8ClampedArray(),
  width: 2,
  height: 2,
  layers: new Array(1).fill({
    getImage() {
      return new Array(board.width * board.height).fill("#ff8800")
    },
  }),
  hexToRGBA(hex) {
    hex = hex.replace(/^#/, "")

    const decimal = parseInt(hex, 16)
    const r = (decimal >> 16) & 255
    const g = (decimal >> 8) & 255
    const b = decimal & 255
    return [r, g, b, 255]
  },
  zoom: 2,
}

const canvas = {
  width: board.width * board.zoom,
  height: board.width * board.zoom,
}

function tstFn(Board, canvas) {
  Board.cachedImage = new Uint8ClampedArray(canvas.width * canvas.height * 4)

  for (let y = 0; y < Board.height; y++) {
    for (let x = 0; x < Board.width; x++) {
      innerLoop: for (let i = Board.layers.length - 1; i >= 0; i--) {
        const layerImg = Board.layers[i].getImage()
        const idx = y * Board.width + x
        const hex = layerImg[idx]

        if (hex) {
          const [r, g, b, a] = Board.hexToRGBA(hex)
          for (let j = 0; j < Board.zoom; j++) {
            const cacheIdx = idx * Board.zoom * 4 + j * 4
            console.log(cacheIdx)

            Board.cachedImage[cacheIdx + 0] = r
            Board.cachedImage[cacheIdx + 1] = g
            Board.cachedImage[cacheIdx + 2] = b
            Board.cachedImage[cacheIdx + 3] = a
          }

          break innerLoop
        } else if (!hex && i === 0) {
          for (let j = 0; j < Board.zoom; j++) {
            const cacheIdx = idx * Board.zoom + j

            Board.cachedImage[cacheIdx + 0] = 0
            Board.cachedImage[cacheIdx + 1] = 0
            Board.cachedImage[cacheIdx + 2] = 0
            Board.cachedImage[cacheIdx + 3] = 0
          }
        }
      }
    }
  }

  return Board.cachedImage
}

console.log(tstFn(board, canvas))
