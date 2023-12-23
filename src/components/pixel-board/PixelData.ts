export class CanvasCache {
  private cache: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  // NEED ACTION HISTORY RING BUFFER

  constructor(width: number, height: number) {
    this.cache = document.createElement("canvas")
    this.cache.width = width
    this.cache.height = height

    const ctx = this.cache.getContext("2d", { willReadFrequently: true })
    if (!ctx) {
      throw new Error("Couldn't get canvas 2d context")
    }
    this.ctx = ctx
  }

  drawRect(x: number, y: number, w: number, h: number) {
    this.ctx.fillRect(x, y, w, h)
  }

  updateCache(imageData: ImageData) {
    this.ctx.putImageData(imageData, 0, 0)
  }

  getCacheData(): ImageData {
    return this.ctx.getImageData(0, 0, this.cache.width, this.cache.height)
  }
}
