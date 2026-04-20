import { ref, computed, watch } from 'vue'
import { fabric } from 'fabric'

export interface Tab {
  id: string
  name: string
  canvasJSON: string
  width: number
  height: number
}

const STORAGE_KEY = 'svg-editor-tabs'
const ACTIVE_KEY  = 'svg-editor-active-tab'

// ── 模块级单例 ────────────────────────────────────────────────────────────
const tabs = ref<Tab[]>([])
const activeTabId = ref<string>('')

const activeTab = computed(() =>
  tabs.value.find(t => t.id === activeTabId.value) ?? null
)

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function defaultJSON(width: number, height: number, bg = '#ffffff') {
  return JSON.stringify({
    version: '5.3.0',
    objects: [],
    background: bg,
    width,
    height,
  })
}

// ── 持久化 ────────────────────────────────────────────────────────────────
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs.value))
    localStorage.setItem(ACTIVE_KEY, activeTabId.value)
  } catch (_) {}
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const stored = JSON.parse(raw) as Tab[]
      if (Array.isArray(stored) && stored.length) {
        tabs.value = stored
        const savedActive = localStorage.getItem(ACTIVE_KEY)
        activeTabId.value = stored.find(t => t.id === savedActive)
          ? (savedActive as string)
          : stored[0].id
        return true
      }
    }
  } catch (_) {}
  return false
}

// ── composable ────────────────────────────────────────────────────────────
export const useTabs = () => {
  // 首次调用时初始化（只执行一次）
  if (tabs.value.length === 0) {
    if (!load()) {
      const first = createTab('未命名 1', 900, 650)
      activeTabId.value = first.id
    }
  }

  function createTab(name?: string, width = 900, height = 650, json?: string): Tab {
    const id = genId()
    const tab: Tab = {
      id,
      name: name ?? `未命名 ${tabs.value.length + 1}`,
      canvasJSON: json ?? defaultJSON(width, height),
      width,
      height,
    }
    tabs.value.push(tab)
    persist()
    return tab
  }

  function closeTab(id: string) {
    if (tabs.value.length <= 1) return  // 至少保留一个
    const idx = tabs.value.findIndex(t => t.id === id)
    tabs.value.splice(idx, 1)
    if (activeTabId.value === id) {
      activeTabId.value = tabs.value[Math.min(idx, tabs.value.length - 1)].id
    }
    persist()
  }

  function switchTab(id: string) {
    if (activeTabId.value === id) return
    activeTabId.value = id
    persist()
  }

  function renameTab(id: string, name: string) {
    const tab = tabs.value.find(t => t.id === id)
    if (tab) { tab.name = name.trim() || tab.name; persist() }
  }

  /** 把当前 fabric.Canvas 状态写回 active tab，并持久化 */
  function saveCurrentState(c: fabric.Canvas) {
    const tab = activeTab.value
    if (!tab) return
    const json = c.toJSON(['width', 'height'])
    tab.canvasJSON = JSON.stringify(json)
    tab.width  = Math.round(c.getWidth())
    tab.height = Math.round(c.getHeight())
    persist()
  }

  /** 新建 tab（从 NewCanvasDialog 调用） */
  function newTab(width: number, height: number, bgColor: string) {
    const tab = createTab(undefined, width, height, defaultJSON(width, height, bgColor))
    activeTabId.value = tab.id
    persist()
    return tab
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    createTab,
    closeTab,
    switchTab,
    renameTab,
    saveCurrentState,
    newTab,
  }
}
