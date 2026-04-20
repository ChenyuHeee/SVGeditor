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

  const _download = (href: string, filename: string) => {
    const a = document.createElement('a')
    a.href = href
    a.download = filename
    a.click()
  }

  return { exportSVG, exportPNG }
}