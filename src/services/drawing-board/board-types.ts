export type RGBA = [number, number, number, number]

export class Color {
  private _hex: string

  constructor(hex: string) {
    if (this.validateHex(hex)) {
      this._hex = hex
    } else {
      this._hex = ""
    }
  }

  private validateHex(color: string): boolean {
    // VALIDATE the `color` input as a valid hex (e.g.: #FF8800)
    // values must also be from 00 to FF
    return color[0] === "#"
  }

  static toRGBA(color: Color): RGBA {
    if (color._hex === "") {
      return [0, 0, 0, 0]
    }
    const decimal = parseInt(color._hex.slice(1), 16)

    const r = (decimal >> 16) & 255
    const g = (decimal >> 8) & 255
    const b = decimal & 255
    const a = 255
    return [r, g, b, a]
  }

  hex(): string {
    return this._hex
  }

  change(color: string) {
    if (this.validateHex(color)) {
      this._hex = color
    }
  }

  isEqual(hex: string): boolean {
    return this._hex === hex
  }
}

export type Position = { x: number; y: number }
export type Pixel = { xIdx: number; yIdx: number }

export type PixelState = {
  layerIdx: number
  color: Color
} | null
export type ImageState = Array<PixelState>
