import type { EditorState } from '@/store'
import { getPointerPosition } from '@/lib/helpers'

const zoomSpeed = 0.25 // Скорость зума

export function handleWheel(event: WheelEvent, state: EditorState) {
  event.preventDefault()

  const zoomIn = event.deltaY < 0
  const scale = zoomIn ? zoomSpeed : -zoomSpeed
  const zoom = Math.max(0.5, Math.min(state.zoom + scale, 2))

  if (zoom === state.zoom) return
  const { x, y } = getPointerPosition(event, state.staticCanvasRef!, state.zoom)

  const zoomFactor = zoom / state.zoom
  state.canvasOffset.x -= Math.round((x - state.canvasOffset.x) * (zoomFactor - 1))
  state.canvasOffset.y -= Math.round((y - state.canvasOffset.y) * (zoomFactor - 1))

  state.staticCtx?.translate(x, y)
  state.interactiveCtx?.translate(x, y)

  state.staticCtx?.scale(zoom, zoom)
  state.interactiveCtx?.scale(zoom, zoom)

  state.staticCtx?.translate(-x, -y)
  state.interactiveCtx?.translate(-x, -y)

  state.zoom = zoom
}
