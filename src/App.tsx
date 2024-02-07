import { Canvas } from "./components/Canvas/Canvas"
import { CanvasContextProvider } from "./components/Canvas/CanvasContext"
import { Tools } from "./components/Canvas/Tools"

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
