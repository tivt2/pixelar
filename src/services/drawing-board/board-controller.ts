import { MouseEvent, SyntheticEvent } from "react"
import { BoardState } from "./board-state"
import { Pixel, Position } from "./board-types"
import { BoardTool, Draw, Erase, FloodFill, Pan, Zoom } from "./board-tools"
import { BoardRenderer } from "./board-renderer"

export const ACTION = {
  DRAW: "DRAW",
  ERASE: "ERASE",
  PAN: "PAN",
  ZOOMIN: "ZOOMIN",
  ZOOMOUT: "ZOOMOUT",
  FLOODFILL: "FLOODFILL",
} as const

export type Action = keyof typeof ACTION

export class BoardController {
  private boardState: BoardState
  private boardRenderer: BoardRenderer

  private currentTool: BoardTool | null = null
  private tools: Record<Action, BoardTool> = {} as Record<Action, BoardTool>

  constructor(boardState: BoardState, boardRenderer: BoardRenderer) {
    this.boardState = boardState
    this.boardRenderer = boardRenderer
    this.tools = {
      DRAW: new Draw(),
      ERASE: new Erase(),
      PAN: new Pan(),
      ZOOMIN: new Zoom(1.04),
      ZOOMOUT: new Zoom(0.96),
      FLOODFILL: new FloodFill(),
    }
  }

  setTool(action: Action) {
    this.currentTool = this.tools[action]
  }
  getCurrent(): BoardTool | null {
    return this.currentTool
  }

  startAction(e: SyntheticEvent) {
    if (this.currentTool) {
      this.currentTool.start(e, this.boardState, this.boardRenderer, this)
    }
  }
  continueAction(e: SyntheticEvent) {
    if (this.currentTool) {
      this.currentTool.continue(e, this.boardState, this.boardRenderer, this)
    }
  }
  endAction(e: SyntheticEvent) {
    if (this.currentTool) {
      this.currentTool.end(e, this.boardState, this.boardRenderer, this)
      this.currentTool = null
    }
  }

  getMousePosition(e: MouseEvent): Position {
    const box = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top
    return { x, y }
  }

  getMouseOffsetPosition(e: MouseEvent): Position {
    const { x, y } = this.getMousePosition(e)
    return {
      x: Math.floor(x - this.boardState.offsetX),
      y: Math.floor(y - this.boardState.offsetY),
    }
  }

  getPixelIndexes(x: number, y: number): Pixel | null {
    const scale = this.boardState.getScale()
    const xIdx = Math.floor(x / scale)
    const yIdx = Math.floor(y / scale)
    if (
      xIdx < 0 ||
      xIdx >= this.boardState.width ||
      yIdx < 0 ||
      yIdx >= this.boardState.height
    ) {
      return null
    }
    return { xIdx, yIdx }
  }
}
