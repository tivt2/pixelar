import { MouseEvent, SyntheticEvent } from "react"
import { DrawingBoard } from "./drawing-board"
import { Position } from "./board-types"

export interface BoardTool {
  start(e: SyntheticEvent, board: DrawingBoard): void
  continue(e: SyntheticEvent, board: DrawingBoard): void
  end(e: SyntheticEvent, board: DrawingBoard): void
}

export class Draw implements BoardTool {
  start(e: MouseEvent, board: DrawingBoard) {
    const { x, y } = board.getMouseOffsetPosition(e)
    const indexes = board.getPixelIndexes(x, y)
    if (!indexes) {
      return
    }
    const { xIdx, yIdx } = indexes
    const layer = board.getLayer()
    const layerColor = layer.getPixelColor(xIdx, yIdx)
    const boardColor = board.getColor()
    if (layerColor.isEqual(boardColor.hex())) {
      return
    }

    layer.paintPixel(xIdx, yIdx, boardColor)

    const overColor = board.getPixelOverColor(xIdx, yIdx)
    if (overColor.isEqual("")) {
      board.renderPixel(xIdx, yIdx, boardColor)
      board.renderBorder()
    }
  }
  continue(e: MouseEvent, board: DrawingBoard) {
    this.start(e, board)
  }
  end() {}
}

export class Erase implements BoardTool {
  start(e: MouseEvent, board: DrawingBoard) {
    const { x, y } = board.getMouseOffsetPosition(e)
    const indexes = board.getPixelIndexes(x, y)
    if (!indexes) {
      return
    }
    const { xIdx, yIdx } = indexes
    const layer = board.getLayer()
    const layerColor = layer.getPixelColor(xIdx, yIdx)
    if (layerColor.isEqual("")) {
      return
    }

    layer.clearPixel(xIdx, yIdx)

    const overColor = board.getPixelOverColor(xIdx, yIdx)
    if (overColor.isEqual("")) {
      const underColor = board.getPixelUnderColor(xIdx, yIdx)
      if (underColor.isEqual("")) {
        board.clearPixel(xIdx, yIdx)
      } else {
        board.renderPixel(xIdx, yIdx, underColor)
      }
      board.renderBorder()
    }
  }
  continue(e: MouseEvent, board: DrawingBoard) {
    this.start(e, board)
  }
  end() {}
}

export class Pan implements BoardTool {
  private center: Position

  constructor() {
    this.center = { x: 0, y: 0 }
  }

  start(e: MouseEvent, board: DrawingBoard) {
    this.center = board.getMousePosition(e)
  }

  continue(e: MouseEvent, board: DrawingBoard) {
    const { x, y } = board.getMousePosition(e)
    const dx = Math.round(x - this.center.x)
    const dy = Math.round(y - this.center.y)
    board.translate(dx, dy)
    this.center = { x, y }
    board.rerender()
  }
  end() {}
}

export class Zoom implements BoardTool {
  private amount: number
  constructor(amount: number) {
    this.amount = amount
  }

  start(e: MouseEvent, board: DrawingBoard) {
    const { x, y } = board.getMousePosition(e)

    const newScale = board.getRawScale() * this.amount
    const scaleOffsetX = Math.round(
      (board.getOffsetX() - x) * (this.amount - 1)
    )
    const scaleOffsetY = Math.round(
      (board.getOffsetY() - y) * (this.amount - 1)
    )

    board.setScale(newScale)
    board.translate(scaleOffsetX, scaleOffsetY)
    board.rerender()
  }

  continue() {}
  end() {}
}

export class FloodFill implements BoardTool {
  start(e: MouseEvent, board: DrawingBoard) {
    const { x, y } = board.getMouseOffsetPosition(e)
    const indexes = board.getPixelIndexes(x, y)
    if (!indexes) {
      return
    }
    const { xIdx, yIdx } = indexes
    const layer = board.getLayer()

    const oldColor = layer.getPixelColor(xIdx, yIdx)
    const newColor = board.getColor()

    const rec = (xIdx: number, yIdx: number) => {
      const color = layer.getPixelColor(xIdx, yIdx)
      if (!oldColor.isEqual(color.hex())) {
        return
      }

      if (color.isEqual(newColor.hex())) {
        return
      }

      layer.paintPixel(xIdx, yIdx, newColor)

      const overColor = board.getPixelOverColor(xIdx, yIdx)
      if (overColor.isEqual("")) {
        board.renderPixel(xIdx, yIdx, newColor)
        board.renderBorder()
      }

      if (yIdx < layer.canvas.height-1) {
        rec(xIdx, yIdx+1)
      }
      if (xIdx < layer.canvas.width-1) {
        rec(xIdx+1, yIdx)
      }
      if (yIdx > 0) {
        rec(xIdx, yIdx-1)
      }
      if (xIdx > 0) {
        rec(xIdx-1, yIdx)
      }
    }

    rec(xIdx, yIdx)
  }

  continue() {}
  end() {}
}
