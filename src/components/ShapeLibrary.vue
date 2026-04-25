<template>
  <div class="shape-library">
    <div class="lib-header">形状库</div>

    <div v-for="group in shapeGroups" :key="group.name" class="shape-group">
      <div class="group-title">{{ group.name }}</div>
      <div class="shape-grid">
        <div
          v-for="shape in group.shapes"
          :key="shape.id"
          class="shape-item"
          :title="shape.label"
          @click="addShape(shape.id)"
        >
          <svg :viewBox="shape.viewBox" width="36" height="36">
            <g v-html="shape.svg" />
          </svg>
          <span>{{ shape.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fabric } from 'fabric'
import { useCanvas } from '../composables/useCanvas'
import { useHistory } from '../composables/useHistory'

const { canvas } = useCanvas()
const { saveState } = useHistory()

const shapeGroups = [
  {
    name: '流程图',
    shapes: [
      { id: 'process', label: '过程', viewBox: '0 0 40 28',
        svg: '<rect x="2" y="2" width="36" height="24" rx="2" fill="#4472C4" stroke="#2255aa" stroke-width="1.5"/>' },
      { id: 'decision', label: '判断', viewBox: '0 0 44 32',
        svg: '<polygon points="22,2 42,16 22,30 2,16" fill="#ED7D31" stroke="#c05a10" stroke-width="1.5"/>' },
      { id: 'terminal', label: '开始/结束', viewBox: '0 0 44 28',
        svg: '<rect x="2" y="2" width="40" height="24" rx="12" fill="#70AD47" stroke="#4a8030" stroke-width="1.5"/>' },
      { id: 'database', label: '数据库', viewBox: '0 0 40 36',
        svg: '<ellipse cx="20" cy="8" rx="18" ry="6" fill="#A5A5A5" stroke="#666" stroke-width="1.5"/><path d="M2,8 v20 Q2,34 20,34 Q38,34 38,28 v-20" fill="#A5A5A5" stroke="#666" stroke-width="1.5"/>' },
      { id: 'parallelogram', label: '数据', viewBox: '0 0 44 28',
        svg: '<polygon points="10,2 42,2 34,26 2,26" fill="#9DC3E6" stroke="#4472C4" stroke-width="1.5"/>' },
      { id: 'predefined', label: '预定义', viewBox: '0 0 44 28',
        svg: '<rect x="2" y="2" width="40" height="24" fill="#C9E0F5" stroke="#4472C4" stroke-width="1.5"/><line x1="10" y1="2" x2="10" y2="26" stroke="#4472C4" stroke-width="1.5"/><line x1="34" y1="2" x2="34" y2="26" stroke="#4472C4" stroke-width="1.5"/>' },
    ]
  },
  {
    name: '网络拓扑',
    shapes: [
      { id: 'server', label: '服务器', viewBox: '0 0 36 42',
        svg: '<rect x="2" y="2" width="32" height="10" rx="2" fill="#4472C4" stroke="#2255aa" stroke-width="1.5"/><rect x="2" y="16" width="32" height="10" rx="2" fill="#4472C4" stroke="#2255aa" stroke-width="1.5"/><rect x="2" y="30" width="32" height="10" rx="2" fill="#4472C4" stroke="#2255aa" stroke-width="1.5"/>' },
      { id: 'cloud', label: '云', viewBox: '0 0 48 32',
        svg: '<path d="M10,26 Q2,26 2,18 Q2,10 10,10 Q12,4 20,4 Q28,4 30,10 Q38,8 40,16 Q46,16 46,22 Q46,26 40,26 Z" fill="#9DC3E6" stroke="#4472C4" stroke-width="1.5"/>' },
      { id: 'router', label: '路由器', viewBox: '0 0 40 40',
        svg: '<circle cx="20" cy="20" r="16" fill="#ED7D31" stroke="#c05a10" stroke-width="1.5"/><line x1="20" y1="4" x2="20" y2="36" stroke="white" stroke-width="2"/><line x1="4" y1="20" x2="36" y2="20" stroke="white" stroke-width="2"/><ellipse cx="20" cy="20" rx="8" ry="16" fill="none" stroke="white" stroke-width="1.5"/>' },
      { id: 'client', label: '终端', viewBox: '0 0 40 38',
        svg: '<rect x="2" y="2" width="36" height="24" rx="2" fill="#70AD47" stroke="#4a8030" stroke-width="1.5"/><rect x="14" y="26" width="12" height="5" fill="#4a8030"/><rect x="10" y="31" width="20" height="4" rx="1" fill="#4a8030"/>' },
      { id: 'firewall', label: '防火墙', viewBox: '0 0 40 40',
        svg: '<path d="M20,2 L38,12 L38,30 L20,38 L2,30 L2,12 Z" fill="rgba(200,0,0,0.85)" stroke="#880000" stroke-width="1.5"/><text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-weight="bold">F</text>' },
      { id: 'storage', label: '存储', viewBox: '0 0 40 36',
        svg: '<rect x="2" y="10" width="36" height="24" rx="2" fill="#A5A5A5" stroke="#666" stroke-width="1.5"/><ellipse cx="20" cy="10" rx="18" ry="6" fill="#C0C0C0" stroke="#666" stroke-width="1.5"/>' },
    ]
  },
  {
    name: '标注箭头',
    shapes: [
      { id: 'arrow-right', label: '右箭头', viewBox: '0 0 48 24',
        svg: '<polygon points="2,8 34,8 34,2 46,12 34,22 34,16 2,16" fill="#4472C4" stroke="#2255aa" stroke-width="1"/>' },
      { id: 'arrow-both', label: '双向', viewBox: '0 0 48 24',
        svg: '<polygon points="2,12 14,2 14,8 34,8 34,2 46,12 34,22 34,16 14,16 14,22" fill="#ED7D31" stroke="#c05a10" stroke-width="1"/>' },
      { id: 'callout', label: '标注框', viewBox: '0 0 48 36',
        svg: '<rect x="2" y="2" width="44" height="24" rx="3" fill="#FFFACD" stroke="#c09000" stroke-width="1.5"/><polygon points="8,26 20,26 8,36" fill="#FFFACD" stroke="#c09000" stroke-width="1"/>' },
      { id: 'bracket-left', label: '左括号', viewBox: '0 0 20 40',
        svg: '<path d="M16,2 Q4,2 4,20 Q4,38 16,38" fill="none" stroke="#4472C4" stroke-width="3" stroke-linecap="round"/>' },
      { id: 'bracket-right', label: '右括号', viewBox: '0 0 20 40',
        svg: '<path d="M4,2 Q16,2 16,20 Q16,38 4,38" fill="none" stroke="#4472C4" stroke-width="3" stroke-linecap="round"/>' },
      { id: 'star', label: '星形', viewBox: '0 0 40 40',
        svg: '<polygon points="20,2 24,14 38,14 27,22 31,36 20,28 9,36 13,22 2,14 16,14" fill="#FFC000" stroke="#c09000" stroke-width="1.5"/>' },
    ]
  },
  {
    name: '基础图形',
    shapes: [
      { id: 'rect', label: '矩形', viewBox: '0 0 40 30',
        svg: '<rect x="2" y="2" width="36" height="26" fill="#C9E0F5" stroke="#4472C4" stroke-width="2"/>' },
      { id: 'ellipse', label: '椭圆', viewBox: '0 0 40 30',
        svg: '<ellipse cx="20" cy="15" rx="18" ry="12" fill="#FFE699" stroke="#c09000" stroke-width="2"/>' },
      { id: 'triangle', label: '三角形', viewBox: '0 0 40 36',
        svg: '<polygon points="20,2 38,34 2,34" fill="#70AD47" stroke="#4a8030" stroke-width="2"/>' },
      { id: 'hexagon', label: '六边形', viewBox: '0 0 40 36',
        svg: '<polygon points="20,2 36,11 36,27 20,36 4,27 4,11" fill="#9B59B6" stroke="#6c3483" stroke-width="2"/>' },
      { id: 'cross', label: '十字形', viewBox: '0 0 40 40',
        svg: '<polygon points="14,2 26,2 26,14 38,14 38,26 26,26 26,38 14,38 14,26 2,26 2,14 14,14" fill="#E74C3C" stroke="#a93226" stroke-width="2"/>' },
      { id: 'rounded-rect', label: '圆角矩形', viewBox: '0 0 40 30',
        svg: '<rect x="2" y="2" width="36" height="26" rx="8" fill="#E8DAEF" stroke="#9B59B6" stroke-width="2"/>' },
    ]
  }
]

const addShape = (id: string) => {
  if (!canvas.value) return
  const cx = canvas.value.getWidth() / 2
  const cy = canvas.value.getHeight() / 2
  let obj: fabric.Object | null = null

  switch (id) {
    case 'process':
      obj = new fabric.Rect({ left: cx - 60, top: cy - 35, width: 120, height: 60, fill: '#4472C4', stroke: '#2255aa', strokeWidth: 2, rx: 4, ry: 4 })
      break
    case 'decision':
      obj = new fabric.Polygon([{ x: 80, y: 0 }, { x: 160, y: 50 }, { x: 80, y: 100 }, { x: 0, y: 50 }],
        { left: cx - 80, top: cy - 50, fill: '#ED7D31', stroke: '#c05a10', strokeWidth: 2 })
      break
    case 'terminal':
      obj = new fabric.Rect({ left: cx - 65, top: cy - 30, width: 130, height: 55, fill: '#70AD47', stroke: '#4a8030', strokeWidth: 2, rx: 27, ry: 27 })
      break
    case 'database': {
      const body = new fabric.Rect({ left: 0, top: 20, width: 100, height: 70, fill: '#A5A5A5', stroke: '#666', strokeWidth: 2 })
      const topE = new fabric.Ellipse({ left: 0, top: 0, rx: 50, ry: 22, fill: '#C0C0C0', stroke: '#666', strokeWidth: 2 })
      const botE = new fabric.Ellipse({ left: 0, top: 68, rx: 50, ry: 22, fill: '#A5A5A5', stroke: '#666', strokeWidth: 2 })
      obj = new fabric.Group([body, topE, botE], { left: cx - 50, top: cy - 50 })
      break
    }
    case 'parallelogram':
      obj = new fabric.Polygon([{ x: 20, y: 0 }, { x: 120, y: 0 }, { x: 100, y: 55 }, { x: 0, y: 55 }],
        { left: cx - 60, top: cy - 28, fill: '#9DC3E6', stroke: '#4472C4', strokeWidth: 2 })
      break
    case 'predefined': {
      const r = new fabric.Rect({ width: 130, height: 55, fill: '#C9E0F5', stroke: '#4472C4', strokeWidth: 2 })
      const l1 = new fabric.Line([22, 0, 22, 55], { stroke: '#4472C4', strokeWidth: 2 })
      const l2 = new fabric.Line([108, 0, 108, 55], { stroke: '#4472C4', strokeWidth: 2 })
      obj = new fabric.Group([r, l1, l2], { left: cx - 65, top: cy - 28 })
      break
    }
    case 'server': {
      const boxes = [0, 26, 52].map(dy =>
        new fabric.Rect({ left: 0, top: dy, width: 100, height: 18, fill: '#4472C4', stroke: '#2255aa', strokeWidth: 1.5, rx: 2, ry: 2 })
      )
      obj = new fabric.Group(boxes, { left: cx - 50, top: cy - 38 })
      break
    }
    case 'cloud':
      obj = new fabric.Path('M 20,70 Q 0,70 0,50 Q 0,30 18,30 Q 20,10 40,10 Q 60,10 64,30 Q 82,26 86,46 Q 100,46 100,58 Q 100,70 84,70 Z',
        { left: cx - 50, top: cy - 36, fill: '#9DC3E6', stroke: '#4472C4', strokeWidth: 2 })
      break
    case 'router': {
      const c = new fabric.Circle({ radius: 40, fill: '#ED7D31', stroke: '#c05a10', strokeWidth: 2 })
      const lv2 = new fabric.Line([40, 0, 40, 80], { stroke: 'white', strokeWidth: 3 })
      const lh2 = new fabric.Line([0, 40, 80, 40], { stroke: 'white', strokeWidth: 3 })
      obj = new fabric.Group([c, lv2, lh2], { left: cx - 40, top: cy - 40 })
      break
    }
    case 'client': {
      const sc = new fabric.Rect({ width: 90, height: 62, fill: '#70AD47', stroke: '#4a8030', strokeWidth: 2, rx: 3, ry: 3 })
      const st = new fabric.Rect({ left: 33, top: 62, width: 24, height: 8, fill: '#4a8030' })
      const ba = new fabric.Rect({ left: 25, top: 70, width: 40, height: 7, fill: '#4a8030', rx: 2, ry: 2 })
      obj = new fabric.Group([sc, st, ba], { left: cx - 45, top: cy - 40 })
      break
    }
    case 'firewall':
      obj = new fabric.Path('M 44,2 L 86,22 L 86,66 L 44,86 L 2,66 L 2,22 Z',
        { left: cx - 44, top: cy - 44, fill: 'rgba(200,0,0,0.85)', stroke: '#880000', strokeWidth: 2 })
      break
    case 'storage': {
      const sb = new fabric.Rect({ left: 0, top: 20, width: 100, height: 60, fill: '#A5A5A5', stroke: '#666', strokeWidth: 2, rx: 2, ry: 2 })
      const se = new fabric.Ellipse({ left: 0, top: 0, rx: 50, ry: 22, fill: '#C0C0C0', stroke: '#666', strokeWidth: 2 })
      obj = new fabric.Group([sb, se], { left: cx - 50, top: cy - 42 })
      break
    }
    case 'arrow-right':
      obj = new fabric.Polygon([{ x: 0, y: 18 }, { x: 80, y: 18 }, { x: 80, y: 0 }, { x: 120, y: 28 }, { x: 80, y: 56 }, { x: 80, y: 38 }, { x: 0, y: 38 }],
        { left: cx - 60, top: cy - 28, fill: '#4472C4', stroke: '#2255aa', strokeWidth: 1.5 })
      break
    case 'arrow-both':
      obj = new fabric.Polygon([{ x: 0, y: 28 }, { x: 28, y: 0 }, { x: 28, y: 18 }, { x: 92, y: 18 }, { x: 92, y: 0 }, { x: 120, y: 28 }, { x: 92, y: 56 }, { x: 92, y: 38 }, { x: 28, y: 38 }, { x: 28, y: 56 }],
        { left: cx - 60, top: cy - 28, fill: '#ED7D31', stroke: '#c05a10', strokeWidth: 1.5 })
      break
    case 'callout': {
      const cb = new fabric.Rect({ width: 140, height: 70, fill: '#FFFACD', stroke: '#c09000', strokeWidth: 2, rx: 5, ry: 5 })
      const ct = new fabric.Triangle({ width: 28, height: 24, left: 12, top: 68, fill: '#FFFACD', stroke: '#c09000', strokeWidth: 1.5 })
      obj = new fabric.Group([cb, ct], { left: cx - 70, top: cy - 55 })
      break
    }
    case 'bracket-left':
      obj = new fabric.Path('M 30,0 Q 5,0 5,45 Q 5,90 30,90',
        { left: cx - 15, top: cy - 45, fill: 'transparent', stroke: '#4472C4', strokeWidth: 4 })
      break
    case 'bracket-right':
      obj = new fabric.Path('M 5,0 Q 30,0 30,45 Q 30,90 5,90',
        { left: cx - 15, top: cy - 45, fill: 'transparent', stroke: '#4472C4', strokeWidth: 4 })
      break
    case 'star':
      obj = new fabric.Polygon([
        { x: 60, y: 2 }, { x: 74, y: 42 }, { x: 118, y: 42 }, { x: 82, y: 68 },
        { x: 96, y: 110 }, { x: 60, y: 84 }, { x: 24, y: 110 }, { x: 38, y: 68 },
        { x: 2, y: 42 }, { x: 46, y: 42 }
      ], { left: cx - 60, top: cy - 58, fill: '#FFC000', stroke: '#c09000', strokeWidth: 2 })
      break
    case 'rect':
      obj = new fabric.Rect({ left: cx - 60, top: cy - 40, width: 120, height: 70, fill: '#C9E0F5', stroke: '#4472C4', strokeWidth: 2 })
      break
    case 'ellipse':
      obj = new fabric.Ellipse({ left: cx - 65, top: cy - 40, rx: 65, ry: 40, fill: '#FFE699', stroke: '#c09000', strokeWidth: 2 })
      break
    case 'triangle':
      obj = new fabric.Triangle({ left: cx - 55, top: cy - 50, width: 110, height: 95, fill: '#70AD47', stroke: '#4a8030', strokeWidth: 2 })
      break
    case 'hexagon':
      obj = new fabric.Polygon([{ x: 50, y: 0 }, { x: 100, y: 28 }, { x: 100, y: 84 }, { x: 50, y: 112 }, { x: 0, y: 84 }, { x: 0, y: 28 }],
        { left: cx - 50, top: cy - 56, fill: '#9B59B6', stroke: '#6c3483', strokeWidth: 2 })
      break
    case 'cross':
      obj = new fabric.Polygon([{ x: 28, y: 0 }, { x: 72, y: 0 }, { x: 72, y: 28 }, { x: 100, y: 28 }, { x: 100, y: 72 }, { x: 72, y: 72 }, { x: 72, y: 100 }, { x: 28, y: 100 }, { x: 28, y: 72 }, { x: 0, y: 72 }, { x: 0, y: 28 }, { x: 28, y: 28 }],
        { left: cx - 50, top: cy - 50, fill: '#E74C3C', stroke: '#a93226', strokeWidth: 2 })
      break
    case 'rounded-rect':
      obj = new fabric.Rect({ left: cx - 60, top: cy - 38, width: 120, height: 70, fill: '#E8DAEF', stroke: '#9B59B6', strokeWidth: 2, rx: 16, ry: 16 })
      break
    default:
      obj = new fabric.Rect({ left: cx - 50, top: cy - 35, width: 100, height: 70, fill: '#4472C4', stroke: '#2255aa', strokeWidth: 2 })
  }

  if (obj) {
    canvas.value.add(obj)
    canvas.value.setActiveObject(obj)
    canvas.value.renderAll()
    saveState()
  }
}
</script>

<style scoped>
.shape-library {
  width: 100%;
  background: #1a1a2e;
  border-right: 1px solid #2d2d3f;
  overflow-y: auto;
  flex-shrink: 0;
}

.lib-header {
  padding: 8px 12px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #7c7caa;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #2d2d3f;
  position: sticky;
  top: 0;
  background: #1a1a2e;
  z-index: 1;
}

.shape-group {
  border-bottom: 1px solid #22223a;
}

.group-title {
  padding: 6px 12px 4px;
  font-size: 10px;
  color: #6666aa;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.shape-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 4px 8px 8px;
}

.shape-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.shape-item:hover {
  background: #2a2a48;
}

.shape-item:active {
  background: #3a3a68;
}

.shape-item svg {
  display: block;
}

.shape-item span {
  font-size: 9px;
  color: #8888aa;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 54px;
}
</style>
