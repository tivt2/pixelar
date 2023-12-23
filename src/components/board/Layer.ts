import { Pixel } from "./Board"

export class Color {
  private hex: string | null

  constructor()
  constructor(hex: string)
  constructor(rgb: [number, number, number])
  constructor(arg?: string | [number, number, number]) {
    if (!arg) {
      this.hex = null
    } else if (typeof arg === "string") {
      this.hex = arg
    } else {
      this.hex = this.rgbToHex(arg)
    }
  }

  private rgbToHex([r, g, b]: [number, number, number]): string {
    const toHex = (c: number) => {
      const hex = c.toString(16)
      return hex.length === 1 ? `0${hex}` : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  toString(): string {
    return this.hex ?? ""
  }

  isEmpty(): boolean {
    return this.hex === null
  }

  toRGB(): [number, number, number] | null {
    if (!this.hex) {
      return null
    }
    const hex = this.hex.replace(/^#/, "")

    const hexDecimal = parseInt(hex, 16)
    const r = (hexDecimal >> 16) & 255
    const g = (hexDecimal >> 8) & 255
    const b = hexDecimal & 255

    return [r, g, b]
  }
}

export type PastAction = Array<[Pixel, Color, Color]>

export class Layer {
  private pallete: Set<Color>
  private history: Array<PastAction>
  private historyIdx: number

  private width: number
  private height: number

  private data: Array<Color>

  constructor(width: number, height: number) {
    this.pallete = new Set<Color>()
    this.history = new Array<PastAction>()
    this.historyIdx = -1

    this.width = width
    this.height = height

    this.data = new Array(width * height).fill(new Color())
  }

  updateData(data: Array<Color>) {
    this.data = data
  }

  paintPixel(pixel: Pixel, color: Color) {
    if (!color.isEmpty()) {
      this.pallete.add(color)
    }
    this.data[pixel.y * this.width + pixel.x] = color
  }

  getPixelColor(pixel: Pixel): Color {
    return this.data[pixel.y * this.width + pixel.x]
  }

  getData(): Array<Color> {
    return this.data
  }

  getPallete(): Set<Color> {
    return this.pallete
  }

  clone(): Layer {
    return Object.assign(new Layer(this.width, this.height), this)
  }

  newAction(action: PastAction) {
    this.history.push(action)
    this.historyIdx++
  }
}
