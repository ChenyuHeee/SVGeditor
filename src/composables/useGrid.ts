import { ref } from 'vue'
import { fabric } from 'fabric'

export const gridEnabled = ref(false)
export const gridSize = ref(20)

let _canvas: fabric.Canvas | null = null
let _gridLines: fabric.Line[] = []

const drawGrid = () => {
  if (!_canvas) return
  clearGrid()
  if (!gridEnabled.value) return

  const gs = gridSize.value
  const w = _canvas.getWidth()
  const h = _canvas.getHeight()
  const opts = {
    stroke: '#d0d0e8',
    strokeWidth: 1,
    selectable: false,
    evented: false,
    excludeFromExport: true,
    hoverCursor: 'default',
  }

  for (let x = gs; x < w; x += gs) {
    const line = new fabric.Line([x, 0, x, h], opts)
    ;(line as any)._isGridLine = true
    _canvas.add(line)
    _canvas.sendToBack(line)
    _gridLines.push(line)
  }
  for (let y = gs; y < h; y += gs) {
    const line = new fabric.Line([0, y, w, y], opts)
    ;(line as any)._isGridLine = true
    _canvas.add(line)
    _canvas.sendToBack(line)
    _gridLines.push(line)
  }
  _canvas.renderAll()
}

const clearGrid = () => {
  if (!_canvas) return
  _gridLines.forEach(l => _canvas!.remove(l))
  _gridLines = []
}

export const initGrid = (canvas: fabric.Canvas) => {
  _canvas = canvas

  // Snap to grid when moving
  canvas.on('object:moving', (e) => {
    if (!gridEnabled.value) return
    const obj = e.target
    if (!obj || (obj as any)._isGridLine) return
    const gs = gridSize.value
    obj.set({
      left: Math.round((obj.left ?? 0) / gs) * gs,
      top: Math.round((obj.top ?? 0) / gs) * gs,
    })
  })
}

export const useGrid = () => {
  const toggleGrid = () => {
    gridEnabled.value = !gridEnabled.value
    drawGrid()
  }

  const setGridSize = (size: number) => {
    gridSize.value = size
    if (gridEnabled.value) drawGrid()
  }

  const refreshGrid = () => drawGrid()

  return { gridEnabled, gridSize, toggleGrid, setGridSize, refreshGrid }
}
