import { Color } from "./board-types"

export class Layer {
  public canvas: OffscreenCanvas
  public ctx: OffscreenCanvasRenderingContext2D
  private colorPallet: Set<Color>

  constructor(width: number, height: number) {
    this.canvas = new OffscreenCanvas(width, height)
    const ctx = this.canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) {
      throw new Error("Could not create layer. Context not found")
    }
    this.ctx = ctx
    this.ctx.imageSmoothingEnabled = false

    this.colorPallet = new Set()
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

  getColorPallet(): Set<Color> {
    return this.colorPallet
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
}
