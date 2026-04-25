<template>
  <div class="color-panel">
    <div class="panel-title">学术配色方案</div>

    <div v-for="scheme in schemes" :key="scheme.name" class="scheme">
      <div class="scheme-name">{{ scheme.name }}</div>
      <div class="swatch-row">
        <div
          v-for="color in scheme.colors"
          :key="color"
          class="swatch"
          :style="{ background: color }"
          :title="color"
          @click="applyColor(color)"
        />
      </div>
    </div>

    <div class="panel-title" style="margin-top:10px">快速填色</div>
    <div class="quick-apply">
      <button @click="applyFill">填充</button>
      <button @click="applyStroke">描边</button>
      <div class="preview-swatch" :style="{ background: selected }" />
      <span class="hex-val">{{ selected }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCanvas, selectedObject } from '../composables/useCanvas'
import { useHistory } from '../composables/useHistory'

const { canvas } = useCanvas()
const { saveState } = useHistory()

const selected = ref('#4472C4')

const schemes = [
  {
    name: 'Nature / Science',
    colors: ['#E64B35', '#4DBBD5', '#00A087', '#3C5488', '#F39B7F', '#8491B4', '#91D1C2', '#DC0000', '#7E6148']
  },
  {
    name: 'IEEE / IEEE Access',
    colors: ['#003087', '#005F8C', '#0072C6', '#00A3D9', '#5CB8E4', '#1B4332', '#2D6A4F', '#40916C', '#74C69D']
  },
  {
    name: 'PowerPoint Office',
    colors: ['#4472C4', '#ED7D31', '#A9D18E', '#FF0000', '#FFC000', '#5B9BD5', '#70AD47', '#9B59B6', '#2ECC71']
  },
  {
    name: 'Colorblind-safe',
    colors: ['#0072B2', '#E69F00', '#CC79A7', '#009E73', '#56B4E9', '#D55E00', '#F0E442', '#999999', '#000000']
  },
  {
    name: '中性灰调',
    colors: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1', '#1ABC9C', '#3498DB', '#E74C3C']
  },
]

const applyColor = (color: string) => {
  selected.value = color
}

const applyFill = () => {
  if (!canvas.value) return
  const obj = canvas.value.getActiveObject()
  if (!obj) return
  obj.set('fill', selected.value)
  canvas.value.renderAll()
  saveState()
}

const applyStroke = () => {
  if (!canvas.value) return
  const obj = canvas.value.getActiveObject()
  if (!obj) return
  obj.set('stroke', selected.value)
  canvas.value.renderAll()
  saveState()
}
</script>

<style scoped>
.color-panel {
  padding: 8px 10px;
}

.panel-title {
  font-size: 10px;
  font-weight: 600;
  color: #7c7caa;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.scheme {
  margin-bottom: 10px;
}

.scheme-name {
  font-size: 10px;
  color: #6666aa;
  margin-bottom: 4px;
}

.swatch-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.swatch {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.1s, border-color 0.1s;
}

.swatch:hover {
  transform: scale(1.2);
  border-color: #8888cc;
}

.quick-apply {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-apply button {
  padding: 4px 10px;
  font-size: 11px;
  background: #2d2d4a;
  border: 1px solid #44446a;
  border-radius: 4px;
  color: #c0c0e0;
  cursor: pointer;
}

.quick-apply button:hover {
  background: #44446a;
}

.preview-swatch {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid #44446a;
}

.hex-val {
  font-size: 11px;
  color: #8888bb;
  font-family: monospace;
}
</style>
