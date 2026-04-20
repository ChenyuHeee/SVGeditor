<template>
  <Teleport to="body">
    <div class="overlay" @click.self="$emit('cancel')">
      <div class="dialog">
        <div class="dialog-header">
          <span>新建画布</span>
          <button class="close-btn" @click="$emit('cancel')">✕</button>
        </div>

        <div class="dialog-body">
          <!-- 预设 -->
          <div class="field-label">预设尺寸</div>
          <div class="presets">
            <button
              v-for="p in presets"
              :key="p.name"
              :class="['preset-btn', { active: selectedPreset === p.name }]"
              @click="applyPreset(p)"
            >
              <span class="preset-name">{{ p.name }}</span>
              <span class="preset-size">{{ p.w }} × {{ p.h }}</span>
            </button>
          </div>

          <!-- 自定义尺寸 -->
          <div class="field-label" style="margin-top:16px">自定义尺寸</div>
          <div class="size-row">
            <label>
              <span>宽度 (px)</span>
              <input type="number" v-model.number="width" min="50" max="10000" @input="selectedPreset = ''" />
            </label>
            <span class="size-x">×</span>
            <label>
              <span>高度 (px)</span>
              <input type="number" v-model.number="height" min="50" max="10000" @input="selectedPreset = ''" />
            </label>
            <div class="orientation-btns">
              <button :class="{ active: isLandscape }" @click="setLandscape" title="横向">⬛→</button>
              <button :class="{ active: !isLandscape }" @click="setPortrait" title="纵向">⬛↓</button>
            </div>
          </div>

          <!-- 背景色 -->
          <div class="field-label" style="margin-top:16px">背景</div>
          <div class="bg-row">
            <button
              v-for="c in bgPresets"
              :key="c.value"
              :class="['bg-swatch', { active: bgColor === c.value }]"
              :style="{ background: c.value === 'transparent' ? 'none' : c.value }"
              :title="c.label"
              @click="bgColor = c.value"
            >
              <span v-if="c.value === 'transparent'" class="transparent-icon">⊘</span>
            </button>
            <input type="color" v-model="bgColor" title="自定义颜色" />
          </div>
        </div>

        <div class="dialog-footer">
          <span class="size-hint">{{ width }} × {{ height }} px</span>
          <button class="cancel-btn" @click="$emit('cancel')">取消</button>
          <button class="confirm-btn" @click="confirm">创建</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'confirm', opts: { width: number; height: number; bgColor: string }): void
  (e: 'cancel'): void
}>()

const width = ref(900)
const height = ref(650)
const bgColor = ref('#ffffff')
const selectedPreset = ref('自定义')

const presets = [
  { name: '默认',        w: 900,  h: 650  },
  { name: '1920×1080',   w: 1920, h: 1080 },
  { name: '1280×720',    w: 1280, h: 720  },
  { name: 'A4 横向',     w: 1123, h: 794  },
  { name: 'A4 纵向',     w: 794,  h: 1123 },
  { name: '正方形',      w: 800,  h: 800  },
  { name: 'Twitter',     w: 1500, h: 500  },
  { name: 'Instagram',   w: 1080, h: 1080 },
]

const bgPresets = [
  { label: '白色',       value: '#ffffff' },
  { label: '浅灰',       value: '#f5f5f5' },
  { label: '深色',       value: '#1e1e2e' },
  { label: '黑色',       value: '#000000' },
  { label: '透明',       value: 'transparent' },
]

const isLandscape = computed(() => width.value >= height.value)

const applyPreset = (p: { name: string; w: number; h: number }) => {
  width.value = p.w
  height.value = p.h
  selectedPreset.value = p.name
}

const setLandscape = () => {
  if (width.value < height.value) [width.value, height.value] = [height.value, width.value]
}

const setPortrait = () => {
  if (width.value > height.value) [width.value, height.value] = [height.value, width.value]
}

const confirm = () => {
  emit('confirm', { width: width.value, height: height.value, bgColor: bgColor.value })
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog {
  background: #1e1e2e;
  border: 1px solid #3a3a55;
  border-radius: 10px;
  width: 480px;
  max-width: 96vw;
  box-shadow: 0 8px 40px rgba(0,0,0,0.7);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #2d2d3f;
  font-size: 14px;
  font-weight: 600;
  color: #c0c0e0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  color: #888;
  padding: 2px 6px;
}
.close-btn:hover { color: #fff; background: transparent; }

.dialog-body {
  padding: 18px;
}

.field-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6666aa;
  margin-bottom: 8px;
  font-weight: 600;
}

/* 预设格子 */
.presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 6px;
  gap: 3px;
  background: #252538;
  border-color: #3a3a55;
}

.preset-btn:hover { background: #303050; }
.preset-btn.active { background: #3a3a6e; border-color: #6666cc; }

.preset-name {
  font-size: 11px;
  color: #c0c0e0;
}

.preset-size {
  font-size: 10px;
  color: #7070aa;
}

/* 自定义尺寸 */
.size-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.size-row label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  font-size: 11px;
  color: #9090aa;
}

.size-row input[type="number"] {
  background: #252538;
  border: 1px solid #3a3a55;
  color: #e0e0f0;
  border-radius: 5px;
  padding: 7px 10px;
  font-size: 13px;
  width: 100%;
}

.size-x {
  color: #555577;
  font-size: 16px;
  padding-bottom: 6px;
  flex-shrink: 0;
}

.orientation-btns {
  display: flex;
  gap: 4px;
  padding-bottom: 2px;
}

.orientation-btns button {
  font-size: 16px;
  padding: 5px 8px;
  background: #252538;
  border-color: #3a3a55;
}
.orientation-btns button.active {
  background: #3a3a6e;
  border-color: #6666cc;
}

/* 背景色 */
.bg-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bg-swatch {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #3a3a55;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-swatch.active {
  border-color: #8888ff;
  box-shadow: 0 0 0 2px rgba(100,100,255,0.3);
}

.transparent-icon {
  font-size: 18px;
  color: #555577;
}

.bg-row input[type="color"] {
  width: 32px;
  height: 32px;
  padding: 2px;
  border: 2px solid #3a3a55;
  border-radius: 6px;
  background: #252538;
  cursor: pointer;
}

/* 底部 */
.dialog-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid #2d2d3f;
}

.size-hint {
  flex: 1;
  font-size: 11px;
  color: #7070aa;
  font-family: monospace;
}

.cancel-btn {
  background: #252538;
  border-color: #3a3a55;
  padding: 7px 18px;
}

.confirm-btn {
  background: #3a3a6e;
  border-color: #6666cc;
  color: #c0c0ff;
  padding: 7px 22px;
  font-weight: 600;
}
.confirm-btn:hover { background: #4a4a8e; }
</style>
