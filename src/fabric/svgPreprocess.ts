/**
 * 预处理 SVG 字符串，移除可能导致 Fabric 解析失败的内容
 * 例如：@media 查询、不支持的 style 标签等
 */
export const preprocessSVG = (svgString: string): string => {
  // 移除 <style> 中的 @media 块
  let processed = svgString.replace(/@media[^{]*\{[\s\S]*?\}\s*\}/g, '')
  // 也可以移除所有 <style> 标签（简单处理）
  // processed = processed.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  // 移除 doctype 声明（如果有）
  processed = processed.replace(/<!DOCTYPE[^>]*>/i, '')
  return processed
}