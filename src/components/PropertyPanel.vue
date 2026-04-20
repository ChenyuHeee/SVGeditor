<template>
  <div class="property-panel">
    <div v-if="!selectedObject" class="empty-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
      <p>选中对象后在此编辑属性</p>
    </div>

    <template v-else>
      <!-- 对象类型标签 -->
      <div class="panel-header">
        <span class="obj-type">{{ typeLabel }}</span>
        <button class="del-btn" @click="deleteSelected" title="删除">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>

      <!-- 位置与尺寸 -->
      <div class="section">
        <div class="section-title">位置 / 尺寸</div>
        <div class="grid2">
          <label>X<input type="number" :value="round(objLeft)" @change="setProp('left', +($event.target as HTMLInputElement).value)" /></label>
          <label>Y<input type="number" :value="round(objTop)" @change="setProp('top', +($event.target as HTMLInputElement).value)" /></label>
          <label v-if="hasSize">W<input type="number" :value="round(objWidth)" @change="setSize('width', +($event.target as HTMLInputElement).value)" /></label>
          <label v-if="hasSize">H<input type="number" :value="round(objHeight)" @change="setSize('height', +($event.target as HTMLInputElement).value)" /></label>
          <label>旋转<input type="number" :value="round(objAngle)" @change="setProp('angle', +($event.target as HTMLInputElement).value)" /></label>
          <label>不透明<input type="range" min="0" max="1" step="0.01" :value="objOpacity" @input="setProp('opacity', +($event.target as HTMLInputElement).value)" /></label>
        </div>
      </div>

      <!-- 填充 & 描边 -->
      <div class="section" v-if="!isLine">
        <div class="section-title">填充</div>
        <div class="row">
          <input type="color" :value="objFill" @input="setProp('fill', ($event.target as HTMLInputElement).value)" />
          <span class="color-val">{{ objFill }}</span>
          <label class="inline-check">
            <input type="checkbox" v-model="noFill" @change="toggleFill" /> 无填充
          </label>
        </div>
      </div>

      <div class="section">
        <div class="section-title">描边</div>
        <div class="row">
          <input type="color" :value="objStroke || '#000000'" @input="setProp('stroke', ($event.target as HTMLInputElement).value)" />
          <span class="color-val">{{ objStroke || '#000000' }}</span>
        </div>
        <div class="field-row">
          <label>描边宽度</label>
          <input type="number" min="0" step="0.5" :value="objStrokeWidth" @change="setProp('strokeWidth', +($event.target as HTMLInputElement).value)" />
        </div>
      </div>

      <!-- 文字属性 -->
      <div class="section" v-if="isText">
        <div class="section-title">文字</div>
        <textarea class="text-input" :value="textContent" @input="updateText(($event.target as HTMLTextAreaElement).value)" rows="3" />
        <div class="field-row">
          <label>字号</label>
          <input type="number" min="6" :value="objFontSize" @change="setProp('fontSize', +($event.target as HTMLInputElement).value)" />
        </div>
        <div class="field-row">
          <label>字体</label>
          <select :value="objFontFamily" @change="setProp('fontFamily', ($event.target as HTMLSelectElement).value)">
            <option>Arial</option>
            <option>Times New Roman</option>
            <option>Courier New</option>
            <option>Georgia</option>
            <option>Helvetica</option>
            <option>Verdana</option>
            <option>SimSun</option>
            <option>Microsoft YaHei</option>
          </select>
        </div>
        <div class="field-row">
          <label>颜色</label>
          <input type="color" :value="objFill || '#000000'" @input="setProp('fill', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="row" style="gap:4px; flex-wrap:wrap">
          <button :class="{ active: objFontWeight === 'bold' }" @click="toggleBold"><b>B</b></button>
          <button :class="{ active: objFontStyle === 'italic' }" @click="toggleItalic"><i>I</i></button>
          <button @click="setAlign('left')" :class="{ active: objTextAlign === 'left' }">≡L</button>
          <button @click="setAlign('center')" :class="{ active: objTextAlign === 'center' }">≡C</button>
          <button @click="setAlign('right')" :class="{ active: objTextAlign === 'right' }">≡R</button>
        </div>
      </div>

      <!-- 图层 -->
      <div class="section">
        <div class="section-title">图层顺序</div>
        <div class="row" style="gap:4px">
          <button @click="bringToFront">置顶</button>
          <button @click="bringForward">上移</button>
          <button @click="sendBackward">下移</button>
          <button @click="sendToBack">置底</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useCanvas, selectedObject } from '../composables/useCanvas'

const { canvas, deleteSelected } = useCanvas()

const noFill = ref(false)

// 计算属性 - 从 selectedObject 读取
const typeLabel = computed(() => {
  const t = selectedObject.value?.type
  const map: Record<string, string> = {
    'rect': '矩形', 'ellipse': '椭圆', 'circle': '圆形',
    'line': '直线', 'polyline': '折线', 'path': '路径',
    'i-text': '文字', 'text': '文字', 'textbox': '文字框',
    'group': '组合', 'image': '图片',
  }
  return map[t ?? ''] ?? (t ?? '对象')
})

const isText = computed(() => ['i-text', 'text', 'textbox'].includes(selectedObject.value?.type ?? ''))
const isLine = computed(() => ['line', 'polyline'].includes(selectedObject.value?.type ?? ''))
const hasSize = computed(() => !isLine.value)

