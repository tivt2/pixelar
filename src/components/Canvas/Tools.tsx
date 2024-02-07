import { ChangeEvent, useEffect, useState } from "react"
import { useCanvasContext } from "./CanvasContext"
import { Layer } from "../../services/drawing-board/layer"

export function Tools() {
  const { board } = useCanvasContext()
  const [localColor, setLocalColor] = useState("")
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
    setLayers(frame.getLayers().reverse())
    setLocalLayer(frame.currLayerIdx)
  }, [board])

  function handleChangeColor(e: ChangeEvent<HTMLInputElement>) {
    setLocalColor(e.target.value)
    board.getColor().change(e.target.value)
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
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleNewLayer}
          className="rounded-lg border-2 border-black bg-white px-3"
        >
          new layer
        </button>
        {layers.map((_, i) => {
          const idx = board.currFrame().getLayers().length - 1 - i
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
  )
}
