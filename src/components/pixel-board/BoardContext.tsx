import {
  MouseEvent,
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useRef,
} from "react"
import { CanvasCache } from "./PixelData"

type BoardState = {
  width: number
  height: number
  cellsWidth: number
  cellsHeight: number
  cellScale: number
}

type BoardAction = {
  type: "resize"
  payload: number
}

type BoardContext = BoardState & {
  cache: CanvasCache
  color: string
  bg: "alpha" | string
  changeColor(newColor: string): void
  paintPixel(e: MouseEvent, ctx: CanvasRenderingContext2D): void
  erasePixel(e: MouseEvent, ctx: CanvasRenderingContext2D): void
  renderImage(ctx: CanvasRenderingContext2D): void
  renderBg(ctx: CanvasRenderingContext2D): void
}

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "resize":
      return {
        ...state,
        cellScale: action.payload,
      }
    default:
      return state
  }
}

const boardContext = createContext<BoardContext | null>(null)

export function BoardContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, {
    width: 400,
    height: 400,
    cellsWidth: 10,
    cellsHeight: 10,
    cellScale: 40,
  } as BoardState)
  const color = useRef<string>("#ff8800")
  const bg = useRef<"alpha" | string>("alpha")
  const cache = useRef<CanvasCache>(new CanvasCache(state.width, state.height))

  function changeColor(newColor: string) {
    color.current = newColor
  }

  function paintPixel(e: MouseEvent, ctx: CanvasRenderingContext2D) {
    const box = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top

    const xIdx = Math.floor(x / state.cellScale)
    const yIdx = Math.floor(y / state.cellScale)

    ctx.fillStyle = color.current
    ctx.fillRect(
      xIdx * state.cellScale,
      yIdx * state.cellScale,
      state.cellScale,
      state.cellScale
    )
  }

  function erasePixel(e: MouseEvent, ctx: CanvasRenderingContext2D) {
    const box = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - box.left
    const y = e.clientY - box.top

    const xIdx = Math.floor(x / state.cellScale)
    const yIdx = Math.floor(y / state.cellScale)

    ctx.clearRect(
      xIdx * state.cellScale,
      yIdx * state.cellScale,
      state.cellScale,
      state.cellScale
    )
  }

  function renderImage(ctx: CanvasRenderingContext2D) {
    ctx.putImageData(cache.current.getCacheData(), 0, 0)
  }

  function renderBg(ctx: CanvasRenderingContext2D) {
    let checker = 0
    for (let y = 0; y < state.cellsHeight; y++) {
      for (let x = 0; x < state.cellsWidth; x++) {
        if (checker % 2 === 0) {
          ctx.fillStyle = "#f8f8f8"
        } else {
          ctx.fillStyle = "#d8d8d8"
        }
        ctx.fillRect(
          x * state.cellScale,
          y * state.cellScale,
          state.cellScale,
          state.cellScale
        )
        checker++
      }
      checker += (state.cellsWidth % 2) + 1
    }
  }

  const initialContext: BoardContext = {
    ...state,
    cache: cache.current,
    color: color.current,
    bg: bg.current,
    changeColor,
    paintPixel,
    erasePixel,
    renderImage,
    renderBg,
  }

  return (
    <boardContext.Provider value={initialContext}>
      {children}
    </boardContext.Provider>
  )
}

export function useBoardContext() {
  const context = useContext(boardContext)

  if (!context) {
    throw new Error("useBoardContext must be used inside BoardContextProvider")
  }

  return context
}
