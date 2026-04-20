<template>
  <div
    class="canvas-wrapper"
    ref="wrapperRef"
    @wheel.prevent="onWheel"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <canvas ref="canvasEl" />
    <div class="canvas-hint" v-if="showHint">
      拖放 SVG 文件到这里，或点击工具栏「打开」按钮
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { fabric } from 'fabric'
import { useCanvas, objectCount } from '../composables/useCanvas'
import { useHistory } from '../composables/useHistory'
import { useDrawTools } from '../composables/useDrawTools'
import { useSVGLoader } from '../composables/useSVGLoader'
import { useExport } from '../composables/useExport'
import { useClipboard } from '../composables/useClipboard'

// 供 Ctrl+N 使用，触发 Toolbar 的对话框
const emit = defineEmits<{ (e: 'new-canvas'): void }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const wrapperRef = ref<HTMLDivElement | null>(null)

const { canvas, initCanvas, disposeCanvas, setZoom, zoom, fitToScreen } = useCanvas()
const { initHistory, undo, redo } = useHistory()
const { bindCanvasEvents, setTool } = useDrawTools()
const { loadSVGFromFile } = useSVGLoader()
const { exportSVG } = useExport()
const { copy, paste, duplicate, group, ungroup } = useClipboard()

const showHint = computed(() => objectCount.value === 0)

const onWheel = (e: WheelEvent) => {
  if (!canvas.value) return
  const point = new fabric.Point(e.offsetX, e.offsetY)
  setZoom(zoom.value * (e.deltaY > 0 ? 0.9 : 1.1), point)
}

const onDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type === 'image/svg+xml') loadSVGFromFile(file)
}

const isMod = (e: KeyboardEvent) => e.ctrlKey || e.metaKey

const onKeyDown = (e: KeyboardEvent) => {
  const tag = (e.target as HTMLElement).tagName
  const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable
  if (!canvas.value) return

  // ── Ctrl / Cmd 组合键（输入框内也拦截部分浏览器默认行为）──────────────
  if (isMod(e)) {
    switch (e.key.toLowerCase()) {
      case 'n':
        e.preventDefault()
        emit('new-canvas')
        return
      case 'z':
        e.preventDefault()
        e.shiftKey ? redo() : undo()
        return
      case 'y':
        e.preventDefault()
        redo()
        return
      case 'a':
        if (inInput) return
        e.preventDefault()
        canvas.value.setActiveObject(
          new fabric.ActiveSelection(canvas.value.getObjects(), { canvas: canvas.value })
        )
        canvas.value.renderAll()
        return
      case 'c':
        if (inInput) return
        copy()
        return
      case 'v':
        if (inInput) return
        e.preventDefault()
        paste()
        return
      case 'd':
        if (inInput) return
        e.preventDefault()
        duplicate()
        return
      case 'g':
        if (inInput) return
        e.preventDefault()
        e.shiftKey ? ungroup() : group()
        return
      case 's':
        e.preventDefault()
        exportSVG()
        return
      case '=':
      case '+':
        e.preventDefault()
        setZoom(zoom.value * 1.2)
        return
      case '-':
        e.preventDefault()
        setZoom(zoom.value / 1.2)
        return
      case '0':
        e.preventDefault()
        fitToScreen()
        return
    }
  }

  // ── 以下快捷键不应在输入框内响应 ──────────────────────────────────────
  if (inInput) return

  // 删除
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const active = canvas.value.getActiveObjects()
    if (!active.length) return
    e.preventDefault()
    active.forEach(o => canvas.value!.remove(o))
    canvas.value.discardActiveObject()
    canvas.value.renderAll()
    return
  }

  // 取消选择
  if (e.key === 'Escape') {
    canvas.value.discardActiveObject()
    canvas.value.renderAll()
    return
  }

  // 工具切换：V R E L T P/F
  const toolMap: Record<string, any> = {
    v: 'select', r: 'rect', e: 'ellipse',
    l: 'line', t: 'text', p: 'freehand', f: 'freehand',
  }
  if (!e.altKey && !e.shiftKey && e.key.toLowerCase() in toolMap) {
    setTool(toolMap[e.key.toLowerCase()])
    return
  }

  // 方向键微移（Shift = 10px）
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    const active = canvas.value.getActiveObject()
    if (!active) return
    e.preventDefault()
    const d = e.shiftKey ? 10 : 1
    if (e.key === 'ArrowUp')    active.set('top',  (active.top  ?? 0) - d)
    if (e.key === 'ArrowDown')  active.set('top',  (active.top  ?? 0) + d)
    if (e.key === 'ArrowLeft')  active.set('left', (active.left ?? 0) - d)
    if (e.key === 'ArrowRight') active.set('left', (active.left ?? 0) + d)
    active.setCoords()
    canvas.value.renderAll()
  }
}

onMounted(() => {
  if (!canvasEl.value || !wrapperRef.value) return
  const { width, height } = wrapperRef.value.getBoundingClientRect()
  initCanvas(canvasEl.value, Math.floor(width) || 900, Math.floor(height - 2) || 650)
  initHistory()
  bindCanvasEvents()
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  disposeCanvas()
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.canvas-wrapper {
  flex: 1;
  background: #13131f;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
}

.canvas-hint {
  position: absolute;
  color: #3a3a5a;
  font-size: 14px;
  pointer-events: none;
  text-align: center;
  line-height: 2;
}
</style>