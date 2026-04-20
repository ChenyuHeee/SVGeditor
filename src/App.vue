<template>
  <div class="app">
    <Toolbar ref="toolbarRef" />
    <div class="editor-container">
      <CanvasArea @new-canvas="toolbarRef?.openNewDialog()" />
      <PropertyPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Toolbar from './components/Toolbar.vue'
import CanvasArea from './components/CanvasArea.vue'
import PropertyPanel from './components/PropertyPanel.vue'

const toolbarRef = ref<InstanceType<typeof Toolbar> | null>(null)
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