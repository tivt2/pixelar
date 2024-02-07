import { Layer } from "./layer"
import { Color, ImageState, PixelState } from "./board-types"
import { Frame } from "./frame"

export type BoardConfig = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}

export class BoardState {
  public canvas: HTMLCanvasElement
  public ctx: CanvasRenderingContext2D

  public width: number
  public height: number
  private _scale: number
  public offsetX: number
  public offsetY: number

  public imgState: ImageState

  public frames: Array<Frame>
  public currFrameIdx: number

  public bgMultiplier: number
  public bg: Layer

  public effectMultiplier: number
  public effect: Layer

  public color: Color

  constructor() {
    this.canvas = document.createElement("canvas")
    const ctx = this.canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not create DrawingBoard instance")
    }
    this.ctx = ctx

    this.width = 0
    this.height = 0
    this._scale = 0
    this.offsetX = 0
    this.offsetY = 0
    this.imgState = []
    this.frames = []
    this.currFrameIdx = -1
    this.bgMultiplier = 1
    this.bg = new Layer(0, 0)
    this.effectMultiplier = 1
    this.effect = new Layer(0, 0)
    this.color = new Color("")
  }

  init({ canvas, ctx, width, height }: BoardConfig) {
    this.canvas = canvas
    this.ctx = ctx
    ctx.imageSmoothingEnabled = false

    this.width = width
    this.height = height
    this._scale = Math.floor(
      Math.min(canvas.width / width, canvas.height / height)
    )
    this.offsetX = Math.floor((canvas.width - this._scale * this.width) / 2)
    this.offsetY = Math.floor((canvas.height - this._scale * this.height) / 2)

    this.imgState = new Array<PixelState>(width * height).fill(null)
    this.frames = [new Frame(width, height)]
    this.currFrameIdx = 0
    this.bgMultiplier = 1
    this.bg = new Layer(width * this.bgMultiplier, height * this.bgMultiplier)
    this.effectMultiplier = 1
    this.effect = new Layer(
      width * this.effectMultiplier,
      height * this.effectMultiplier
    )

    this.color = new Color("#ff8800")

    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.translate(this.offsetX, this.offsetY)
  }

  currFrame(): Frame {
    return this.frames[this.currFrameIdx]
  }
  createFrame() {
    this.frames.splice(
      this.currFrameIdx + 1,
      0,
      new Frame(this.width, this.height)
    )
    this.currFrameIdx++
  }

  translate(dx: number, dy: number) {
    this.ctx.translate(dx, dy)
    this.offsetX += dx
    this.offsetY += dy
  }

  setScale(scale: number) {
    this._scale = Math.max(1, scale)
  }
  getRawScale(): number {
    return this._scale
  }
  getScale(): number {
    return Math.round(this._scale)
  }

  getColorPallet(): Set<Color> {
    let colorPallet: Set<Color> = new Set()
    for (const frame of this.frames) {
      for (const color of frame.getColorPallet()) {
        colorPallet.add(color)
      }
    }
    return colorPallet
  }
}
