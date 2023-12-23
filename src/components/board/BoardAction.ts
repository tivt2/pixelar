import { MouseEvent, SyntheticEvent, WheelEvent } from "react"
import { Board, Pixel } from "./Board"
import { Color, Layer, PastAction } from "./Layer"

export interface BoardAction {
  start(e: SyntheticEvent): void
  continue(e: SyntheticEvent): void
  end(e: SyntheticEvent): void
}

export class Draw implements BoardAction {
  private action: PastAction
  private board: Board
  private layer: Layer

  constructor(board: Board, layer: Layer) {
    this.board = board
    this.layer = layer
    this.action = new Array<[Pixel, Color, Color]>()
  }

  start(e: MouseEvent) {
    const pixel = this.board.registerPixel(e)
    if (!pixel) {
      return
    }

    const pastColor = this.layer.getPixelColor(pixel)
    const color = this.board.getColor()
    if (pastColor.toString() === color.toString()) {
      return
    }

    this.layer.paintPixel(pixel, color)
    this.board.drawOnCanvas(pixel, color)

    this.action.push([pixel, pastColor, color])
  }

  continue(e: MouseEvent) {
    this.start(e)
  }

  end(_: MouseEvent) {
    this.layer.newAction(this.action)
  }
}

export class Erase implements BoardAction {
  private action: PastAction
  private board: Board
  private layer: Layer

  constructor(board: Board, layer: Layer) {
    this.action = new Array<[Pixel, Color, Color]>()
    this.board = board
    this.layer = layer
  }

  start(e: MouseEvent) {
    const pixel = this.board.registerPixel(e)
    if (!pixel) {
      return
    }

    const pastColor = this.layer.getPixelColor(pixel)
    const color = new Color()
    if (pastColor.toString() === color.toString()) {
      return
    }

    this.layer.paintPixel(pixel, color)
    this.board.drawOnCanvas(pixel, color)

    this.action.push([pixel, pastColor, color])
  }

  continue(e: MouseEvent) {
    this.start(e)
  }

  end(_: MouseEvent) {
    this.layer.newAction(this.action)
  }
}

export class Pan implements BoardAction {
  private x: number
  private y: number
  private board: Board

  constructor(board: Board) {
    this.x = 0
    this.y = 0
    this.board = board
  }

  start(e: MouseEvent) {
    this.x = e.clientX - this.board.canvas.offsetLeft
    this.y = e.clientY - this.board.canvas.offsetTop
  }

  continue(e: MouseEvent) {
    const x = e.clientX - this.board.canvas.offsetLeft
    const y = e.clientY - this.board.canvas.offsetTop

    const offsetLeft = Math.round(this.board.getRenderOffsetLeft() + x - this.x)
    const offsetTop = Math.round(this.board.getRenderOffsetTop() + y - this.y)

    this.board.changeRenderOffset(offsetLeft, offsetTop)
    this.board.renderImage()

    this.x = x
    this.y = y
  }

  end(e: MouseEvent) {
    this.continue(e)
  }
}

export class Zoom {
  private board: Board

  constructor(board: Board) {
    this.board = board
  }

  in(e: WheelEvent) {
    this.zoom(e, 1.1)
  }

  out(e: WheelEvent) {
    this.zoom(e, 0.9)
  }

  private zoom(e: WheelEvent, ratio: number) {
    const x = e.clientX - this.board.canvas.offsetLeft
    const y = e.clientY - this.board.canvas.offsetTop
    const newScale = Math.round(this.board.getScale() * ratio)
    const offsetLeft = Math.round(
      x - (x - this.board.getRenderOffsetLeft()) * ratio
    )
    const offsetTop = Math.round(
      y - (y - this.board.getRenderOffsetTop()) * ratio
    )

    this.board.changeRenderOffset(offsetLeft, offsetTop)
    this.board.changeScale(newScale)
    this.board.renderImage()
  }
}
