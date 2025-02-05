import type { Element } from '@/elements'
import type { Line } from '@/links'
import type { EditorState } from '@/store'

export function setResizeCursor(direction: EditorState['resizeDirection']) {
  const { left, right, top, bottom } = direction
  if ((left || right) && !top && !bottom) document.body.style.cursor = 'e-resize'
  else if ((top || bottom) && !left && !right) document.body.style.cursor = 'n-resize'
  else if ((right && top) || (left && bottom)) document.body.style.cursor = 'ne-resize'
  else if ((left && top) || (right && bottom)) document.body.style.cursor = 'nw-resize'
}

export function getAllElements(objectsMap: EditorState['objectsMap']) {
  return Array.from(objectsMap.keys())
    .map((id) => objectsMap.get(id) as Element)
    .filter((el) => 'type' in el)
}

export function getAllLinks(linksMap: EditorState['linksMap']) {
  return Array.from(linksMap.keys()).map((id) => linksMap.get(id) as Line)
}

export function getVisibleLinks(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  zoom: number,
  linksMap: EditorState['linksMap'],
) {
  const links = getAllLinks(linksMap)
  return links.filter((link) => link.isVisible(ctx.canvas, offsetX, offsetY, zoom))
}

export function getVisibleElements(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  zoom: number,
  objectsMap: EditorState['objectsMap'],
) {
  const elements = getAllElements(objectsMap)
  return elements.filter((element) => element.isVisible(ctx.canvas, offsetX, offsetY, zoom))
}
