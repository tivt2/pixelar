import { MouseEvent, useRef } from "react"
import { useBoardContext } from "./BoardContext"
import { Canvas } from "./Canvas"

export type CanvasObj = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
}

export function PixelBoard() {
  const effects = useRef<CanvasObj | null>(null)
  const pixels = useRef<CanvasObj | null>(null)
  const bg = useRef<CanvasObj | null>(null)

  const { cache, paintPixel, erasePixel, renderImage, renderBg } =
    useBoardContext()
  const action = useRef<"drawing" | "erasing" | null>(null)

  function handleMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      action.current = "drawing"
    } else if (e.button === 2) {
      action.current = "erasing"
    }
    handleMouseMove(e)
  }

  function handleMouseMove(e: MouseEvent) {
    if (!pixels.current) {
      return
    }

    const { ctx } = pixels.current

    switch (action.current) {
      case "drawing":
        paintPixel(e, ctx)
        break
      case "erasing":
        erasePixel(e, ctx)
        break
    }
  }

  function handleMouseUp() {
    action.current = null
    if (pixels.current) {
      const { canvas, ctx } = pixels.current
      cache.updateCache(ctx.getImageData(0, 0, canvas.width, canvas.height))
    }
  }

  return (
    <div className="relative border-2 border-black bg-red-200">
      <Canvas
        obj={effects}
        className="absolute left-0 top-0 z-20 bg-transparent"
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <Canvas
        obj={pixels}
        init={renderImage}
        className="absolute left-0 top-0 z-10 bg-transparent"
      />
      <Canvas obj={bg} init={renderBg} className="" />
    </div>
  )
}
