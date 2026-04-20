<template>
  <div class="toolbar">
    <!-- 文件操作 -->
    <div class="toolbar-group">
      <button @click="newCanvas" title="新建画布">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="12" y1="9" x2="12" y2="15"/></svg>
        新建
      </button>
      <button @click="triggerFileInput" title="打开 SVG 文件">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        打开
      </button>
      <input type="file" ref="fileInput" accept=".svg" style="display:none" @change="onFileOpen" />
    </div>

    <div class="toolbar-sep" />

    <!-- 绘图工具 -->
    <div class="toolbar-group tools-group">
      <button
        v-for="tool in tools"
        :key="tool.id"
        :class="['tool-btn', { active: activeTool === tool.id }]"
        :title="tool.label"
        @click="setTool(tool.id as any)"
      >
        <span v-html="tool.icon" />
        <span class="tool-label">{{ tool.label }}</span>
      </button>
    </div>

    <div class="toolbar-sep" />

    <!-- 操作 -->
    <div class="toolbar-group">
      <button @click="undo" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
      </button>
      <button @click="redo" :disabled="!canRedo" title="重做 (Ctrl+Y)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
      </button>
      <button @click="deleteSelected" title="删除选中 (Delete)" class="danger-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    </div>

    <div class="toolbar-sep" />

    <!-- 缩放 -->
    <div class="toolbar-group zoom-group">
      <button @click="zoomOut" title="缩小">−</button>
      <span class="zoom-display">{{ Math.round(zoom * 100) }}%</span>
      <button @click="zoomIn" title="放大">＋</button>
      <button @click="fitToScreen" title="适应窗口" style="font-size:11px">适应</button>
      <button @click="resetZoom" title="重置缩放">1:1</button>
    </div>

    <div class="toolbar-sep" />

    <!-- 导出 -->
    <div class="toolbar-group">
      <button @click="exportSVG()" class="export-btn" title="导出 SVG">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        SVG
      </button>
      <button @click="exportPNG()" title="导出 PNG (2x)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        PNG
      </button>
    </div>

    <div class="toolbar-right">
      <span class="app-title">SVG Editor</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCanvas } from '../composables/useCanvas'
import { useSVGLoader } from '../composables/useSVGLoader'
import { useHistory } from '../composables/useHistory'
import { useExport } from '../composables/useExport'
import { useDrawTools } from '../composables/useDrawTools'
import type { ToolType } from '../composables/useDrawTools'

const fileInput = ref<HTMLInputElement | null>(null)
const { canvas, zoom, setZoom, fitToScreen, deleteSelected } = useCanvas()
const { loadSVGFromFile } = useSVGLoader()
const { undo, redo, canUndo, canRedo } = useHistory()
const { exportSVG, exportPNG } = useExport()
const { activeTool, setTool } = useDrawTools()

const tools: { id: ToolType; label: string; icon: string }[] = [
  { id: 'select', label: '选择', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-7 1-4 7z"/></svg>' },
  { id: 'rect', label: '矩形', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>' },
  { id: 'ellipse', label: '椭圆', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="10" ry="6"/></svg>' },
  { id: 'line', label: '直线', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="19" x2="19" y2="5"/></svg>' },
  { id: 'text', label: '文字', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>' },
  { id: 'freehand', label: '画笔', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>' },
]

const newCanvas = () => {
  if (!canvas.value) return
  if (canvas.value.getObjects().length > 0 && !confirm('新建将清空画布，确认吗？')) return
  canvas.value.clear()
  canvas.value.set('backgroundColor', '#ffffff')
  canvas.value.renderAll()
}

const triggerFileInput = () => fileInput.value?.click()

const onFileOpen = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadSVGFromFile(file)
  ;(e.target as HTMLInputElement).value = ''
}

const zoomIn = () => setZoom(zoom.value * 1.2)
const zoomOut = () => setZoom(zoom.value / 1.2)
const resetZoom = () => {
  if (!canvas.value) return
  canvas.value.setViewportTransform([1, 0, 0, 1, 0, 0])
  zoom.value = 1
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 0;
  background: #1e1e2e;
  padding: 0 8px;
  height: 44px;
  border-bottom: 1px solid #2d2d3f;
  flex-shrink: 0;
  overflow-x: auto;
  user-select: none;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 4px;
}

.toolbar-sep {
  width: 1px;
  height: 24px;
  background: #3a3a4f;
  margin: 0 4px;
  flex-shrink: 0;
}

.toolbar-right {
  margin-left: auto;
  padding-left: 12px;
}

.app-title {
  font-size: 13px;
  font-weight: 600;
  color: #7c7caa;
  white-space: nowrap;
}

.tools-group {
  gap: 1px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 4px 8px;
  background: transparent;
  border-radius: 5px;
  min-width: 44px;
  height: 36px;
  justify-content: center;
}

.tool-label {
  font-size: 10px;
  line-height: 1;
  color: #aaaabb;
}

.tool-btn.active {
  background: #3a3a6e;
  color: #8888ff;
}

.tool-btn.active .tool-label {
  color: #8888ff;
}

.zoom-group {
  gap: 2px;
}

.zoom-display {
  font-size: 12px;
  color: #aaaacc;
  min-width: 38px;
  text-align: center;
}

.export-btn {
  background: #1a5c38;
}

.export-btn:hover {
  background: #1d7044;
}

.danger-btn:hover {
  background: #5c1a1a !important;
}
</style>