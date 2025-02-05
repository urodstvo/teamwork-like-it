import type { EditorState } from '@/store'
import { getVisibleElements } from '@/lib/helpers'

export function handlePointerUp(event: PointerEvent, state: EditorState) {
  switch (event.button) {
    case 0: {
      const elements = getVisibleElements(
        state.interactiveCtx!,
        state.canvasOffset.x,
        state.canvasOffset.y,
        state.zoom,
        state.objectsMap,
      )
      elements.forEach((el) => el.trigger('pointerup', event, state))
      state.selectionFrame.trigger('pointerup', event, state)
      state.selectionArea.trigger('pointerup', event, state)
      state.newElement?.trigger('pointerup', event, state)
      state.newLine?.trigger('pointerup', event, state)
      document.body.style.cursor = 'default'
      break
    }
    case 2: {
      if (state.isDragging) {
        state.isDragging = false
        state.startDragPosition = { x: 0, y: 0 }
        document.body.style.cursor = 'default'
      }
    }
  }
}
