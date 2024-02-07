import { MouseEvent, SyntheticEvent } from "react"
import { BoardState } from "./board-state"
import { Position } from "./board-types"
import { BoardRenderer } from "./board-renderer"
import { BoardController } from "./board-controller"

export interface BoardTool {
  start(
    e: SyntheticEvent,
    state: BoardState,
    renderer: BoardRenderer,
    controller: BoardController
  ): void
  continue(
    e: SyntheticEvent,
    state: BoardState,
    renderer: BoardRenderer,
    controller: BoardController
  ): void
  end(
    e: SyntheticEvent,
    state: BoardState,
    renderer: BoardRenderer,
    controller: BoardController
  ): void
}

export class Draw implements BoardTool {
  start(
    e: MouseEvent,
    state: BoardState,
    renderer: BoardRenderer,
    controller: BoardController
  ) {
    const { x, y } = controller.getMouseOffsetPosition(e)
    const indexes = controller.getPixelIndexes(x, y)
    if (!indexes) {
      return
    }
    const { xIdx, yIdx } = indexes
    const frame = state.currFrame()
    const layer = frame.currLayer()
    const layerColor = layer.getPixelColor(xIdx, yIdx)
    if (layerColor.isEqual(state.color.hex())) {
      return
    }

    layer.paintPixel(xIdx, yIdx, state.color)

    const overColor = frame.getPixelOverColor(xIdx, yIdx)
    if (overColor.isEqual("")) {
      frame.paintPixel(xIdx, yIdx, state.color)
      renderer.renderPixel(xIdx, yIdx, state.color)
      renderer.renderBorder()
    }
  }
  continue(
    e: MouseEvent,
    state: BoardState,
    renderer: BoardRenderer,
    controller: BoardController
  ) {
    this.start(e, state, renderer, controller)
  }
  end() {}
}

export class Erase implements BoardTool {
  start(
    e: MouseEvent,
    state: BoardState,
    renderer: BoardRenderer,
    controller: BoardController
  ) {
    const { x, y } = controller.getMouseOffsetPosition(e)
    const indexes = controller.getPixelIndexes(x, y)
    if (!indexes) {
      return
    }
    const { xIdx, yIdx } = indexes
    const frame = state.currFrame()
    const layer = frame.currLayer()
    const layerColor = layer.getPixelColor(xIdx, yIdx)
    if (layerColor.isEqual("")) {
      return
    }

    layer.clearPixel(xIdx, yIdx)

    const overColor = frame.getPixelOverColor(xIdx, yIdx)
    if (overColor.isEqual("")) {
      const underColor = frame.getPixelUnderColor(xIdx, yIdx)
      if (underColor.isEqual("")) {
        frame.clearPixel(xIdx, yIdx)
        renderer.clearPixel(xIdx, yIdx)
      } else {
        renderer.renderPixel(xIdx, yIdx, underColor)
      }
      renderer.renderBorder()
    }
  }
  continue(
    e: MouseEvent,
    state: BoardState,
    renderer: BoardRenderer,
    controller: BoardController
  ) {
    this.start(e, state, renderer, controller)
  }
  end() {}
}

export class Pan implements BoardTool {
  private center: Position

  constructor() {
    this.center = { x: 0, y: 0 }
  }

  start(
    e: MouseEvent,
    _state: BoardState,
    _renderer: BoardRenderer,
    controller: BoardController
  ) {
    this.center = controller.getMousePosition(e)
  }

  continue(
    e: MouseEvent,
    state: BoardState,
    renderer: BoardRenderer,
    controller: BoardController
  ) {
    const { x, y } = controller.getMousePosition(e)
    const dx = Math.round(x - this.center.x)
    const dy = Math.round(y - this.center.y)
    state.translate(dx, dy)
    this.center = { x, y }
    renderer.rerender()
  }
  end() {}
}

export class Zoom implements BoardTool {
  private amount: number
  constructor(amount: number) {
    this.amount = amount
  }

  start(
    e: MouseEvent,
    state: BoardState,
    renderer: BoardRenderer,
    controller: BoardController
  ) {
    const { x, y } = controller.getMousePosition(e)

    const newScale = state.getRawScale() * this.amount
    const scaleOffsetX = Math.round((state.offsetX - x) * (this.amount - 1))
    const scaleOffsetY = Math.round((state.offsetY - y) * (this.amount - 1))

    state.setScale(newScale)
    state.translate(scaleOffsetX, scaleOffsetY)
    renderer.rerender()
  }

  continue() {}
  end() {}
}

export class FloodFill implements BoardTool {
  start(
    e: MouseEvent,
    state: BoardState,
    renderer: BoardRenderer,
    controller: BoardController
  ) {
    const { x, y } = controller.getMouseOffsetPosition(e)
    const indexes = controller.getPixelIndexes(x, y)
    if (!indexes) {
      return
    }
    const { xIdx, yIdx } = indexes
    const frame = state.currFrame()
    const layer = frame.currLayer()

    const oldColor = layer.getPixelColor(xIdx, yIdx)

    const rec = (xIdx: number, yIdx: number) => {
      const color = layer.getPixelColor(xIdx, yIdx)
      if (!oldColor.isEqual(color.hex())) {
        return
      }

      if (color.isEqual(state.color.hex())) {
        return
      }

      layer.paintPixel(xIdx, yIdx, state.color)

      const overColor = frame.getPixelOverColor(xIdx, yIdx)
      if (overColor.isEqual("")) {
        renderer.renderPixel(xIdx, yIdx, state.color)
        renderer.renderBorder()
      }

      if (yIdx < layer.canvas.height - 1) {
        rec(xIdx, yIdx + 1)
      }
      if (xIdx < layer.canvas.width - 1) {
        rec(xIdx + 1, yIdx)
      }
      if (yIdx > 0) {
        rec(xIdx, yIdx - 1)
      }
      if (xIdx > 0) {
        rec(xIdx - 1, yIdx)
      }
    }

    rec(xIdx, yIdx)
  }

  continue() {}
  end() {}
}
