import JSZip from 'jszip'
import { fabric } from 'fabric'
import { useCanvas } from './useCanvas'
import { useHistory } from './useHistory'

// EMU -> px (914400 EMU = 1 inch = 96px)
const emu2px = (emu: number) => (emu / 914400) * 96

// Parse hex color from OOXML (may be "FF0000" or "auto")
const parseColor = (hex?: string): string => {
  if (!hex || hex === 'auto') return '#000000'
  return '#' + hex.slice(-6)
}

// Get text content from OOXML <a:t> nodes
const getText = (sp: Element): string => {
  return Array.from(sp.querySelectorAll('t')).map(t => t.textContent ?? '').join('')
}

export const useImportPPTX = () => {
  const { canvas } = useCanvas()
  const { saveState } = useHistory()

  const importPPTX = async (file: File) => {
    if (!canvas.value) return
    const buf = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(buf)

    // Find slide files
    const slideFiles = Object.keys(zip.files)
      .filter(n => n.match(/^ppt\/slides\/slide[0-9]+\.xml$/))
      .sort()

    if (slideFiles.length === 0) {
      alert('未找到幻灯片内容')
      return
    }

    // Use first slide
    const slideXml = await zip.files[slideFiles[0]].async('text')
    const parser = new DOMParser()
    const doc = parser.parseFromString(slideXml, 'text/xml')

    // Get slide dimensions from presentation.xml
    let slideW = 9144000  // default 10in
    let slideH = 6858000  // default 7.5in
    const presFile = zip.files['ppt/presentation.xml']
    if (presFile) {
      const presXml = await presFile.async('text')
      const presDoc = parser.parseFromString(presXml, 'text/xml')
      const sldSz = presDoc.querySelector('sldSz')
      if (sldSz) {
        slideW = parseInt(sldSz.getAttribute('cx') ?? '9144000')
        slideH = parseInt(sldSz.getAttribute('cy') ?? '6858000')
      }
    }

    const slideWpx = emu2px(slideW)
    const slideHpx = emu2px(slideH)

    // Resize canvas to match slide
    canvas.value.setWidth(slideWpx)
    canvas.value.setHeight(slideHpx)

    const shapes = Array.from(doc.querySelectorAll('sp, pic'))
    for (const sp of shapes) {
      const xfrm = sp.querySelector('xfrm')
      if (!xfrm) continue

      const off = xfrm.querySelector('off')
      const ext = xfrm.querySelector('ext')
      if (!off || !ext) continue

      const x = emu2px(parseInt(off.getAttribute('x') ?? '0'))
      const y = emu2px(parseInt(off.getAttribute('y') ?? '0'))
      const w = emu2px(parseInt(ext.getAttribute('cx') ?? '0'))
      const h = emu2px(parseInt(ext.getAttribute('cy') ?? '0'))

      const prstGeom = sp.querySelector('prstGeom')
      const prst = prstGeom?.getAttribute('prst') ?? ''

      // Fill color
      const fgClr = sp.querySelector('solidFill schemeClr, solidFill srgbClr')
      const fillHex = fgClr?.getAttribute('val') ?? fgClr?.getAttribute('lastClr')
      const fillColor = fillHex ? parseColor(fillHex) : '#4472C4'

      // Stroke
      const lnClr = sp.querySelector('ln solidFill srgbClr, ln solidFill schemeClr')
      const strokeHex = lnClr?.getAttribute('val') ?? lnClr?.getAttribute('lastClr')
      const strokeColor = strokeHex ? parseColor(strokeHex) : ''
      const lnW = sp.querySelector('ln')?.getAttribute('w')
      const strokeWidth = lnW ? Math.max(1, Math.round(emu2px(parseInt(lnW)) * 0.5)) : 0

      const textContent = getText(sp)

      let obj: fabric.Object | null = null

      if (prst === 'ellipse' || prst === 'oval') {
        obj = new fabric.Ellipse({
          left: x, top: y, rx: w / 2, ry: h / 2,
          fill: fillColor, stroke: strokeColor, strokeWidth,
        })
      } else if (prst === 'line' || prst === 'straightConnector1') {
        obj = new fabric.Line([x, y, x + w, y + h], {
          stroke: strokeColor || fillColor, strokeWidth: strokeWidth || 2,
          fill: '',
        })
      } else {
        // Default: rect (covers rect, roundRect, etc.)
        obj = new fabric.Rect({
          left: x, top: y, width: w, height: h,
          fill: fillColor, stroke: strokeColor, strokeWidth,
        })
      }

      canvas.value.add(obj)

      // Add text if present
      if (textContent.trim()) {
        const fontSize = sp.querySelector('r rPr')?.getAttribute('sz')
        const fsPx = fontSize ? parseInt(fontSize) / 100 * 1.333 : 16
        const bold = sp.querySelector('r rPr')?.getAttribute('b') === '1'
        const textColor = sp.querySelector('r rPr solidFill srgbClr')?.getAttribute('val')

        const textObj = new fabric.IText(textContent, {
          left: x + w / 2,
          top: y + h / 2,
          originX: 'center',
          originY: 'center',
          fontSize: fsPx,
          fontFamily: 'Arial',
          fontWeight: bold ? 'bold' : 'normal',
          fill: textColor ? parseColor(textColor) : '#000000',
          textAlign: 'center',
        })
        canvas.value.add(textObj)
      }
    }

    canvas.value.renderAll()
    saveState()
  }

  return { importPPTX }
}
