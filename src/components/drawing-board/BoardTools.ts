import { MouseEvent } from "react"
import { BoardTool } from "./ToolManager"
import { DrawingBoardState } from "./DrawingBoard"
import { Layer } from "./Layer"

export type Position = { x: number; y: number }

export class Draw implements BoardTool {
  start(e: MouseEvent, state: DrawingBoardState) {
    const { x, y } = getMouseOffsetPosition(e, state)
    const indexes = getPositionIndexes(x, y, state)
    if (!indexes) {
      return
    }
    const [xIdx, yIdx] = indexes
    const color = getPixelColor(xIdx, yIdx, state.layers[state.currLayer])
    if (color === state.color) {
      return
    }

    state.layers[state.currLayer].paintPixel(xIdx, yIdx, state.color)

    const overColor = getPixelOverColor(xIdx, yIdx, state)
    if (overColor == "") {
      renderPixel(xIdx, yIdx, state.color, state)
      renderBorder(state)
    }
  }
  continue(e: MouseEvent, state: DrawingBoardState) {
    this.start(e, state)
  }
  end() {}
}

export class Erase implements BoardTool {
  start(e: MouseEvent, state: DrawingBoardState) {
    const { x, y } = getMousePosition(e)
    const indexes = getPositionIndexes(x, y, state)
    if (!indexes) {
      return
    }
    const [xIdx, yIdx] = indexes
    const color = getPixelColor(xIdx, yIdx, state.layers[state.currLayer])
    if (color === state.color) {
      return
    }

    state.layers[state.currLayer].clearPixel(xIdx, yIdx)

    const overColor = getPixelOverColor(xIdx, yIdx, state)
    if (overColor == "") {
      const underColor = getPixelUnderColor(xIdx, yIdx, state)
      console.log(underColor)
      if (underColor == "") {
        clearPixel(xIdx, yIdx, state)
      } else {
        renderPixel(xIdx, yIdx, underColor, state)
      }
      renderBorder(state)
    }
  }
  continue(e: MouseEvent, state: DrawingBoardState) {
    this.start(e, state)
  }
  end() {}
}

export class Pan implements BoardTool {
  private center: Position

  constructor() {
    this.center = { x: 0, y: 0 }
  }

  start(e: MouseEvent) {
    this.center = getMousePosition(e)
  }

  continue(e: MouseEvent, state: DrawingBoardState) {
    const { x, y } = getMousePosition(e)
    const dx = Math.round(x - this.center.x)
    const dy = Math.round(y - this.center.y)
    state.ctx.translate(dx, dy)
    state.board.translate(dx, dy)
    this.center = { x, y }
    renderFullImage(state)
  }
  end() {}
}

export class Zoom implements BoardTool {
  private amount: number
  constructor(amount: number) {
    this.amount = amount
  }

  start(e: MouseEvent, state: DrawingBoardState) {
    const { x, y } = getMousePosition(e)

    const newScale = state.scale * this.amount
    const scaleOffsetX = Math.round((state.offsetX - x) * (this.amount - 1))
    const scaleOffsetY = Math.round((state.offsetY - y) * (this.amount - 1))

    state.board.setScale(newScale)
    state.board.translate(scaleOffsetX, scaleOffsetY)
    state.ctx.translate(scaleOffsetX, scaleOffsetY)
    renderFullImage(state)
  }

  continue() {}
  end() {}
}

function getMouseOffsetPosition(
  e: MouseEvent,
  state: DrawingBoardState
): Position {
  const { x, y } = getMousePosition(e)
  return {
    x: Math.floor(x - state.offsetX),
    y: Math.floor(y - state.offsetY),
  }
}

export function getMousePosition(e: MouseEvent): Position {
  const box = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - box.left
  const y = e.clientY - box.top
  return { x, y }
}

