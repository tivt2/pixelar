import { Color } from "./board-types"
import { Layer } from "./layer"

export class Frame {
  public canvas: OffscreenCanvas
  public ctx: OffscreenCanvasRenderingContext2D

  private _layers: Array<Layer>
  public currLayerIdx: number

  public colorPallet: Set<Color>

  constructor(width: number, height: number) {
    this.canvas = new OffscreenCanvas(width, height)
    const ctx = this.canvas.getContext("2d")
    if (!ctx) {
      throw new Error("invalid frame ctx")
    }
    this.ctx = ctx
    ctx.imageSmoothingEnabled = false

    this._layers = [new Layer(width, height)]
    this.currLayerIdx = 0

    this.colorPallet = new Set()
  }

  getLayers(): Array<Layer> {
    return this._layers.slice()
  }
  currLayer(): Layer {
    return this._layers[this.currLayerIdx]
  }
  createLayer() {
    this._layers.splice(
      this.currLayerIdx + 1,
      0,
      new Layer(this.canvas.width, this.canvas.height)
    )
    this.currLayerIdx++
  }
  changeLayer(idx: number) {
    if (idx < 0 || idx >= this._layers.length) {
      return
    }

    this.currLayerIdx = idx
  }

  getColorPallet(): Set<Color> {
    let out: Set<Color> = new Set()
    for (const layer of this._layers) {
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
    if (this.currLayerIdx + 1 >= this._layers.length) {
      return new Color("")
    }

    for (let i = this.currLayerIdx + 1; i < this._layers.length; i++) {
      const color = this._layers[i].getPixelColor(xIdx, yIdx)
      if (!color.isEqual("")) {
        return color
      }
    }

    return new Color("")
  }

  getPixelUnderColor(xIdx: number, yIdx: number): Color {
    if (this._layers.length == 1) {
      return new Color("")
    }

    for (let i = this.currLayerIdx - 1; i >= 0; i--) {
      const color = this._layers[i].getPixelColor(xIdx, yIdx)
      if (!color.isEqual("")) {
        return color
      }
    }

    return new Color("")
  }

  paintPixel(xIdx: number, yIdx: number, color: Color) {
    this.ctx.fillStyle = color.hex()
    this.ctx.fillRect(xIdx, yIdx, 1, 1)
    this.colorPallet.add(color)
  }

  clearPixel(xIdx: number, yIdx: number) {
    this.ctx.clearRect(xIdx, yIdx, 1, 1)
  }

  clearFull() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  renderAllLayers() {
    for (let i = 0; i < this._layers.length; i++) {
      this.renderLayer(this._layers[i])
    }
  }

  renderLayer(layer: Layer) {
    this.ctx.drawImage(
      layer.canvas,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )
  }
}
