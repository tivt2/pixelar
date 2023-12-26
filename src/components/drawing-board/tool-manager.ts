import { SyntheticEvent } from "react"
import { DrawingBoard } from "./drawing-board"
import { BoardTool, Draw, Erase, Pan, Zoom } from "./board-tools"

export const ACTION = {
  DRAW: "DRAW",
  ERASE: "ERASE",
  PAN: "PAN",
  ZOOMIN: "ZOOMIN",
  ZOOMOUT: "ZOOMOUT",
} as const

export type Action = keyof typeof ACTION

export class ToolManager {
  private currentTool: BoardTool | null = null
  private tools: Record<Action, BoardTool> = {} as Record<Action, BoardTool>

  constructor() {
    this.tools = {
      DRAW: new Draw(),
      ERASE: new Erase(),
      PAN: new Pan(),
      ZOOMIN: new Zoom(1.04),
      ZOOMOUT: new Zoom(0.96),
    }
  }

  setTool(action: Action) {
    this.currentTool = this.tools[action]
  }
  getCurrent(): BoardTool | null {
    return this.currentTool
  }
  startAction(e: SyntheticEvent, board: DrawingBoard) {
    if (this.currentTool) {
      this.currentTool.start(e, board)
    }
  }
  continueAction(e: SyntheticEvent, board: DrawingBoard) {
    if (this.currentTool) {
      this.currentTool.continue(e, board)
    }
  }
  endAction(e: SyntheticEvent, board: DrawingBoard) {
    if (this.currentTool) {
      this.currentTool.end(e, board)
      this.currentTool = null
    }
  }
}
