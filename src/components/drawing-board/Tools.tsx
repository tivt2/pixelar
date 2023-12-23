import { ChangeEvent, useEffect, useState } from "react"
import { useCanvasContext } from "./CanvasContext"
import { Layer } from "./Layer"

export function Tools() {
  const { board } = useCanvasContext()
  const [localColor, setLocalColor] = useState("")
  const [layers, setLayers] = useState<Layer[]>([])
  const [localLayer, setLocalLayer] = useState(0)

  useEffect(() => {
    setLocalColor(board.getColor())
    setLayers(board.getLayers().reverse())
    setLocalLayer(board.getCurrLayer())
  }, [board])

  function handleChangeColor(e: ChangeEvent<HTMLInputElement>) {
    setLocalColor(e.target.value)
    board.setColor(e.target.value)
  }

  function handleChangeLayer(idx: number) {
    return function () {
      board.changeLayer(idx)
      setLocalLayer(idx)
    }
  }

  function handleNewLayer() {
    board.createLayer()
    setLayers(board.getLayers().reverse())
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
          const idx = board.getLayers().length - 1 - i
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
