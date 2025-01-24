import type { EditorState } from '@/store'

export function handlePointerUp(event: PointerEvent, state: EditorState) {
	switch (event.button) {
		case 0: {
			if (state.isSelecting) {
				state.isSelecting = false
				state.selectionArea = null
			}

			if (state.isReplacing) {
				state.isReplacing = false
				state.selectionArea = null
			}

			if (state.isResizing) {
				state.isResizing = false
				state.resizeDirection.left = false
				state.resizeDirection.top = false
				state.resizeDirection.bottom = false
				state.resizeDirection.right = false

				document.body.style.cursor = 'default'
			}

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
