import type { EditorState } from '@/store'

export function setResizeCursor(direction: EditorState['resizeDirection']) {
	const { left, right, top, bottom } = direction
	if ((left || right) && (!top && !bottom)) document.body.style.cursor = 'e-resize'
	else if ((top || bottom) && (!left && !right)) document.body.style.cursor = 'n-resize'
	else if ((right && top) || (left && bottom)) document.body.style.cursor = 'ne-resize'
	else if ((left && top) || (right && bottom)) document.body.style.cursor = 'nw-resize'
	else document.body.style.cursor = 'default'
}

export function changeResizeDirectionOnBoundIntersect(state: EditorState, cursorX: number, cursorY: number) {
	if (!state.selectionFrame) return

	const { left, right, top, bottom } = state.resizeDirection

	if (cursorX < state.selectionFrame.leftX && right) {
		const temp = state.selectionFrame.leftX
		state.selectionFrame.leftX = state.selectionFrame.rightX
		state.selectionFrame.rightX = temp
		state.resizeDirection.left = true
		state.resizeDirection.right = false
	}
	if (cursorX > state.selectionFrame.rightX && left) {
		const temp = state.selectionFrame.leftX
		state.selectionFrame.leftX = state.selectionFrame.rightX
		state.selectionFrame.rightX = temp
		state.resizeDirection.left = false
		state.resizeDirection.right = true
	}
	if (cursorY < state.selectionFrame.leftY && bottom) {
		const temp = state.selectionFrame.leftY
		state.selectionFrame.leftY = state.selectionFrame.rightY
		state.selectionFrame.rightY = temp
		state.resizeDirection.top = true
		state.resizeDirection.bottom = false
	}
	if (cursorY > state.selectionFrame.rightY && top) {
		const temp = state.selectionFrame.leftY
		state.selectionFrame.leftY = state.selectionFrame.rightY
		state.selectionFrame.rightY = temp
		state.resizeDirection.top = false
		state.resizeDirection.bottom = true
	}
}
