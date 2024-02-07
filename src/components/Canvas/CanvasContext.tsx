import { ReactNode, createContext, useContext, useRef } from "react"
import { BoardFacade } from "../../services/drawing-board/board-facade"

type CanvasContext = {
  board: BoardFacade
}

const canvasContext = createContext<CanvasContext | null>(null)

export function CanvasContextProvider({ children }: { children: ReactNode }) {
  const board = useRef<BoardFacade>(new BoardFacade())

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
