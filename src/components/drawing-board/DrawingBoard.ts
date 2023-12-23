import { SyntheticEvent } from "react"
import { Action, ToolManager } from "./ToolManager"
import {
  clearFull,
  drawBackgroud,
  renderBackground,
  renderBorder,
} from "./BoardTools"
import { Layer } from "./Layer"

type DrawingBoardConfig = {
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
  private layers: Array<Layer>
  private currLayer: number
  private bg: Layer

  private scale: number
  private color: string

  private offsetX: number
  private offsetY: number

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
    this.layers = []
    this.currLayer = -1
    this.bg = new Layer(0, 0)

    this.scale = 0
    this.color = ""

    this.offsetX = 0
    this.offsetY = 0
  }

  init({ canvas, ctx, width, height }: DrawingBoardConfig) {
    this.canvas = canvas
    this.ctx = ctx
    ctx.imageSmoothingEnabled = false

    this.width = width
    this.height = height
    this.layers = [new Layer(width, height)]
    this.currLayer = 0
    this.bg = new Layer(width, height)

    this.scale = Math.min(
      Math.floor(canvas.width / width),
      Math.floor(canvas.height / height)
    )
    this.color = "#ff8800"

    this.ctx.translate(this.offsetX, this.offsetY)
    this.offsetX = Math.floor((canvas.width - this.scale * this.width) / 2)
    this.offsetY = Math.floor((canvas.height - this.scale * this.height) / 2)

    clearFull(this.state())
    drawBackgroud(this.state())
    renderBackground(this.state())
    renderBorder(this.state())
  }

  startAction(action: Action, e: SyntheticEvent) {
    this.toolManager.setTool(action)
    this.toolManager.startAction(e, this.state())
  }

  continueAction(e: SyntheticEvent) {
    if (!this.toolManager.getCurrent()) {
      return
    }

    this.toolManager.continueAction(e, this.state())
  }

  endActions(e: SyntheticEvent) {
    if (!this.toolManager.getCurrent()) {
      return
    }

    this.toolManager.endAction(e, this.state())
  }

  setColor(color: string) {
    this.color = color
  }

  getColor(): string {
    return this.color
  }

  getCurrLayer(): number {
    return this.currLayer
  }

  getLayers(): Array<Layer> {
    return this.layers.slice()
  }

  createLayer() {
    this.layers.push(new Layer(this.width, this.height))
  }

  changeLayer(idx: number) {
    if (idx < 0 || idx >= this.layers.length) {
      return
    }

    this.currLayer = idx
  }

  translate(dx: number, dy: number) {
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
  getScale(): number {
    return Math.round(this.scale)
  }

  private state(): DrawingBoardState {
    return {
      board: this,
      canvas: this.canvas,
      ctx: this.ctx,
      width: this.width,
      height: this.height,
      layers: this.layers,
      currLayer: this.currLayer,
      bg: this.bg,
      scale: this.scale,
      color: this.color,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
    }
  }
}

export type DrawingBoardState = {
  board: DrawingBoard
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  layers: Array<Layer>
  currLayer: number
  bg: Layer
  color: string
  scale: number
  offsetX: number
  offsetY: number
}
