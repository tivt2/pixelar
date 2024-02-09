import { SyntheticEvent } from "react"
import { BoardController } from "./board-controller"
import { BoardRenderer } from "./board-renderer"
import { BoardConfig, BoardState } from "./board-state"
import { Action } from "./board-controller"
import { Frame } from "./frame"
import { Color } from "./board-types"

export type BoardPublicState = {}

export class BoardFacade {
  private _state: BoardState
  private renderer: BoardRenderer
  private controller: BoardController

  constructor() {
    this._state = new BoardState()
    this.renderer = new BoardRenderer(this._state)
    this.controller = new BoardController(this._state, this.renderer)
  }

  init(boardConfig: BoardConfig) {
    this._state.init(boardConfig)
    this.renderer.init()
  }

  startAction(action: Action, e: SyntheticEvent) {
    this.controller.setTool(action)
    this.controller.startAction(e)
  }

  continueAction(e: SyntheticEvent) {
    if (this.controller.getCurrent()) {
      this.controller.continueAction(e)
    }
  }

  endActions(e: SyntheticEvent) {
    if (this.controller.getCurrent()) {
      this.controller.endAction(e)
    }
  }

  getState(): BoardPublicState {
    return {}
  }

  getColor(): Color {
    return this._state.color
  }

  currFrame(): Frame {
    return this._state.currFrame()
  }
  currFrameIdx(): number {
    return this._state.currFrameIdx
  }
  getFrames(): Array<Frame> {
    return this._state.frames.slice()
  }
  changeFrame(idx: number) {
    if (idx < 0 || idx >= this._state.frames.length) {
      return
    }

    this._state.currFrameIdx = idx
    this.renderer.rerender()
  }

  createFrame() {
    this._state.createFrame()
    this.renderer.rerender()
  }
}
