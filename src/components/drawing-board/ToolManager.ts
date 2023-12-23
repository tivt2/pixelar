import { SyntheticEvent } from "react"
import { DrawingBoardState } from "./DrawingBoard"
import { Draw, Erase, Pan, Zoom } from "./BoardTools"

export const ACTION = {
  DRAW: "DRAW",
  ERASE: "ERASE",
  PAN: "PAN",
  ZOOMIN: "ZOOMIN",
  ZOOMOUT: "ZOOMOUT",
} as const

export type Action = keyof typeof ACTION

export interface BoardTool {
  start(e: SyntheticEvent, state: DrawingBoardState): void
  continue(e: SyntheticEvent, state: DrawingBoardState): void
  end(e: SyntheticEvent, state: DrawingBoardState): void
}
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
  startAction(e: SyntheticEvent, state: DrawingBoardState) {
    if (this.currentTool) {
      this.currentTool.start(e, state)
    }
  }
  continueAction(e: SyntheticEvent, state: DrawingBoardState) {
    if (this.currentTool) {
      this.currentTool.continue(e, state)
    }
  }
  endAction(e: SyntheticEvent, state: DrawingBoardState) {
    if (this.currentTool) {
      this.currentTool.end(e, state)
      this.currentTool = null
    }
  }
}