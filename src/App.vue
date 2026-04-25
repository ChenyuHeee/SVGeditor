<template>
  <div class="app">
    <Toolbar ref="toolbarRef" @import-pptx="onImportPPTX" />
    <TabBar @add-tab="onAddTab" />
    <div class="editor-container">
      <!-- 左侧形状库 -->
      <div v-if="showShapeLib" class="left-sidebar">
        <ShapeLibrary />
      </div>
      <div class="left-toggle" @click="showShapeLib = !showShapeLib" :title="showShapeLib ? '收起形状库' : '展开形状库'">
        {{ showShapeLib ? '‹' : '›' }}
      </div>

      <CanvasArea @new-canvas="toolbarRef?.openNewDialog()" />

      <!-- 右侧面板 -->
      <div class="right-sidebar">
        <div class="right-tabs">
          <button :class="{ active: rightTab === 'props' }" @click="rightTab = 'props'">属性</button>
          <button :class="{ active: rightTab === 'layers' }" @click="rightTab = 'layers'">图层</button>
          <button :class="{ active: rightTab === 'colors' }" @click="rightTab = 'colors'">配色</button>
        </div>
        <div class="right-content">
          <PropertyPanel v-show="rightTab === 'props'" />
          <LayerPanel v-show="rightTab === 'layers'" />
          <AcademicColors v-show="rightTab === 'colors'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Toolbar from './components/Toolbar.vue'
import TabBar from './components/TabBar.vue'
import CanvasArea from './components/CanvasArea.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import LayerPanel from './components/LayerPanel.vue'
import ShapeLibrary from './components/ShapeLibrary.vue'
import AcademicColors from './components/AcademicColors.vue'
import { useTabs } from './composables/useTabs'
import { useImportPPTX } from './composables/useImportPPTX'

const toolbarRef = ref<InstanceType<typeof Toolbar> | null>(null)
const { newTab } = useTabs()
const { importPPTX } = useImportPPTX()

const showShapeLib = ref(true)
const rightTab = ref<'props' | 'layers' | 'colors'>('props')

const onAddTab = () => {
  newTab(900, 650, '#ffffff')
}

const onImportPPTX = (file: File) => {
  importPPTX(file)
}
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.left-sidebar {
  width: 180px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid #2d2d3f;
}

.left-toggle {
  width: 12px;
  background: #1e1e2e;
  border-right: 1px solid #2d2d3f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #5555aa;
  font-size: 14px;
  flex-shrink: 0;
  transition: background 0.15s;
  user-select: none;
}

.left-toggle:hover {
  background: #2a2a44;
  color: #8888cc;
}

.right-sidebar {
  width: 240px;
  flex-shrink: 0;
  border-left: 1px solid #2d2d3f;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.right-tabs {
  display: flex;
  border-bottom: 1px solid #2d2d3f;
  flex-shrink: 0;
}

.right-tabs button {
  flex: 1;
  padding: 7px 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #7c7caa;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.right-tabs button:hover {
  color: #aaaacc;
}

.right-tabs button.active {
  color: #8888ff;
  border-bottom-color: #6666cc;
}

.right-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
</style>
