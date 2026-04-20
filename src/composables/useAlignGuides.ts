import { fabric } from 'fabric'

const SNAP_THRESHOLD = 6   // px 内触发吸附
const LINE_COLOR = '#6666ff'
const CENTER_COLOR = '#ff4466'

interface Guide {
  type: 'v' | 'h'    // vertical / horizontal
  pos: number        // canvas 坐标
  color: string
}

export function initAlignmentGuides(canvas: fabric.Canvas) {
  let guides: Guide[] = []
  let snapEnabled = true

  // ── 绘制辅助线 ─────────────────────────────────────────────────────────
  const drawGuides = () => {
    const ctx = canvas.getSelectionContext()
    const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]
    const zoom = canvas.getZoom()
    ctx.save()
    ctx.clearRect(0, 0, canvas.getWidth(), canvas.getHeight())

    for (const g of guides) {
      ctx.strokeStyle = g.color
      ctx.lineWidth = 1
      ctx.setLineDash([4, 3])
      ctx.beginPath()
      if (g.type === 'v') {
        const x = g.pos * zoom + vpt[4]
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.getHeight())
      } else {
        const y = g.pos * zoom + vpt[5]
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.getWidth(), y)
      }
      ctx.stroke()
    }
    ctx.restore()
  }

  const clearGuides = () => {
    guides = []
    const ctx = canvas.getSelectionContext()
    ctx.clearRect(0, 0, canvas.getWidth(), canvas.getHeight())
  }

  // ── 计算所有其他对象的吸附锚点 ────────────────────────────────────────
  const getAnchors = (active: fabric.Object) => {
    const cw = canvas.getWidth()
    const ch = canvas.getHeight()

    // 画布边缘和中心
    const vAnchors: number[] = [0, cw / 2, cw]
    const hAnchors: number[] = [0, ch / 2, ch]

    for (const obj of canvas.getObjects()) {
      if (obj === active) continue
      if ((active as any).type === 'activeSelection') {
        // 跳过多选内的成员
        if ((active as fabric.ActiveSelection).contains(obj as any)) continue
      }
      const b = obj.getBoundingRect(true)
      vAnchors.push(b.left, b.left + b.width / 2, b.left + b.width)
      hAnchors.push(b.top, b.top + b.height / 2, b.top + b.height)
    }
    return { vAnchors, hAnchors }
  }

  // ── 核心：移动时检测吸附 ──────────────────────────────────────────────
  const onMoving = (e: fabric.IEvent) => {
    if (!snapEnabled) return
    const obj = e.target
    if (!obj) return

    guides = []
    const b = obj.getBoundingRect(true)
    const { vAnchors, hAnchors } = getAnchors(obj)

    // 被拖拽对象的垂直/水平关键点
    const objLeft   = b.left
    const objCenterX = b.left + b.width / 2
    const objRight  = b.left + b.width
    const objTop    = b.top
    const objCenterY = b.top + b.height / 2
    const objBottom = b.top + b.height

    let snapDx = Infinity
    let snapDy = Infinity

    for (const ax of vAnchors) {
      for (const ox of [objLeft, objCenterX, objRight]) {
        const d = Math.abs(ax - ox)
        if (d < SNAP_THRESHOLD && d < Math.abs(snapDx)) {
          snapDx = ax - ox
          guides = guides.filter(g => g.type !== 'v')
          guides.push({
            type: 'v', pos: ax,
            color: ax === 0 || ax === canvas.getWidth() ? LINE_COLOR : CENTER_COLOR,
          })
        }
      }
    }

    for (const ay of hAnchors) {
      for (const oy of [objTop, objCenterY, objBottom]) {
        const d = Math.abs(ay - oy)
        if (d < SNAP_THRESHOLD && d < Math.abs(snapDy)) {
          snapDy = ay - oy
          guides = guides.filter(g => g.type !== 'h')
          guides.push({
            type: 'h', pos: ay,
            color: ay === 0 || ay === canvas.getHeight() ? LINE_COLOR : CENTER_COLOR,
          })
        }
      }
    }

    // 应用吸附偏移
    if (Math.abs(snapDx) < SNAP_THRESHOLD) {
      obj.set('left', (obj.left ?? 0) + snapDx)
    }
    if (Math.abs(snapDy) < SNAP_THRESHOLD) {
      obj.set('top', (obj.top ?? 0) + snapDy)
    }

    obj.setCoords()
    drawGuides()
  }

  const onModified = () => clearGuides()
  const onMouseUp  = () => clearGuides()

  canvas.on('object:moving', onMoving)
  canvas.on('object:modified', onModified)
  canvas.on('mouse:up', onMouseUp)

  // 暴露控制接口
  return {
    enable:  () => { snapEnabled = true },
    disable: () => { snapEnabled = false; clearGuides() },
    toggle:  () => { snapEnabled = !snapEnabled; if (!snapEnabled) clearGuides() },
    get isEnabled() { return snapEnabled },
  }
}