const objLeft = computed(() => (selectedObject.value as any)?.left ?? 0)
const objTop = computed(() => (selectedObject.value as any)?.top ?? 0)
const objWidth = computed(() => {
  const o = selectedObject.value as any
  return o ? (o.width ?? 0) * (o.scaleX ?? 1) : 0
})
const objHeight = computed(() => {
  const o = selectedObject.value as any
  return o ? (o.height ?? 0) * (o.scaleY ?? 1) : 0
})
const objAngle = computed(() => (selectedObject.value as any)?.angle ?? 0)
const objOpacity = computed(() => (selectedObject.value as any)?.opacity ?? 1)
const objFill = computed(() => {
  const f = (selectedObject.value as any)?.fill
  return typeof f === 'string' ? f : '#000000'
})
const objStroke = computed(() => (selectedObject.value as any)?.stroke ?? '')
const objStrokeWidth = computed(() => (selectedObject.value as any)?.strokeWidth ?? 0)
const objFontSize = computed(() => (selectedObject.value as any)?.fontSize ?? 16)
const objFontFamily = computed(() => (selectedObject.value as any)?.fontFamily ?? 'Arial')
const objFontWeight = computed(() => (selectedObject.value as any)?.fontWeight ?? 'normal')
const objFontStyle = computed(() => (selectedObject.value as any)?.fontStyle ?? 'normal')
const objTextAlign = computed(() => (selectedObject.value as any)?.textAlign ?? 'left')
const textContent = computed(() => (selectedObject.value as any)?.text ?? '')

watch(selectedObject, (obj) => {
  noFill.value = !obj || (obj as any).fill === '' || (obj as any).fill === 'transparent' || (obj as any).fill == null
})

const round = (v: number) => Math.round(v * 10) / 10

const setProp = (key: string, value: any) => {
  if (!selectedObject.value || !canvas.value) return
  selectedObject.value.set(key as any, value)
  canvas.value.renderAll()
}

const setSize = (key: 'width' | 'height', value: number) => {
  if (!selectedObject.value || !canvas.value) return
  const o = selectedObject.value as any
  const scale = key === 'width' ? 'scaleX' : 'scaleY'
  const orig = o[key] ?? 1
  if (orig !== 0) o.set(scale, value / orig)
  canvas.value.renderAll()
}

const updateText = (val: string) => {
  if (!selectedObject.value || !canvas.value) return
  ;(selectedObject.value as any).set('text', val)
  canvas.value.renderAll()
}

const toggleFill = () => {
  setProp('fill', noFill.value ? '' : '#4169E1')
}

const toggleBold = () => {
  const cur = (selectedObject.value as any)?.fontWeight
  setProp('fontWeight', cur === 'bold' ? 'normal' : 'bold')
}

const toggleItalic = () => {
  const cur = (selectedObject.value as any)?.fontStyle
  setProp('fontStyle', cur === 'italic' ? 'normal' : 'italic')
}

const setAlign = (align: string) => setProp('textAlign', align)

const bringToFront = () => { canvas.value?.bringToFront(selectedObject.value!); canvas.value?.renderAll() }
const bringForward = () => { canvas.value?.bringForward(selectedObject.value!); canvas.value?.renderAll() }
const sendBackward = () => { canvas.value?.sendBackwards(selectedObject.value!); canvas.value?.renderAll() }
const sendToBack = () => { canvas.value?.sendToBack(selectedObject.value!); canvas.value?.renderAll() }
</script>

<style scoped>
.property-panel {
  width: 220px;
  min-width: 220px;
  background: #1a1a2e;
  border-left: 1px solid #2d2d3f;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #d0d0e8;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #555577;
  padding: 24px;
  text-align: center;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px 8px;
  border-bottom: 1px solid #2d2d3f;
}

.obj-type {
  font-weight: 600;
  color: #9090cc;
  font-size: 13px;
}

.del-btn {
  background: transparent;
  padding: 4px;
  color: #cc6666;
}

.del-btn:hover {
  background: #3a1a1a;
}

.section {
  padding: 10px 12px;
  border-bottom: 1px solid #2d2d3f;
}

.section-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7070aa;
  margin-bottom: 8px;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.grid2 label {
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: #9090aa;
  font-size: 11px;
}

.grid2 input {
  width: 100%;
}

.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.field-row label {
  color: #9090aa;
  flex-shrink: 0;
}

.field-row input,
.field-row select {
  flex: 1;
  min-width: 0;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-val {
  font-family: monospace;
  font-size: 11px;
  color: #9090aa;
}

.inline-check {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #9090aa;
  font-size: 11px;
}

.text-input {
  width: 100%;
  background: #252538;
  border: 1px solid #3a3a55;
  color: #e0e0f0;
  border-radius: 4px;
  padding: 6px;
  resize: vertical;
  font-size: 12px;
  margin-bottom: 6px;
}

input[type="number"],
select {
  background: #252538;
  border: 1px solid #3a3a55;
  color: #e0e0f0;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 12px;
  width: 100%;
}

input[type="color"] {
  padding: 2px;
  border: 1px solid #3a3a55;
  border-radius: 4px;
  background: #252538;
  height: 24px;
  width: 32px;
  cursor: pointer;
}

input[type="range"] {
  flex: 1;
  height: 4px;
  accent-color: #6666cc;
}

button {
  font-size: 11px;
  padding: 4px 8px;
}

button.active {
  background: #3a3a6e;
  color: #8888ff;
}
</style>