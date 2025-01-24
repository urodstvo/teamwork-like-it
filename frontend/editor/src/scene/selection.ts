import type { EditorState } from '@/store'
import { type Element, moveElements } from '@/elements'
import { changeResizeDirectionOnBoundIntersect, normalizePoint } from '@/lib/helpers'

export function getDirection(selectionFrame: Exclude<EditorState['selectionFrame'], null>, cursorX: number, cursorY: number) {
	const [left, top, right, bottom] = isCursorOnSelectionFrameBound(selectionFrame, cursorX, cursorY)
	let direction: 'n' | 'e' | 'ne' | 'nw' | undefined

	if (top || bottom) direction = 'n'
	if (left || right) direction = 'e'
	if ((left && top) || (right && bottom)) direction = 'nw'
	if ((right && top) || (left && bottom)) direction = 'ne'

	return direction
}

export function getSelectedElementsFromSelectionArea(
	elements: Element[],
	selectionArea: EditorState['selectionArea'],
	canvasOffset: EditorState['canvasOffset'],
): Element[] {
	if (!selectionArea) return []

	const { leftX, leftY, rightX, rightY } = normalizeSelectionArea(selectionArea)

	return elements.filter((el) => {
		const a = el.x + canvasOffset.offsetX >= leftX
		const b = el.y + canvasOffset.offsetY >= leftY
		const c = el.x + el.width + canvasOffset.offsetX <= rightX
		const d = el.y + el.height + canvasOffset.offsetY <= rightY

		return a && b && c && d
	})
}

export function getSelectionFrame(elements: Element[]) {
	let leftX = Number.MAX_VALUE
	let leftY = Number.MAX_VALUE
	let rightX = -Number.MAX_VALUE
	let rightY = -Number.MAX_VALUE

	elements.forEach((el) => {
		if (el.x < leftX) leftX = el.x
		if (el.x + el.width > rightX) rightX = el.x + el.width
		if (el.y < leftY) leftY = el.y
		if (el.y + el.height > rightY) rightY = el.y + el.height
	})

	return { leftX, leftY, rightX, rightY }
}

export function normalizeSelectionArea(selectionArea: Exclude<EditorState['selectionArea'], null>) {
	let { leftX, leftY, rightX, rightY } = selectionArea

	if (rightY - leftY < 0) {
		const tmp = leftY
		leftY = rightY
		rightY = tmp
	}
	if (rightX - leftX < 0) {
		const tmp = leftX
		leftX = rightX
		rightX = tmp
	}

	return {
		leftX,
		leftY,
		rightX,
		rightY,
	}
}

export function isCursorInSelectionFrame(selectionFrame: Exclude<EditorState['selectionArea'], null>, cursorX: number, cursorY: number) {
	return cursorX >= selectionFrame.leftX - 6 && cursorX <= selectionFrame.rightX + 6 && cursorY >= selectionFrame.leftY - 6 && cursorY <= selectionFrame.rightY + 6
}

export function isCursorOnSelectionFrameBound(selectionFrame: Exclude<EditorState['selectionFrame'], null>, cursorX: number, cursorY: number) {
	const maxGap = 6

	const isCursorOnLeftBound = cursorX >= selectionFrame.leftX - maxGap && cursorX <= selectionFrame.leftX
	const isCursorOnTopBound = cursorY >= selectionFrame.leftY - maxGap && cursorY <= selectionFrame.leftY
	const isCursorOnRightBound = cursorX >= selectionFrame.rightX && cursorX <= selectionFrame.rightX + maxGap
	const isCursorOnBottomBound = cursorY >= selectionFrame.rightY && cursorY <= selectionFrame.rightY + maxGap
	return [isCursorOnLeftBound, isCursorOnTopBound, isCursorOnRightBound, isCursorOnBottomBound]
}

export function moveSelectionFrame(appState: EditorState, moveByX: number, moveByY: number) {
	if (appState.selectionFrame) {
		const selectedElements = appState.elements.filter(el => appState.selectedElementsIds.includes(el.id))
		moveElements(selectedElements, moveByX, moveByY)

		const newSelectionFrame = getSelectionFrame(selectedElements)
		appState.selectionFrame.leftX = newSelectionFrame.leftX
		appState.selectionFrame.leftY = newSelectionFrame.leftY
		appState.selectionFrame.rightX = newSelectionFrame.rightX
		appState.selectionFrame.rightY = newSelectionFrame.rightY
	}
}

export function resizeSelectionFrame(appState: EditorState, cursorX: number, cursorY: number) {
	if (!appState.resizeDirection) return
	if (!appState.selectionFrame) return

	changeResizeDirectionOnBoundIntersect(appState, cursorX, cursorY)

	const selectionFrame = appState.selectionFrame
	const { right, left, top, bottom } = appState.resizeDirection

	const selectedElements = appState.elements.filter(el => appState.selectedElementsIds.includes(el.id))
	const inFrameManyElements = selectedElements.length > 1
	const inFrameOneElement = selectedElements.length === 1

	let newLeftX = selectionFrame.leftX
	let newLeftY = selectionFrame.leftY
	let newRightX = selectionFrame.rightX
	let newRightY = selectionFrame.rightY

	// const oldWidth = newRightX - newLeftX;
	// const oldHeight = newRightY - newLeftY;

	const diffX = left ? selectionFrame.rightX - cursorX : cursorX - selectionFrame.leftX
	const diffY = top ? selectionFrame.rightY - cursorY : cursorY - selectionFrame.leftY

	if (right) newRightX = selectionFrame.leftX + normalizePoint(diffX)
	if (left) newLeftX = selectionFrame.rightX - normalizePoint(diffX)
	if (top) newLeftY = selectionFrame.rightY - normalizePoint(diffY)
	if (bottom) newRightY = selectionFrame.leftY + normalizePoint(diffY)

	const newWidth = newRightX - newLeftX
	const newHeight = newRightY - newLeftY

	if (inFrameOneElement) {
		selectedElements[0].moveTo(newLeftX, newLeftY)
		selectedElements[0].resize(newWidth, newHeight)
	}
	// TODO
	if (inFrameManyElements) {
		selectedElements.forEach(el => el.resize(newWidth, newHeight))
	}

	const newSelectionFrame = getSelectionFrame(selectedElements)

	appState.selectionFrame.leftX = newSelectionFrame.leftX
	appState.selectionFrame.leftY = newSelectionFrame.leftY
	appState.selectionFrame.rightX = newSelectionFrame.rightX
	appState.selectionFrame.rightY = newSelectionFrame.rightY

	// resizeElements(selectedElements, appState.resizeDirection, newWidth - oldWidth, newHeight - oldHeight);
	// console.log(newWidth - oldWidth, newHeight - oldHeight, selectedElements[0].width, selectedElements[0].height);
}
