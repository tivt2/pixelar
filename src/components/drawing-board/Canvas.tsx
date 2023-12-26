import { MouseEvent, WheelEvent, useEffect, useRef } from "react"
import { ACTION } from "./tool-manager"
import { useCanvasContext } from "./CanvasContext"

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { board } = useCanvasContext()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }
    board.init({ canvas, ctx, width: 11, height: 6 })
  }, [canvasRef, board])

  function handleMouseDown(e: MouseEvent) {
    switch (e.button) {
      case 0:
        board.startAction(ACTION.DRAW, e)
        break
      case 1:
        board.startAction(ACTION.PAN, e)
        break
      case 2:
        board.startAction(ACTION.ERASE, e)
        break
    }
  }

  function handleMouseMove(e: MouseEvent) {
    board.continueAction(e)
  }

  function handleMouseUp(e: MouseEvent) {
    board.endActions(e)
  }

  function handleWheel(e: WheelEvent) {
    if (e.deltaY < 0) {
      board.startAction(ACTION.ZOOMIN, e)
    } else if (e.deltaY > 0) {
      board.startAction(ACTION.ZOOMOUT, e)
    }
    board.endActions(e)
  }

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="bg-cyan-100"
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    ></canvas>
  )
}
