<template>
  <div class="app">
    <Toolbar ref="toolbarRef" />
    <TabBar @add-tab="onAddTab" />
    <div class="editor-container">
      <CanvasArea @new-canvas="toolbarRef?.openNewDialog()" />
      <PropertyPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Toolbar from './components/Toolbar.vue'
import TabBar from './components/TabBar.vue'
import CanvasArea from './components/CanvasArea.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import { useTabs } from './composables/useTabs'

const toolbarRef = ref<InstanceType<typeof Toolbar> | null>(null)
const { newTab } = useTabs()

const onAddTab = () => {
  // 新增空白 tab 默认尺寸，无需弹对话框
  newTab(900, 650, '#ffffff')
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
}
</style>