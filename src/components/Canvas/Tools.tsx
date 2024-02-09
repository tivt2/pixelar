import { ChangeEvent, useEffect, useState } from "react"
import { useCanvasContext } from "./CanvasContext"
import { Layer } from "../../services/drawing-board/layer"
import { Frame } from "../../services/drawing-board/frame"

export function Tools() {
  const { board } = useCanvasContext()
  const [localColor, setLocalColor] = useState("")
  const [frames, setFrames] = useState<Frame[]>([])
  const [localFrame, setLocalFrame] = useState(0)
  const [layers, setLayers] = useState<Layer[]>([])
  const [localLayer, setLocalLayer] = useState(0)

  useEffect(() => {
    if (!board) {
      return
    }
    const frame = board.currFrame()
    if (!frame) {
      return
    }
    setLocalColor(board.getColor().hex())
    setFrames(board.getFrames().reverse())
    setLocalFrame(board.currFrameIdx())
    setLayers(frame.getLayers().reverse())
    setLocalLayer(frame.currLayerIdx)
  }, [board])

  function handleChangeColor(e: ChangeEvent<HTMLInputElement>) {
    setLocalColor(e.target.value)
    board.getColor().change(e.target.value)
  }

  function handleChangeFrame(idx: number) {
    return function () {
      board.changeFrame(idx)
      setLocalFrame(idx)
      setLayers(board.currFrame().getLayers())
      setLocalLayer(board.currFrame().currLayerIdx)
    }
  }

  function handleNewFrame() {
    board.createFrame()
    setFrames(board.getFrames().reverse())
    setLocalFrame((old) => old + 1)
    setLayers(board.currFrame().getLayers())
    setLocalLayer(board.currFrame().currLayerIdx)
  }

  function handleChangeLayer(idx: number) {
    return function () {
      board.currFrame().changeLayer(idx)
      setLocalLayer(idx)
    }
  }

  function handleNewLayer() {
    board.currFrame().createLayer()
    setLayers(board.currFrame().getLayers().reverse())
    setLocalLayer((old) => old + 1)
  }

  return (
    <div>
      <input type="color" value={localColor} onChange={handleChangeColor} />
      <div className="flex flex-row gap-2">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleNewFrame}
            className="rounded-lg border-2 border-black bg-white px-3"
          >
            new frame
          </button>
          {frames.map((_, i) => {
            const idx = frames.length - 1 - i
            return (
              <div
                key={i}
                onClick={handleChangeFrame(idx)}
                className={`cursor-pointer rounded-lg border-2 border-black ${
                  idx === localFrame ? "bg-red-200" : "bg-white"
                } px-3`}
              >
                frame {idx}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleNewLayer}
            className="rounded-lg border-2 border-black bg-white px-3"
          >
            new layer
          </button>
          {layers.map((_, i) => {
            const idx = layers.length - 1 - i
            return (
              <div
                key={i}
                onClick={handleChangeLayer(idx)}
                className={`cursor-pointer rounded-lg border-2 border-black ${
                  idx === localLayer ? "bg-red-200" : "bg-white"
                } px-3`}
              >
                layer {idx}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
