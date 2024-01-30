import { MouseEvent, SyntheticEvent } from "react"
import { Action, ToolManager } from "./tool-manager"
import { Layer } from "./layer"
import { Color, ImageState, Pixel, PixelState, Position } from "./board-types"
import { Frame } from "./frame"

export type DrawingBoardConfig = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}

export class DrawingBoard {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  private width: number
  private height: number
  private scale: number
  private offsetX: number
  private offsetY: number

  private imgState: ImageState

  private frames: Array<Frame>
  private currFrame: number

  private bgMultiplier: number
  private bg: Layer

  private effectMultiplier: number
  private effect: Layer

  private color: Color

  private toolManager: ToolManager = new ToolManager()

  constructor() {
    this.canvas = document.createElement("canvas")
    const ctx = this.canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Could not create DrawingBoard instance")
    }
    this.ctx = ctx

    this.width = 0
    this.height = 0
    this.scale = 0
    this.offsetX = 0
    this.offsetY = 0
    this.imgState = []
    this.frames = []
    this.currFrame = -1
    this.bgMultiplier = 1
    this.bg = new Layer(0, 0)
    this.effectMultiplier = 1
    this.effect = new Layer(0, 0)
    this.color = new Color("")
  }

  init({ canvas, ctx, width, height }: DrawingBoardConfig) {
    this.canvas = canvas
    this.ctx = ctx
    ctx.imageSmoothingEnabled = false

    this.width = width
    this.height = height
    this.scale = Math.floor(
      Math.min(canvas.width / width, canvas.height / height)
    )
    this.offsetX = Math.floor((canvas.width - this.scale * this.width) / 2)
    this.offsetY = Math.floor((canvas.height - this.scale * this.height) / 2)

    this.imgState = new Array<PixelState>(width * height).fill(null)
    this.frames = [new Frame(width, height)]
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

    this.drawBG()

    this.clearBoard()
    this.renderBG()
    this.renderEffects()
  }

  setColor(color: string) {
    this.color.change(color)
  }
  getColor(): Color {
    return this.color
  }

  getCurrFrame(): number {
    return this.currFrame
  }
  getFrames(): Array<Frame> {
    return this.frames.slice()
  }
  getFrame(): Frame {
    return this.frames[this.currFrame]
  }
  createFrame() {
    this.frames.push(new Frame(this.width, this.height))
  }
  changeFrame(idx: number) {
    if (idx < 0 || idx >= this.frames.length) {
      return
    }

    this.currFrame = idx
    this.rerender()
  }

  translate(dx: number, dy: number) {
    this.ctx.translate(dx, dy)
    this.offsetX += dx
    this.offsetY += dy
  }

  getOffsetX(): number {
    return this.offsetX
  }
  getOffsetY(): number {
    return this.offsetY
  }

  setScale(scale: number) {
    this.scale = Math.max(1, scale)
  }
  getRawScale(): number {
    return this.scale
  }
  getScale(): number {
    return Math.round(this.scale)
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

  startAction(action: Action, e: SyntheticEvent) {
    this.toolManager.setTool(action)
    this.toolManager.startAction(e, this)
  }

  continueAction(e: SyntheticEvent) {
    if (!this.toolManager.getCurrent()) {
      return
    }

    this.toolManager.continueAction(e, this)
  }

  endActions(e: SyntheticEvent) {
    if (!this.toolManager.getCurrent()) {
      return
    }

    this.toolManager.endAction(e, this)
  }

  clearBoard() {
    this.ctx.clearRect(
      -this.getOffsetX(),
      -this.getOffsetY(),
      this.canvas.width,
      this.canvas.height
    )
  }

  renderEffects() {
    this.renderBorder()
  }

  renderBorder() {
    const scale = this.getScale()
    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = "black"
    this.ctx.strokeRect(-1, -1, this.width * scale + 2, this.height * scale + 2)
  }

  drawBG() {
    for (let y = 0; y < this.bg.canvas.height; y++) {
      for (let x = 0; x < this.bg.canvas.width; x++) {
        if ((x + y) % 2 === 0) {
          this.bg.paintPixel(x, y, new Color("#dddddd"))
        } else {
          this.bg.paintPixel(x, y, new Color("#bbbbbb"))
        }
      }
    }
  }

  renderBG() {
    const scale = this.getScale()
    this.ctx.drawImage(
      this.bg.canvas,
      0,
      0,
      this.width * scale,
      this.height * scale
    )
  }

  renderFrame(frame: Frame) {
    const scale = this.getScale()
    this.ctx.drawImage(
      frame.canvas,
      0,
      0,
      this.width * scale,
      this.height * scale
    )
  }

  renderAllLayers() {
    for (let i = 0; i < this.frames.length; i++) {
      this.renderFrame(this.frames[i])
    }
  }

  renderPixel(xIdx: number, yIdx: number, color: Color) {
    const scale = this.getScale()
    this.ctx.fillStyle = color.hex()
    this.ctx.fillRect(xIdx * scale, yIdx * scale, scale, scale)
  }

  clearPixel(xIdx: number, yIdx: number) {
    const bgColor = this.bg.getPixelColor(xIdx, yIdx)
    this.renderPixel(xIdx, yIdx, bgColor)
  }

  rerender() {
    this.clearBoard()
    this.renderBG()
    this.renderAllLayers()
    this.renderEffects()
  }

  generateBackground() {
    let checker = 0
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (checker % 2 === 0) {
          this.bg.paintPixel(x, y, new Color("#dddddd"))
        } else {
          this.bg.paintPixel(x, y, new Color("#bbbbbb"))
        }
        checker++
      }
      checker += (this.width % 2) + 1
    }
    this.ctx.fillStyle
  }

  getMousePosition(e: MouseEvent): Position {
    const box = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top
    return { x, y }
  }

  getMouseOffsetPosition(e: MouseEvent): Position {
    const { x, y } = this.getMousePosition(e)
    return {
      x: Math.floor(x - this.offsetX),
      y: Math.floor(y - this.offsetY),
    }
  }

  getPixelIndexes(x: number, y: number): Pixel | null {
    const scale = this.getScale()
    const xIdx = Math.floor(x / scale)
    const yIdx = Math.floor(y / scale)
    const frame = this.frames[this.currFrame]
    if (
      xIdx < 0 ||
      xIdx >= frame.canvas.width ||
      yIdx < 0 ||
      yIdx >= frame.canvas.height
    ) {
      return null
    }
    return { xIdx, yIdx }
  }

  getPixelOverColor(xIdx: number, yIdx: number): Color {
    if (this.currFrame + 1 >= this.frames.length) {
      return new Color("")
    }

    for (let i = this.currFrame + 1; i < this.frames.length; i++) {
      const color = this.frames[i].getPixelColor(xIdx, yIdx)
      if (!color.isEqual("")) {
        return color
      }
    }

    return new Color("")
  }

  getPixelUnderColor(xIdx: number, yIdx: number): Color {
    if (this.frames.length == 1) {
      return new Color("")
    }

    for (let i = this.currFrame - 1; i >= 0; i--) {
      const color = this.frames[i].getPixelColor(xIdx, yIdx)
      if (!color.isEqual("")) {
        return color
      }
    }

    return new Color("")
  }
}
