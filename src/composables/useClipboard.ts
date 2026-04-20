import { fabric } from 'fabric'
import { useCanvas } from './useCanvas'

// 模块级剪贴板，跨操作保留
let _clipboard: fabric.Object | null = null

export const useClipboard = () => {
  const { canvas } = useCanvas()

  const copy = () => {
    if (!canvas.value) return
    const active = canvas.value.getActiveObject()
    if (!active) return
    active.clone((cloned: fabric.Object) => {
      _clipboard = cloned
    })
  }

  const paste = () => {
    if (!canvas.value || !_clipboard) return
    _clipboard.clone((cloned: fabric.Object) => {
      canvas.value!.discardActiveObject()
      cloned.set({ left: (cloned.left ?? 0) + 20, top: (cloned.top ?? 0) + 20, evented: true })
      if (cloned.type === 'activeSelection') {
        ;(cloned as fabric.ActiveSelection).canvas = canvas.value!
        ;(cloned as fabric.ActiveSelection).forEachObject((obj: fabric.Object) => {
          canvas.value!.add(obj)
        })
        cloned.setCoords()
      } else {
        canvas.value!.add(cloned)
      }
      canvas.value!.setActiveObject(cloned)
      canvas.value!.renderAll()
      // 下次粘贴再偏移
      _clipboard!.clone((next: fabric.Object) => {
        next.set({ left: (next.left ?? 0) + 20, top: (next.top ?? 0) + 20 })
        _clipboard = next
      })
    })
  }

  const duplicate = () => {
    copy()
    // copy 是异步clone，稍等一帧再粘贴
    requestAnimationFrame(() => paste())
  }

  const group = () => {
    if (!canvas.value) return
    const active = canvas.value.getActiveObject()
    if (!active || active.type !== 'activeSelection') return
    ;(active as fabric.ActiveSelection).toGroup()
    canvas.value.renderAll()
  }

  const ungroup = () => {
    if (!canvas.value) return
    const active = canvas.value.getActiveObject()
    if (!active || active.type !== 'group') return
    ;(active as fabric.Group).toActiveSelection()
    canvas.value.discardActiveObject()
    canvas.value.renderAll()
  }

  return { copy, paste, duplicate, group, ungroup }
}
