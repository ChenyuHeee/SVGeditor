import pptxgen from 'pptxgenjs'
import { fabric } from 'fabric'
import { useCanvas } from './useCanvas'
import { useTabs } from './useTabs'

// px -> inches (96dpi)
const px2in = (px: number) => px / 96

// hex or named color -> 6-char hex (no #) for pptxgenjs
const toHex6 = (color: string): string => {
  if (!color || color === 'transparent') return 'FFFFFF'
  if (color.startsWith('#')) return color.slice(1).padEnd(6, '0')
  // named color fallback via canvas
  const ctx = document.createElement('canvas').getContext('2d')!
  ctx.fillStyle = color
  return ctx.fillStyle.slice(1)
}

export const useExportPPTX = () => {
  const { canvas } = useCanvas()
  const { activeTab } = useTabs()

  const exportPPTX = async (filename = 'diagram.pptx') => {
    if (!canvas.value) return
    const pptx = new pptxgen()

    const cw = canvas.value.getWidth()
    const ch = canvas.value.getHeight()
    pptx.defineLayout({ name: 'CUSTOM', width: px2in(cw), height: px2in(ch) })
    pptx.layout = 'CUSTOM'

    const slide = pptx.addSlide()

    // Background
    const bg = (canvas.value as any).backgroundColor
    if (bg && bg !== 'transparent') {
      slide.background = { color: toHex6(bg) }
    }

    const objects = canvas.value.getObjects()
    for (const obj of objects) {
      await addObjectToSlide(slide, obj, cw, ch)
    }

    await pptx.writeFile({ fileName: filename })
  }

  const addObjectToSlide = async (
    slide: pptxgen.Slide,
    obj: fabric.Object,
    cw: number,
    ch: number
  ) => {
    const b = obj.getBoundingRect(true)
    const x = px2in(b.left)
    const y = px2in(b.top)
    const w = px2in(b.width)
    const h = px2in(b.height)

    const fillColor = toHex6((obj as any).fill as string)
    const strokeColor = toHex6((obj as any).stroke as string)
    const strokeWidth = ((obj as any).strokeWidth as number) ?? 0

    const lineOpts: pptxgen.ShapeLineProps = strokeWidth > 0
      ? { color: strokeColor, width: strokeWidth, dashType: 'solid' }
      : { width: 0 }

    const type = obj.type

    if (type === 'rect') {
      slide.addShape('rect', {
        x, y, w, h,
        fill: { color: (obj as any).fill === 'transparent' ? 'FFFFFF' : fillColor, transparency: (obj as any).fill === 'transparent' ? 100 : 0 },
        line: lineOpts,
      })
    } else if (type === 'ellipse' || type === 'circle') {
      slide.addShape('ellipse', {
        x, y, w, h,
        fill: { color: fillColor },
        line: lineOpts,
      })
    } else if (type === 'line') {
      const lo = obj as fabric.Line
      const x1 = px2in((lo.x1 ?? 0) + (lo.left ?? 0))
      const y1 = px2in((lo.y1 ?? 0) + (lo.top ?? 0))
      const x2 = px2in((lo.x2 ?? 0) + (lo.left ?? 0))
      const y2 = px2in((lo.y2 ?? 0) + (lo.top ?? 0))
      slide.addShape('line', {
        x: Math.min(x1, x2), y: Math.min(y1, y2),
        w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
        line: { color: strokeColor, width: strokeWidth || 1 },
      })
    } else if (type === 'i-text' || type === 'text' || type === 'textbox') {
      const to = obj as fabric.IText
      slide.addText(to.text ?? '', {
        x, y, w, h,
        fontSize: ((to.fontSize ?? 18) * 0.75), // px->pt
        fontFace: (to.fontFamily as string) ?? 'Arial',
        bold: to.fontWeight === 'bold',
        italic: to.fontStyle === 'italic',
        color: toHex6((to.fill as string) ?? '#000000'),
        align: (to.textAlign as pptxgen.HAlign) ?? 'left',
        valign: 'middle',
      })
    } else if (type === 'group') {
      // 递归处理组内对象
      const group = obj as fabric.Group
      for (const child of group.getObjects()) {
        await addObjectToSlide(slide, child, cw, ch)
      }
    } else {
      // 其他类型（路径、图像等）导出为图片占位
      try {
        const dataUrl = (obj as any).toDataURL({ format: 'png', multiplier: 2 })
        slide.addImage({ data: dataUrl, x, y, w, h })
      } catch (_) {
        // ignore
      }
    }
  }

  return { exportPPTX }
}
