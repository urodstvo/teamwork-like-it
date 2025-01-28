import type { EditorState } from '@/store'
import { getPointerPosition, setResizeCursor } from '@/lib/helpers'
import {
	getDirection,
	getSelectedElementsFromSelectionArea,
	getSelectionFrame,
	isCursorInSelectionFrame,
	isCursorOnSelectionFrameBound,
	replaceSelectionFrame,
	resizeSelectionFrame,
} from '@/scene/selection.ts'

const dragSpeed = 1.0
const lastMousePosition = { x: 0, y: 0 }

export function handlePointerMove(event: PointerEvent, state: EditorState) {
	const { x, y } = getPointerPosition(event, state.interactiveCanvasRef!, state.zoom)

	if (state.newElement) state.newElement.moveTo(x, y)

	if (state.isSelecting) {
		state.selectionArea!.rightX = x
		state.selectionArea!.rightY = y

		const selectedElements = getSelectedElementsFromSelectionArea(
			state.elements,
			state.selectionArea,
			state.canvasOffset,
		)
		if (selectedElements.length > 0 && state.selectedElementsIds.length !== selectedElements.length) {
			state.selectionFrame = getSelectionFrame(selectedElements)
			state.selectedElementsIds = selectedElements.map(el => el.id)
		}
	}

	if (state.isDragging) {
		if (!state.startDragPosition) return

		document.body.style.cursor = 'grabbing'

		const dx = event.clientX - lastMousePosition.x
		const dy = event.clientY - lastMousePosition.y

		const currentOffsetX = state.canvasOffset.offsetX + dx * (dragSpeed / state.zoom)
		const currentOffsetY = state.canvasOffset.offsetY + dy * (dragSpeed / state.zoom)
		state.canvasOffset.offsetX = currentOffsetX
		state.canvasOffset.offsetY = currentOffsetY
	}

	if (state.selectionFrame) {
		const cursorX = x - state.canvasOffset.offsetX
		const cursorY = y - state.canvasOffset.offsetY

		if (state.isReplacing) replaceSelectionFrame(state, cursorX, cursorY)
		const selectedElements = state.elements.filter(el => state.selectedElementsIds.includes(el.id))
		const selectionFrame = getSelectionFrame(selectedElements)

		const cursorInSelectionFrame = isCursorInSelectionFrame(selectionFrame, cursorX, cursorY)
		const cursorOnSelectionFrameBound = isCursorOnSelectionFrameBound(selectionFrame, cursorX, cursorY)
		if ((cursorInSelectionFrame && !state.isResizing) || state.isReplacing) {
			if (cursorOnSelectionFrameBound.some(el => el))
				document.body.style.cursor = `${getDirection(selectionFrame, cursorX, cursorY)}-resize`
			else document.body.style.cursor = 'move'
		}
		else if (state.isResizing) {
			setResizeCursor(state.resizeDirection)
		}
		else {
			document.body.style.cursor = 'default'
		}

		if (state.isResizing) resizeSelectionFrame(state, cursorX, cursorY)
	}

	lastMousePosition.x = event.clientX
	lastMousePosition.y = event.clientY
}
