import { MouseEvent, WheelEvent } from "react"
import { Color, Layer } from "./Layer"
import { BoardAction, Draw, Erase, Pan, Zoom } from "./BoardAction"

export class Pixel {
  public x: number
  public y: number

  constructor(x: number, y: number) {
    this.x = Math.floor(x)
    this.y = Math.floor(y)
  }
}

type BoardConfig = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}

export class Board {
  public canvas: HTMLCanvasElement
  public ctx: CanvasRenderingContext2D
  private width: number
  private height: number

  private layers: Array<Layer>
  private currLayer: number
  private action: BoardAction | null

  private renderOffsetLeft: number
  private renderOffsetTop: number

  private scale: number
  private color: Color

  constructor() {
    this.canvas = document.createElement("canvas")
    const ctx = this.canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not create Board")
    }
    this.ctx = ctx

    this.width = 0
    this.height = 0

    this.layers = new Array<Layer>()
    this.currLayer = -1
    this.action = null

    this.renderOffsetLeft = 0
    this.renderOffsetTop = 0

    this.scale = 1
    this.color = new Color()
  }

  init({ canvas, ctx, width, height }: BoardConfig) {
    if (width < 0 || height < 0) {
      throw new Error(
        "Board must be initialized with positive width and height"
      )
    }

    this.canvas = canvas
    this.ctx = ctx

    this.width = width
    this.height = height

    this.layers = new Array(1).fill(new Layer(width, height))
    this.currLayer = 0
    this.action = null

    this.renderOffsetLeft = 0
    this.renderOffsetTop = 0

    this.scale = Math.max(
      Math.min(
        Math.floor(canvas.width / width),
        Math.floor(canvas.height / width)
      ),
      1
    )
    this.color = new Color("#ff8800")

    this.renderImage()
  }

  getWidth(): number {
    return this.width
  }
  getHeight(): number {
    return this.height
  }
  getColor(): Color {
    return this.color
  }
  getScale(): number {
    return this.scale
  }
  getCurrLayerIdx(): number {
    return this.currLayer
  }
  getRenderOffsetLeft(): number {
    return this.renderOffsetLeft
  }
  getRenderOffsetTop(): number {
    return this.renderOffsetTop
  }

  changeScale(value: number) {
    this.scale = value < 1 ? 1 : Math.round(value)
  }

  changeRenderOffset(x: number, y: number) {
    this.renderOffsetLeft = Math.round(x)
    this.renderOffsetTop = Math.round(y)
  }

  changeLayer(layerIdx: number) {
    if (layerIdx < 0 || layerIdx >= this.layers.length) {
      throw new Error("layerIdx must be a valid number")
    }
    this.currLayer = layerIdx
  }

  wheelAction(e: WheelEvent) {
    if (e.deltaY < 0) {
      new Zoom(this).in(e)
    } else if (e.deltaY > 0) {
      new Zoom(this).out(e)
    }
  }

  startMouseAction(e: MouseEvent) {
    if (!!this.action) {
      this.action.end(e)
      this.action = null
    }

    const layer = this.layers[this.currLayer]
    switch (e.button) {
      case 0:
        this.action = new Draw(this, layer)
        break
      case 1:
        this.action = new Pan(this)
        break
      case 2:
        this.action = new Erase(this, layer)
        break
    }

    if (!!this.action) {
      this.action.start(e)
    }
  }

  continueMouseAction(e: MouseEvent) {
    if (!this.action) {
      return
    }

    this.action.continue(e)
  }

  stopMouseAction(e: MouseEvent) {
    if (!this.action) {
      return
    }
    this.action.end(e)
    this.action = null
  }

  moveLayerToIndex(fromIdx: number, toIdx: number) {
    if (toIdx < 0 || fromIdx < 0) {
      throw new Error("moveLayerToIndex can only receive positive indexes")
    }
    if (fromIdx >= this.layers.length || toIdx >= this.layers.length) {
      throw new Error("moveLayerToIndex must receive valid indexes")
    }

    const [layer] = this.layers.splice(fromIdx, 1)
    this.layers.splice(toIdx, 0, layer)
  }

  copyLayer(idx: number): number {
    this.layers.push(this.layers[idx].clone())
    return this.layers.length - 1
  }

  createLayer(): number {
    this.layers.push(new Layer(this.width, this.height))
    return this.layers.length - 1
  }

  getLayers(): Array<Layer> {
    return this.layers
  }

  updateLayer(idx: number, data: Array<Color>) {
    this.layers[idx].updateData(data)
  }

  renderImage() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        for (let i = this.layers.length - 1; i >= 0; i--) {
          const color = this.layers[i].getPixelColor(new Pixel(x, y))
          if (!color.isEmpty()) {
            this.drawOnCanvas(new Pixel(x, y), color)
            break
          }
        }
      }
    }
    this.ctx.strokeStyle = "blue"
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(
      this.renderOffsetLeft,
      this.renderOffsetTop,
      this.width * this.scale,
      this.height * this.scale
    )
  }

  registerPixel(e: MouseEvent): Pixel | null {
    let x = e.clientX - this.canvas.offsetLeft - this.renderOffsetLeft
    let y = e.clientY - this.canvas.offsetTop - this.renderOffsetTop
    if (x < 0 || y < 0) {
      return null
    }

    x = Math.floor(x / this.scale)
    y = Math.floor(y / this.scale)
    if (x >= this.getWidth() || y >= this.getHeight()) {
      return null
    }

    const pixel = new Pixel(x, y)
    return pixel
  }

  drawOnCanvas(pixel: Pixel, color: Color) {
    // MUST CHECK IF NEED TO DRAW ON CANVAS OR HIGHER LAYER DRAWS ON THIS PIXEL
    if (color.isEmpty()) {
      this.ctx.clearRect(
        pixel.x * this.scale + this.renderOffsetLeft,
        pixel.y * this.scale + this.renderOffsetTop,
        this.scale,
        this.scale
      )
    } else {
      this.ctx.fillStyle = color.toString()
      this.ctx.fillRect(
        pixel.x * this.scale + this.renderOffsetLeft,
        pixel.y * this.scale + this.renderOffsetTop,
        this.scale,
        this.scale
      )
    }
  }
}
