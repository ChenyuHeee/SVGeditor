<template>
  <div class="layer-panel">
    <div class="layer-header">
      <span>图层</span>
      <span class="layer-count">{{ layers.length }}</span>
    </div>
    <div class="layer-list">
      <div
        v-for="(layer, i) in layers"
        :key="layer.id"
        :class="['layer-item', { active: layer.isActive }]"
        @click="selectLayer(layer)"
      >
        <div class="layer-thumb">
          <canvas :ref="el => drawThumb(el as HTMLCanvasElement, layer.obj)" width="24" height="24" />
        </div>
        <span class="layer-name">{{ layer.name }}</span>
        <div class="layer-actions">
          <button title="上移" @click.stop="moveUp(i)" :disabled="i === 0">↑</button>
          <button title="下移" @click.stop="moveDown(i)" :disabled="i === layers.length - 1">↓</button>
          <button
            title="显示/隐藏"
            @click.stop="toggleVisible(layer)"
            :class="{ dim: !layer.visible }"
          >{{ layer.visible ? '👁' : '🚫' }}</button>
        </div>
      </div>
      <div v-if="layers.length === 0" class="layer-empty">暂无对象</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { fabric } from 'fabric'
import { useCanvas, selectedObject } from '../composables/useCanvas'

interface LayerItem {
  id: number
  name: string
  obj: fabric.Object
  isActive: boolean
  visible: boolean
}

const { canvas } = useCanvas()
const layers = ref<LayerItem[]>([])
let _uid = 0

const getTypeName = (obj: fabric.Object) => {
  const map: Record<string, string> = {
    rect: '矩形', ellipse: '椭圆', circle: '圆', line: '直线',
    path: '路径', 'i-text': '文字', text: '文字', textbox: '文字',
    group: '组合', image: '图片', triangle: '三角形', polygon: '多边形',
  }
  return map[obj.type ?? ''] ?? obj.type ?? '对象'
}

const rebuildLayers = () => {
  if (!canvas.value) { layers.value = []; return }
  const objs = canvas.value.getObjects().filter(o => !(o as any)._isGridLine)
  const active = canvas.value.getActiveObject()
  // Reverse so top layer is at top of list
  layers.value = [...objs].reverse().map(obj => {
    const existing = layers.value.find(l => l.obj === obj)
    return {
      id: existing?.id ?? _uid++,
      name: (obj as any)._layerName ?? getTypeName(obj),
      obj,
      isActive: active === obj || (active?.type === 'activeSelection' &&
        (active as fabric.ActiveSelection).contains(obj as any)),
      visible: obj.visible !== false,
    }
  })
}

const selectLayer = (layer: LayerItem) => {
  if (!canvas.value) return
  canvas.value.setActiveObject(layer.obj)
  canvas.value.requestRenderAll()
}

const moveUp = (i: number) => {
  if (!canvas.value) return
  // i=0 is top layer visually, so moveUp = bringForward in fabric
  const obj = layers.value[i].obj
  canvas.value.bringForward(obj)
  canvas.value.renderAll()
  rebuildLayers()
}

const moveDown = (i: number) => {
  if (!canvas.value) return
  const obj = layers.value[i].obj
  canvas.value.sendBackwards(obj)
  canvas.value.renderAll()
  rebuildLayers()
}

const toggleVisible = (layer: LayerItem) => {
  layer.obj.set('visible', !layer.obj.visible)
  layer.visible = layer.obj.visible !== false
  canvas.value?.renderAll()
}

const drawThumb = (el: HTMLCanvasElement | null, obj: fabric.Object) => {
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, 24, 24)
  try {
    const b = obj.getBoundingRect(true)
    const scale = Math.min(20 / (b.width || 1), 20 / (b.height || 1))
    ctx.save()
    ctx.translate(2, 2)
    ctx.scale(scale, scale)
    ctx.translate(-b.left, -b.top)
    obj.render(ctx)
    ctx.restore()
  } catch (_) {}
}

let cleanup: (() => void) | null = null

onMounted(() => {
  const sync = () => rebuildLayers()
  const events = ['object:added','object:removed','object:modified','selection:created','selection:updated','selection:cleared']
  const attach = () => {
    if (!canvas.value) return
    events.forEach(e => canvas.value!.on(e, sync))
    rebuildLayers()
  }
  // wait for canvas to be ready
  const t = setInterval(() => { if (canvas.value) { attach(); clearInterval(t) } }, 100)
  cleanup = () => {
    clearInterval(t)
    events.forEach(e => canvas.value?.off(e, sync))
  }
})

onUnmounted(() => cleanup?.())
</script>

<style scoped>
.layer-panel {
  background: #1a1a2e;
  border-top: 1px solid #2d2d3f;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}

.layer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #7c7caa;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #2d2d3f;
}

.layer-count {
  background: #2d2d4a;
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 10px;
  color: #8888bb;
}

.layer-list {
  overflow-y: auto;
  flex: 1;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  cursor: pointer;
  border-bottom: 1px solid #22223a;
  transition: background 0.1s;
}

.layer-item:hover {
  background: #22223a;
}

.layer-item.active {
  background: #2a2a4a;
  border-left: 2px solid #6666cc;
  padding-left: 8px;
}

.layer-thumb canvas {
  border-radius: 3px;
  background: #fff;
  display: block;
}

.layer-name {
  flex: 1;
  font-size: 12px;
  color: #b0b0cc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.layer-item:hover .layer-actions {
  opacity: 1;
}

.layer-actions button {
  padding: 1px 5px;
  font-size: 11px;
  background: #2d2d4a;
  border: none;
  border-radius: 3px;
  color: #aaaacc;
  cursor: pointer;
  min-width: 22px;
}

.layer-actions button:disabled {
  opacity: 0.3;
  cursor: default;
}

.layer-actions button:hover:not(:disabled) {
  background: #44446a;
  color: #fff;
}

.layer-actions .dim {
  opacity: 0.5;
}

.layer-empty {
  padding: 16px;
  text-align: center;
  color: #555577;
  font-size: 12px;
}
</style>
