import type { EditorState } from '@/store'

export function getPointerPosition(
  event: PointerEvent | WheelEvent,
  canvas: HTMLCanvasElement,
  zoom: EditorState['zoom'],
) {
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) / zoom
  const y = (event.clientY - rect.top) / zoom

  return { x, y }
}

export function getOffsetedPointerPosition(
  event: PointerEvent | WheelEvent,
  canvas: HTMLCanvasElement,
  zoom: EditorState['zoom'],
  canvasOffset: EditorState['canvasOffset'],
) {
  const { x, y } = getPointerPosition(event, canvas, zoom)
  return {
    x: x - canvasOffset.x,
    y: y - canvasOffset.y,
  }
}

export function normalizePoint(n: number) {
  const x = Math.round(Math.abs(n) / 10) * 10
  return n >= 0 ? x : -x
}
