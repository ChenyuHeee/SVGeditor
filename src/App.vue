<template>
  <div class="app">
    <Toolbar />
    <div class="editor-container">
      <CanvasArea />
      <PropertyPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import Toolbar from './components/Toolbar.vue'
import CanvasArea from './components/CanvasArea.vue'
import PropertyPanel from './components/PropertyPanel.vue'
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