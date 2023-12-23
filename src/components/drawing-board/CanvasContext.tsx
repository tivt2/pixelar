import { ReactNode, createContext, useContext, useRef } from "react"
import { DrawingBoard } from "./DrawingBoard"

type CanvasContext = {
  board: DrawingBoard
}

const canvasContext = createContext<CanvasContext | null>(null)

export function CanvasContextProvider({ children }: { children: ReactNode }) {
  const board = useRef<DrawingBoard>(new DrawingBoard())

  const initialContext: CanvasContext = {
    board: board.current,
  }

  return (
    <canvasContext.Provider value={initialContext}>
      {children}
    </canvasContext.Provider>
  )
}

export function useCanvasContext() {
  const context = useContext(canvasContext)

  if (!context) {
    throw new Error(
      "useCanvasContext must be used inside CanvasContextProvider"
    )
  }

  return context
}
