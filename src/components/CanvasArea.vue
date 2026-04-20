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

const canvasEl = ref<HTMLCanvasElement | null>(null)
const wrapperRef = ref<HTMLDivElement | null>(null)

const { canvas, initCanvas, disposeCanvas, setZoom, zoom, selectedObject } = useCanvas()
const { initHistory } = useHistory()
const { bindCanvasEvents } = useDrawTools()
const { loadSVGFromFile } = useSVGLoader()

const showHint = computed(() => objectCount.value === 0)

const onWheel = (e: WheelEvent) => {
  if (!canvas.value) return
  const delta = e.deltaY
  const point = new fabric.Point(e.offsetX, e.offsetY)
  setZoom(zoom.value * (delta > 0 ? 0.9 : 1.1), point)
}

const onDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type === 'image/svg+xml') loadSVGFromFile(file)
}

const onKeyDown = (e: KeyboardEvent) => {
  if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
  if (!canvas.value) return

  if (e.key === 'Delete' || e.key === 'Backspace') {
    const active = canvas.value.getActiveObjects()
    active.forEach(o => canvas.value!.remove(o))
    canvas.value.discardActiveObject()
    canvas.value.renderAll()
  }

  if (e.key === 'Escape') {
    canvas.value.discardActiveObject()
    canvas.value.renderAll()
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
    e.preventDefault()
    canvas.value.setActiveObject(
      new fabric.ActiveSelection(canvas.value.getObjects(), { canvas: canvas.value })
    )
    canvas.value.renderAll()
  }

  // Arrow key nudge
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    const active = canvas.value.getActiveObject()
    if (!active) return
    e.preventDefault()
    const d = e.shiftKey ? 10 : 1
    if (e.key === 'ArrowUp') active.set('top', (active.top ?? 0) - d)
    if (e.key === 'ArrowDown') active.set('top', (active.top ?? 0) + d)
    if (e.key === 'ArrowLeft') active.set('left', (active.left ?? 0) - d)
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