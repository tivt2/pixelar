import { Canvas } from "./components/drawing-board/Canvas"
import { CanvasContextProvider } from "./components/drawing-board/CanvasContext"
import { Tools } from "./components/drawing-board/Tools"

function App() {
  return (
    <CanvasContextProvider>
      <main className="flex h-screen w-full flex-row items-center justify-center gap-4 bg-green-200">
        <Canvas />
        <Tools />
      </main>
    </CanvasContextProvider>
  )
}

export default App
