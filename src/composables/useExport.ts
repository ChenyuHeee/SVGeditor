import { useCanvas } from './useCanvas'

export const useExport = () => {
  const { canvas } = useCanvas()

  const exportSVG = (filename = 'diagram.svg') => {
    if (!canvas.value) return
    const svg = canvas.value.toSVG()
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    _download(url, filename)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const exportPNG = (filename = 'diagram.png', multiplier = 2) => {
    if (!canvas.value) return
    const dataURL = canvas.value.toDataURL({ format: 'png', multiplier })
    _download(dataURL, filename)
  }

  const exportPNG300 = (filename = 'diagram-300dpi.png') => exportPNG(filename, 3)

  const copySVGToClipboard = async () => {
    if (!canvas.value) return false
    const svg = canvas.value.toSVG()
    try {
      await navigator.clipboard.writeText(svg)
      return true
    } catch(_e) {
      const el = document.createElement('textarea')
      el.value = svg
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      return true
    }
  }

  const _download = (href, filename) => {
    const a = document.createElement('a')
    a.href = href
    a.download = filename
    a.click()
  }

  return { exportSVG, exportPNG, exportPNG300, copySVGToClipboard }
}