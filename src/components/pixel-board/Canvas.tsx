import {
  HTMLProps,
  MutableRefObject,
  RefObject,
  useEffect,
  useRef,
} from "react"
import { useBoardContext } from "./BoardContext"
import { CanvasObj } from "./PixelBoard"

type CanvasProps = HTMLProps<HTMLCanvasElement> & {
  obj: MutableRefObject<CanvasObj | null>
  init?: (ctx: CanvasRenderingContext2D) => void
}

export function Canvas({ obj, init, ...props }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { width, height, cellScale } = useBoardContext()

  useEffect(() => {
    function initializeCanvasObj(
      canvasRef: RefObject<HTMLCanvasElement>,
      objRef: MutableRefObject<CanvasObj | null>
    ) {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (ctx) {
          objRef.current = { canvas, ctx }
        }
      }
    }

    initializeCanvasObj(canvasRef, obj)
  }, [canvasRef, obj])

  useEffect(() => {
    if (obj.current && init) {
      const { ctx } = obj.current
      init(ctx)
    }
  }, [cellScale, obj, init])

  return (
    <canvas ref={canvasRef} {...props} width={width} height={height}></canvas>
  )
}
