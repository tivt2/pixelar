import { BoardState } from "./board-state"
import { Color } from "./board-types"
import { Frame } from "./frame"

export class BoardRenderer {
  private _state: BoardState

  constructor(state: BoardState) {
    this._state = state
  }

  init() {
    this.drawBG()

    this.clearBoard()
    this.renderBG()
    this.renderEffects()
  }

  clearBoard() {
    this._state.ctx.clearRect(
      -this._state.offsetX,
      -this._state.offsetY,
      this._state.canvas.width,
      this._state.canvas.height
    )
  }

  renderEffects() {
    this.renderBorder()
  }

  renderBorder() {
    const scale = this._state.getScale()
    this._state.ctx.lineWidth = 2
    this._state.ctx.strokeStyle = "black"
    this._state.ctx.strokeRect(
      -1,
      -1,
      this._state.width * scale + 2,
      this._state.height * scale + 2
    )
  }

  drawBG() {
    for (let y = 0; y < this._state.bg.canvas.height; y++) {
      for (let x = 0; x < this._state.bg.canvas.width; x++) {
        if ((x + y) % 2 === 0) {
          this._state.bg.paintPixel(x, y, new Color("#dddddd"))
        } else {
          this._state.bg.paintPixel(x, y, new Color("#bbbbbb"))
        }
      }
    }
  }

  renderBG() {
    const scale = this._state.getScale()
    this._state.ctx.drawImage(
      this._state.bg.canvas,
      0,
      0,
      this._state.width * scale,
      this._state.height * scale
    )
  }

  renderFrame(frame: Frame) {
    const scale = this._state.getScale()
    this._state.ctx.drawImage(
      frame.canvas,
      0,
      0,
      this._state.width * scale,
      this._state.height * scale
    )
  }

  renderPixel(xIdx: number, yIdx: number, color: Color) {
    const scale = this._state.getScale()
    this._state.ctx.fillStyle = color.hex()
    this._state.ctx.fillRect(xIdx * scale, yIdx * scale, scale, scale)
  }

  clearPixel(xIdx: number, yIdx: number) {
    const bgColor = this._state.bg.getPixelColor(xIdx, yIdx)
    this.renderPixel(xIdx, yIdx, bgColor)
  }

  rerender() {
    this.clearBoard()
    this.renderBG()
    this.renderFrame(this._state.frames[this._state.currFrameIdx])
    this.renderEffects()
  }

  generateBackground() {
    let checker = 0
    for (let y = 0; y < this._state.height; y++) {
      for (let x = 0; x < this._state.width; x++) {
        if (checker % 2 === 0) {
          this._state.bg.paintPixel(x, y, new Color("#dddddd"))
        } else {
          this._state.bg.paintPixel(x, y, new Color("#bbbbbb"))
        }
        checker++
      }
      checker += (this._state.width % 2) + 1
    }
    this._state.ctx.fillStyle
  }
}
