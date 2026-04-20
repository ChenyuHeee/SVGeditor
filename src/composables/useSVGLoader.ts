import { fabric } from 'fabric'
import { useCanvas } from './useCanvas'
import { useHistory } from './useHistory'

const preprocessSVG = (svg: string): string => {
  return svg
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
}

export const useSVGLoader = () => {
  const { canvas } = useCanvas()
  const { saveState } = useHistory()

  const loadSVGFromString = (svgString: string) => {
    if (!canvas.value) return
    const clean = preprocessSVG(svgString)

    fabric.loadSVGFromString(
      clean,
      (objects, options) => {
        canvas.value!.clear()
        if (!objects.length) return

        const group = fabric.util.groupSVGElements(objects, options)
        const cw = canvas.value!.getWidth()
        const ch = canvas.value!.getHeight()
        const scale = Math.min(
          cw / ((group.width ?? cw) + 80),
          ch / ((group.height ?? ch) + 80),
          1
        )
        group.scale(scale)
        group.center()
        group.setCoords()
        canvas.value!.add(group)
        canvas.value!.renderAll()
        saveState()
      },
      // reviver: convert text → IText for double-click editing
      (el: Element, obj: fabric.Object) => {
        if (obj.type === 'text') {
          const t = obj as fabric.Text
          return new fabric.IText(t.text ?? '', {
            left: t.left, top: t.top,
            fontSize: t.fontSize, fontFamily: t.fontFamily,
            fill: t.fill as string, fontWeight: t.fontWeight,
            fontStyle: t.fontStyle, textAlign: t.textAlign,
          }) as unknown as fabric.Object
        }
        return obj
      }
    )
  }

  const loadSVGFromFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') loadSVGFromString(e.target.result)
    }
    reader.readAsText(file)
  }

  const loadSVGFromURL = (url: string) => {
    fetch(url)
      .then(r => r.text())
      .then(loadSVGFromString)
      .catch(err => console.error('Load SVG failed:', err))
  }

  return { loadSVGFromString, loadSVGFromFile, loadSVGFromURL }
}