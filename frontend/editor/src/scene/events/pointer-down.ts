import type { EditorState } from '@/store'
import { getElementWithCursorInside } from '@/elements'
import { getPointerPosition } from '@/lib/helpers'
import { getSelectionFrame, isCursorInSelectionFrame, isCursorOnSelectionFrameBound } from '@/scene/selection'

export function handlePointerDown(event: PointerEvent, state: EditorState) {
	const { x, y } = getPointerPosition(event, state.interactiveCanvasRef!, state.zoom)

	switch (event.button) {
		case 0: {
			if (state.newElement) {
				state.newElement.restyle('rgba(0,0,0,1)', 'rgba(0,0,0,1)')
				state.newElement.moveBy(-state.canvasOffset.offsetX, -state.canvasOffset.offsetY)
				state.elements.push(state.newElement)
				state.lastElementType = state.newElement.type
				state.selectedElementsIds = [state.newElement.id]
				state.newElement = null
				document.body.style.cursor = 'default'

				return
			}

			const cursorX = x - state.canvasOffset.offsetX
			const cursorY = y - state.canvasOffset.offsetY
			if (state.selectionFrame) {
				const selectedElements = state.elements.filter(el => state.selectedElementsIds.includes(el.id))
				const selectionFrame = getSelectionFrame(selectedElements)
				if (isCursorInSelectionFrame(selectionFrame, cursorX, cursorY)) {
					const cursorOnSelectionFrameBound = isCursorOnSelectionFrameBound(
						selectionFrame,
						cursorX,
						cursorY,
					)
					if (cursorOnSelectionFrameBound.some(el => el)) {
						state.isResizing = true

						const [left, top, right, bottom] = cursorOnSelectionFrameBound
						state.resizeDirection.left = left
						state.resizeDirection.right = right
						state.resizeDirection.top = top
						state.resizeDirection.bottom = bottom

						return
					}

					state.isReplacing = true
					state.replaceFrameOffset.x = cursorX - selectionFrame.leftX
					state.replaceFrameOffset.y = cursorY - selectionFrame.leftY

					return
				}
				else {
					state.selectedElementsFixedState.clear()
					state.selectionFrame = null
					state.selectedElementsIds = []
				}
			}
			else {
				const element = getElementWithCursorInside(state.elements, cursorX, cursorY)
				if (element) {
					state.selectionFrame = {
						leftX: element.x,
						leftY: element.y,
						rightX: element.x + element.width,
						rightY: element.y + element.height,
					}

					state.selectedElementsIds = [element.id]
					state.isReplacing = true
					state.replaceFrameOffset.x = cursorX - element.x
					state.replaceFrameOffset.y = cursorY - element.y
					return
				}
			}

			state.selectionArea = { leftX: x, leftY: y, rightX: x, rightY: y }
			state.isSelecting = true

			break
		}
		case 2: {
			if (state.newElement) {
				state.newElement = null
				return
			}

			state.isDragging = true
			state.startDragPosition = { x, y }
			document.body.style.cursor = 'grab'
			break
		}
	}
}
