import { shallowRef, ref } from 'vue'
import { fabric } from 'fabric'

// 模块级单例 —— 所有 composable 调用共享同一 canvas 实例
const canvas = shallowRef<fabric.Canvas | null>(null)
export const selectedObject = shallowRef<fabric.Object | null>(null)
export const zoom = ref(1)
export const objectCount = ref(0)

export const useCanvas = () => {
  const initCanvas = (el: HTMLCanvasElement, width = 900, height = 650) => {
    if (canvas.value) canvas.value.dispose()

    const c = new fabric.Canvas(el, {
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: '#ffffff',
    })
    c.setWidth(width)
    c.setHeight(height)

    c.on('selection:created', ({ selected }) => {
      selectedObject.value = (selected as fabric.Object[])?.[0] ?? null
    })
    c.on('selection:updated', ({ selected }) => {
      selectedObject.value = (selected as fabric.Object[])?.[0] ?? null
    })
    c.on('selection:cleared', () => {
      selectedObject.value = null
    })
    // 对象属性变更后刷新属性面板
    c.on('object:modified', () => {
      if (selectedObject.value) {
        selectedObject.value = selectedObject.value  // trigger reactivity
      }
    })
    // 追踪对象数量（驱动 hint 显示）
    c.on('object:added', () => { objectCount.value = c.getObjects().length })
    c.on('object:removed', () => { objectCount.value = c.getObjects().length })

    canvas.value = c
    zoom.value = 1
    c.renderAll()
  }

  const disposeCanvas = () => {
    canvas.value?.dispose()
    canvas.value = null
    objectCount.value = 0
  }

  const setZoom = (newZoom: number, point?: fabric.Point) => {
    if (!canvas.value) return
    const clamped = Math.max(0.1, Math.min(5, newZoom))
    const center = point ?? new fabric.Point(
      canvas.value.getWidth() / 2,
      canvas.value.getHeight() / 2
    )
    canvas.value.zoomToPoint(center, clamped)
    zoom.value = clamped
  }

  const fitToScreen = () => {
    if (!canvas.value) return
    const objects = canvas.value.getObjects()
    if (objects.length === 0) { setZoom(1); return }
    const bounds = canvas.value.getObjects().reduce(
      (acc, obj) => {
        const b = obj.getBoundingRect()
        return {
          minX: Math.min(acc.minX, b.left),
          minY: Math.min(acc.minY, b.top),
          maxX: Math.max(acc.maxX, b.left + b.width),
          maxY: Math.max(acc.maxY, b.top + b.height),
        }
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    )
    const cw = canvas.value.getWidth()
    const ch = canvas.value.getHeight()
    const scaleX = cw / (bounds.maxX - bounds.minX + 80)
    const scaleY = ch / (bounds.maxY - bounds.minY + 80)
    setZoom(Math.min(scaleX, scaleY))
    canvas.value.viewportTransform = [zoom.value, 0, 0, zoom.value, 0, 0]
    canvas.value.renderAll()
  }

  const deleteSelected = () => {
    if (!canvas.value) return
    const active = canvas.value.getActiveObjects()
    active.forEach(o => canvas.value!.remove(o))
    canvas.value.discardActiveObject()
    canvas.value.renderAll()
  }

  const newCanvas = (width: number, height: number, bgColor: string) => {
    if (!canvas.value) return
    canvas.value.clear()
    canvas.value.setWidth(width)
    canvas.value.setHeight(height)
    canvas.value.set('backgroundColor', bgColor === 'transparent' ? '' : bgColor)
    canvas.value.setViewportTransform([1, 0, 0, 1, 0, 0])
    zoom.value = 1
    objectCount.value = 0
    canvas.value.renderAll()
  }

  return {
    canvas,
    selectedObject,
    zoom,
    initCanvas,
    disposeCanvas,
    setZoom,
    fitToScreen,
    deleteSelected,
    newCanvas,
  }
}