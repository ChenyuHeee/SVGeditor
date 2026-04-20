import { ref } from 'vue'
import { fabric } from 'fabric'
import { useCanvas } from './useCanvas'

export type ToolType = 'select' | 'rect' | 'ellipse' | 'line' | 'arrow' | 'text' | 'freehand'

// 模块级单例
const activeTool = ref<ToolType>('select')

export const useDrawTools = () => {
  const { canvas } = useCanvas()

  let _drawing = false
  let _startX = 0
  let _startY = 0
  let _shape: fabric.Object | null = null

  const setTool = (tool: ToolType) => {
    activeTool.value = tool
    if (!canvas.value) return

    if (tool === 'freehand') {
      canvas.value.isDrawingMode = true
      canvas.value.freeDrawingBrush.width = 2
      canvas.value.freeDrawingBrush.color = '#333333'
      canvas.value.selection = false
      canvas.value.defaultCursor = 'crosshair'
    } else {
      canvas.value.isDrawingMode = false
      canvas.value.selection = tool === 'select'
      canvas.value.defaultCursor = tool === 'select' ? 'default' : 'crosshair'
    }
  }

  const onMouseDown = (opt: fabric.IEvent) => {
    if (!canvas.value) return
    const tool = activeTool.value
    if (tool === 'select' || tool === 'freehand') return

    const p = canvas.value.getPointer(opt.e)
    _startX = p.x
    _startY = p.y
    _drawing = true

    if (tool === 'text') {
      const text = new fabric.IText('双击编辑', {
        left: _startX,
        top: _startY,
        fontSize: 20,
        fontFamily: 'Arial',
        fill: '#333333',
      })
      canvas.value.add(text)
      canvas.value.setActiveObject(text)
      canvas.value.renderAll()
      setTool('select')
      _drawing = false
      return
    }

    if (tool === 'rect') {
      _shape = new fabric.Rect({
        left: _startX, top: _startY,
        width: 1, height: 1,
        fill: 'rgba(100,149,237,0.3)',
        stroke: '#4169E1',
        strokeWidth: 1.5,
        selectable: false,
      })
    } else if (tool === 'ellipse') {
      _shape = new fabric.Ellipse({
        left: _startX, top: _startY,
        rx: 1, ry: 1,
        fill: 'rgba(100,149,237,0.3)',
        stroke: '#4169E1',
        strokeWidth: 1.5,
        selectable: false,
      })
    } else if (tool === 'line') {
      _shape = new fabric.Line([_startX, _startY, _startX, _startY], {
        stroke: '#333333',
        strokeWidth: 2,
        selectable: false,
      })
    } else if (tool === 'arrow') {
      _shape = new fabric.Line([_startX, _startY, _startX, _startY], {
        stroke: '#333333',
        strokeWidth: 2,
        selectable: false,
      })
    }

    if (_shape) canvas.value.add(_shape)
  }

  const onMouseMove = (opt: fabric.IEvent) => {
    if (!_drawing || !_shape || !canvas.value) return
    const p = canvas.value.getPointer(opt.e)
    const w = p.x - _startX
    const h = p.y - _startY

    if (_shape instanceof fabric.Rect) {
      _shape.set({
        left: w < 0 ? p.x : _startX,
        top: h < 0 ? p.y : _startY,
        width: Math.abs(w),
        height: Math.abs(h),
      })
    } else if (_shape instanceof fabric.Ellipse) {
      _shape.set({
        left: w < 0 ? p.x : _startX,
        top: h < 0 ? p.y : _startY,
        rx: Math.abs(w) / 2,
        ry: Math.abs(h) / 2,
      })
    } else if (_shape instanceof fabric.Line) {
      _shape.set({ x2: p.x, y2: p.y })
    }
    canvas.value.renderAll()
  }

  const onMouseUp = () => {
    if (!_drawing || !canvas.value) return
    _drawing = false
    if (_shape) {
      _shape.set({ selectable: true, evented: true })
      canvas.value.setActiveObject(_shape)
      _shape = null
    }
    canvas.value.renderAll()
    setTool('select')
  }

  const bindCanvasEvents = () => {
    if (!canvas.value) return
    canvas.value.on('mouse:down', onMouseDown)
    canvas.value.on('mouse:move', onMouseMove)
    canvas.value.on('mouse:up', onMouseUp)
  }

  return { activeTool, setTool, bindCanvasEvents }
}
