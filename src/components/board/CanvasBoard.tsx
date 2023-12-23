import { useEffect, useRef } from "react"
import { Board } from "./Board"

export function CanvasBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const board = useRef<Board>(new Board())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }

    board.current.init({ canvas, ctx, width: 100, height: 100 })
  }, [canvasRef, board])

  return (
    <div className="border-2 border-black">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={(e) => board.current.startMouseAction(e)}
        onMouseMove={(e) => board.current.continueMouseAction(e)}
        onMouseUp={(e) => board.current.stopMouseAction(e)}
        onMouseLeave={(e) => board.current.stopMouseAction(e)}
        onWheel={(e) => board.current.wheelAction(e)}
      ></canvas>
    </div>
  )
}
