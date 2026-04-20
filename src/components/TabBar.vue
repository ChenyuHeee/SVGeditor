<template>
  <div class="tab-bar" @wheel.prevent="onBarWheel" ref="barRef">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      :class="['tab', { active: activeTabId === tab.id }]"
      @click="switchTab(tab.id)"
      @dblclick="startRename(tab)"
    >
      <!-- 普通显示 -->
      <span v-if="renamingId !== tab.id" class="tab-name" :title="tab.name">
        {{ tab.name }}
      </span>
      <!-- 重命名输入 -->
      <input
        v-else
        ref="renameInput"
        class="tab-rename"
        :value="renameVal"
        @input="renameVal = ($event.target as HTMLInputElement).value"
        @keydown.enter.stop="commitRename"
        @keydown.escape.stop="renamingId = ''"
        @blur="commitRename"
        @click.stop
      />

      <button
        class="tab-close"
        :class="{ hidden: tabs.length <= 1 }"
        @click.stop="closeTab(tab.id)"
        title="关闭标签"
      >✕</button>
    </div>

    <!-- 新建标签按钮 -->
    <button class="tab-add" @click="emit('add-tab')" title="新建标签 (Ctrl+T)">＋</button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useTabs } from '../composables/useTabs'

const emit = defineEmits<{
  (e: 'add-tab'): void
  (e: 'switch', id: string): void
}>()

const { tabs, activeTabId, switchTab, closeTab, renameTab } = useTabs()

const barRef = ref<HTMLDivElement | null>(null)
const renamingId = ref('')
const renameVal   = ref('')
const renameInput = ref<HTMLInputElement[] | null>(null)

const onBarWheel = (e: WheelEvent) => {
  if (barRef.value) barRef.value.scrollLeft += e.deltaY
}

const startRename = (tab: { id: string; name: string }) => {
  renamingId.value = tab.id
  renameVal.value  = tab.name
  nextTick(() => {
    const el = Array.isArray(renameInput.value)
      ? renameInput.value[0]
      : renameInput.value
    el?.select()
  })
}

const commitRename = () => {
  if (renamingId.value) {
    renameTab(renamingId.value, renameVal.value)
    renamingId.value = ''
  }
}

// 外部切换时滚动到激活 tab
const handleSwitch = (id: string) => {
  switchTab(id)
  emit('switch', id)
}
</script>

<style scoped>
.tab-bar {
  display: flex;
  align-items: stretch;
  background: #13131f;
  border-bottom: 1px solid #2d2d3f;
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
  height: 34px;
  user-select: none;
}

.tab-bar::-webkit-scrollbar { display: none; }

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px 0 14px;
  min-width: 100px;
  max-width: 180px;
  cursor: pointer;
  border-right: 1px solid #2d2d3f;
  color: #7070aa;
  font-size: 12px;
  flex-shrink: 0;
  position: relative;
  transition: background 0.1s, color 0.1s;
}

.tab:hover { background: #1e1e30; color: #c0c0e0; }

.tab.active {
  background: #1e1e2e;
  color: #e0e0f8;
  border-bottom: 2px solid #6666cc;
}

.tab-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-rename {
  flex: 1;
  background: #252538;
  border: 1px solid #6666cc;
  color: #e0e0f8;
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 12px;
  outline: none;
  width: 0;
  min-width: 0;
}

.tab-close {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: #555577;
  font-size: 11px;
  padding: 2px 3px;
  border-radius: 3px;
  line-height: 1;
  opacity: 0;
  transition: opacity 0.15s;
}

.tab:hover .tab-close,
.tab.active .tab-close { opacity: 1; }
.tab-close:hover { background: #3a1a1a; color: #cc6666; }
.tab-close.hidden { visibility: hidden; pointer-events: none; }

.tab-add {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: #555577;
  font-size: 18px;
  line-height: 33px;
  padding: 0 12px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.tab-add:hover { color: #c0c0e0; background: #1e1e30; }
</style>