export function getPositionIndexes(
  x: number,
  y: number,
  state: DrawingBoardState
): [number, number] | null {
  const scale = state.board.getScale()
  const xIdx = Math.floor(x / scale)
  const yIdx = Math.floor(y / scale)
  const layer = state.layers[state.currLayer]
  if (
    xIdx < 0 ||
    xIdx >= layer.canvas.width ||
    yIdx < 0 ||
    yIdx >= layer.canvas.height
  ) {
    return null
  }
  return [xIdx, yIdx]
}

export function getPixelOverColor(
  xIdx: number,
  yIdx: number,
  state: DrawingBoardState
): string {
  if (state.currLayer + 1 >= state.layers.length) {
    return ""
  }

  for (let i = state.currLayer + 1; i < state.layers.length; i++) {
    const color = getPixelColor(xIdx, yIdx, state.layers[i])
    if (color !== "") {
      return color
    }
  }

  return ""
}

export function getPixelUnderColor(
  xIdx: number,
  yIdx: number,
  state: DrawingBoardState
): string {
  if (state.layers.length == 1) {
    return ""
  }

  for (let i = state.currLayer - 1; i >= 0; i--) {
    const color = getPixelColor(xIdx, yIdx, state.layers[i])
    if (color !== "") {
      return color
    }
  }

  return ""
}

export function clearFull(state: DrawingBoardState) {
  state.ctx.clearRect(
    -state.board.getOffsetX(),
    -state.board.getOffsetY(),
    state.canvas.width,
    state.canvas.height
  )
}

export function renderFullImage(state: DrawingBoardState) {
  clearFull(state)
  renderBackground(state)
  const scale = state.board.getScale()
  for (const layer of state.layers) {
    state.ctx.drawImage(
      layer.canvas,
      0,
      0,
      state.width * scale,
      state.height * scale
    )
  }
  renderBorder(state)
}

export function renderPixel(
  xIdx: number,
  yIdx: number,
  color: string,
  state: DrawingBoardState
) {
  const scale = state.board.getScale()
  state.ctx.fillStyle = color
  state.ctx.fillRect(xIdx * scale, yIdx * scale, scale, scale)
}

export function clearPixel(
  xIdx: number,
  yIdx: number,
  state: DrawingBoardState
) {
  const scale = state.board.getScale()
  state.ctx.clearRect(xIdx * scale, yIdx * scale, scale, scale)
}

export function renderBorder(state: DrawingBoardState) {
  const scale = state.board.getScale()
  state.ctx.strokeStyle = "black"
  state.ctx.lineWidth = 2
  state.ctx.strokeRect(1, 1, state.width * scale - 2, state.height * scale - 2)
}

export function renderBackground(state: DrawingBoardState) {
  const scale = state.board.getScale()
  state.ctx.drawImage(
    state.bg.canvas,
    0,
    0,
    state.width * scale,
    state.height * scale
  )
}

export function drawBackgroud(state: DrawingBoardState) {
  let checker = 0
  for (let y = 0; y < state.height; y++) {
    for (let x = 0; x < state.width; x++) {
      // const idx = y * state.width + x
      if (checker % 2 === 0) {
        state.bg.paintPixel(x, y, "#dddddd")
      } else {
        state.bg.paintPixel(x, y, "#bbbbbb")
      }
      checker++
    }
    checker += (state.width % 2) + 1
  }
  state.ctx.fillStyle
}

export function getPixelColor(
  xIdx: number,
  yIdx: number,
  layer: Layer
): string {
  const imgData = layer.ctx.getImageData(
    0,
    0,
    layer.canvas.width,
    layer.canvas.height
  )
  const idx = (yIdx * layer.canvas.width + xIdx) * 4
  const r = imgData.data[idx + 0]
  const g = imgData.data[idx + 1]
  const b = imgData.data[idx + 2]
  const a = imgData.data[idx + 3]
  if (a === 0) {
    return ""
  }
  const color = `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`

  return color
}
