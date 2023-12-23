export class Layer {
  public canvas: OffscreenCanvas
  public ctx: OffscreenCanvasRenderingContext2D

  constructor(width: number, height: number) {
    this.canvas = new OffscreenCanvas(width, height)
    const ctx = this.canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) {
      throw new Error("Could not create layer. Context not found")
    }
    this.ctx = ctx
    this.ctx.imageSmoothingEnabled = false
  }

  paintPixel(xIdx: number, yIdx: number, color: string) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(xIdx, yIdx, 1, 1)
  }

  clearPixel(xIdx: number, yIdx: number) {
    this.ctx.clearRect(xIdx, yIdx, 1, 1)
  }
}
