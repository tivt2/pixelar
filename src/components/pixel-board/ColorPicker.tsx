import { ChangeEvent, useState } from "react"
import { useBoardContext } from "./BoardContext"

export function ColorPicker() {
  const { color, cache, changeColor } = useBoardContext()
  const [localColor, setLocalColor] = useState(color)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setLocalColor(e.target.value)
    changeColor(e.target.value)
  }

  return (
    <div className="flex items-center justify-center">
      <input type="color" value={localColor} onChange={handleChange} />
      <button
        className="rounded border border-black bg-white p-1"
        onClick={() => console.log(cache.getCacheData())}
      >
        print data
      </button>
    </div>
  )
}
