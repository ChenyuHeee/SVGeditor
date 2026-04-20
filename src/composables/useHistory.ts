import { ref } from 'vue'
import { useCanvas } from './useCanvas'

// 模块级历史栈 —— 避免多次调用时数据丢失
const historyStack: string[] = []
let historyIndex = -1
const canUndo = ref(false)
const canRedo = ref(false)
let _paused = false

const updateFlags = () => {
  canUndo.value = historyIndex > 0
  canRedo.value = historyIndex < historyStack.length - 1
}

export const useHistory = () => {
  const { canvas } = useCanvas()

  const saveState = () => {
    if (!canvas.value || _paused) return
    const json = JSON.stringify(canvas.value.toJSON())
    historyStack.splice(historyIndex + 1)
    historyStack.push(json)
    historyIndex++
    updateFlags()
  }

  const loadState = (json: string) => {
    if (!canvas.value) return
    _paused = true
    canvas.value.loadFromJSON(json, () => {
      canvas.value!.renderAll()
      _paused = false
    })
  }

  const undo = () => {
    if (historyIndex <= 0) return
    historyIndex--
    loadState(historyStack[historyIndex])
    updateFlags()
  }

  const redo = () => {
    if (historyIndex >= historyStack.length - 1) return
    historyIndex++
    loadState(historyStack[historyIndex])
    updateFlags()
  }

  const initHistory = () => {
    if (!canvas.value) return
    historyStack.length = 0
    historyIndex = -1
    saveState()
    canvas.value.on('object:added', saveState)
    canvas.value.on('object:removed', saveState)
    canvas.value.on('object:modified', saveState)
  }

  return { undo, redo, canUndo, canRedo, initHistory, saveState }
}