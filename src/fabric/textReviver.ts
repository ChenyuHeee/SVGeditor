import { fabric } from 'fabric'

/**
 * 用于 fabric.loadSVGFromString 的 reviver 函数，
 * 将普通文本元素转换为 fabric.IText 以支持直接编辑
 */
export const textReviver = (element: any, object: any) => {
  if (object.type === 'text') {
    return new fabric.IText(object.text || '', {
      left: object.left,
      top: object.top,
      fontSize: object.fontSize,
      fontFamily: object.fontFamily,
      fill: object.fill,
      fontWeight: object.fontWeight,
      fontStyle: object.fontStyle,
      textAlign: object.textAlign,
      lineHeight: object.lineHeight,
      width: object.width,
      height: object.height
    })
  }
  return object
}