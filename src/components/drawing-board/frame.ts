import { Color } from "./board-types"
import { Layer } from "./layer"

export class Frame {
  public canvas: OffscreenCanvas
  public ctx: OffscreenCanvasRenderingContext2D

  private layers: Array<Layer>
  private currLayer: number

  private color: Color

  constructor(width: number, height: number) {
    this.canvas = new OffscreenCanvas(width, height)
    const ctx = this.canvas.getContext("2d")
    if (!ctx) {
      throw new Error("invalid frame ctx")
    }
    this.ctx = ctx
    ctx.imageSmoothingEnabled = false

    this.layers = [new Layer(width, height)]
    this.currLayer = 0

    this.color = new Color("#ff8800")
  }

  setColor(color: string) {
    this.color.change(color)
  }
  getColor(): Color {
    return this.color
  }

  getCurrLayer(): number {
    return this.currLayer
  }
  getLayers(): Array<Layer> {
    return this.layers.slice()
  }
  getLayer(): Layer {
    return this.layers[this.currLayer]
  }
  createLayer() {
    this.layers.push(new Layer(this.canvas.width, this.canvas.height))
  }
  changeLayer(idx: number) {
    if (idx < 0 || idx >= this.layers.length) {
      return
    }

    this.currLayer = idx
  }

  getColorPallet(): Set<Color> {
    let out: Set<Color> = new Set()
    for (const layer of this.layers) {
      for (const color of layer.getColorPallet()) {
        out.add(color)
      }
    }
    return out
  }

  getPixelColor(xIdx: number, yIdx: number): Color {
    const pixelData = this.ctx.getImageData(xIdx, yIdx, 1, 1)
    const a = pixelData.data[3]

    if (a === 0) {
      return new Color("")
    }

    let hex = "#"
    for (let i = 0; i < pixelData.data.length - 1; i++) {
      hex += pixelData.data[i].toString(16).padStart(2, "0")
    }

    return new Color(hex)
  }
}
