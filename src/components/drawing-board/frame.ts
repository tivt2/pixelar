import { Color } from "./board-types"
import { Layer } from "./layer"

export class Frame {
  public canvas: OffscreenCanvas
  public ctx: OffscreenCanvasRenderingContext2D

  private layers: Array<Layer>
  public currLayerIdx: number

  constructor(width: number, height: number) {
    this.canvas = new OffscreenCanvas(width, height)
    const ctx = this.canvas.getContext("2d")
    if (!ctx) {
      throw new Error("invalid frame ctx")
    }
    this.ctx = ctx
    ctx.imageSmoothingEnabled = false

    this.layers = [new Layer(width, height)]
    this.currLayerIdx = 0
  }

  getLayers(): Array<Layer> {
    return this.layers.slice()
  }
  currLayer(): Layer {
    return this.layers[this.currLayerIdx]
  }
  createLayer() {
    this.layers.splice(
      this.currLayerIdx + 1,
      0,
      new Layer(this.canvas.width, this.canvas.height)
    )
    this.currLayerIdx++
  }
  changeLayer(idx: number) {
    if (idx < 0 || idx >= this.layers.length) {
      return
    }

    this.currLayerIdx = idx
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

  getPixelOverColor(xIdx: number, yIdx: number): Color {
    if (this.currLayerIdx + 1 >= this.layers.length) {
      return new Color("")
    }

    for (let i = this.currLayerIdx + 1; i < this.layers.length; i++) {
      const color = this.layers[i].getPixelColor(xIdx, yIdx)
      if (!color.isEqual("")) {
        return color
      }
    }

    return new Color("")
  }

  getPixelUnderColor(xIdx: number, yIdx: number): Color {
    if (this.layers.length == 1) {
      return new Color("")
    }

    for (let i = this.currLayerIdx - 1; i >= 0; i--) {
      const color = this.layers[i].getPixelColor(xIdx, yIdx)
      if (!color.isEqual("")) {
        return color
      }
    }

    return new Color("")
  }
}
