import type { EditorState } from '@/store'
import { getVisibleElements } from '@/lib/helpers'

const dragSpeed = 1.0
const lastMousePosition = { x: 0, y: 0 }

export function handlePointerMove(event: PointerEvent, state: EditorState) {
  if (state.isDragging) {
    if (!state.startDragPosition) return

    document.body.style.cursor = 'grabbing'

    const dx = event.clientX - lastMousePosition.x
    const dy = event.clientY - lastMousePosition.y

    const currentOffsetX = state.canvasOffset.x + dx * (dragSpeed / state.zoom)
    const currentOffsetY = state.canvasOffset.y + dy * (dragSpeed / state.zoom)
    state.canvasOffset.x = currentOffsetX
    state.canvasOffset.y = currentOffsetY
  }

  const elements = getVisibleElements(
    state.interactiveCtx!,
    state.canvasOffset.x,
    state.canvasOffset.y,
    state.zoom,
    state.objectsMap,
  )
  state.newLine?.trigger('pointermove', event, state)
  elements.forEach((el) => el.trigger('pointermove', event, state))
  state.selectionFrame.trigger('pointermove', event, state)
  state.selectionArea.trigger('pointermove', event, state)
  state.newElement?.trigger('pointermove', event, state)

  lastMousePosition.x = event.clientX
  lastMousePosition.y = event.clientY
}
