import type { EditorState } from '@/store'
// import { throttleRAF } from '@/lib/utils.ts'
import { getSelectionFrame } from '@/scene/selection.ts'
import { _clearCanvas, _transformCanvas } from '.'
import { renderSelectionArea, renderSelectionFrame } from './selection'

function _renderInteractiveScene(state: EditorState) {
	_clearCanvas(state.interactiveCtx!, state.zoom)
	_transformCanvas(state.interactiveCtx!, state.zoom)

	if (state.newElement) state.newElement.draw(state.interactiveCtx!, 0, 0)

	if (state.isSelecting) renderSelectionArea(state.interactiveCtx!, state.selectionArea!, state.zoom)

	if (state.selectedElementsIds.length > 0) {
		const selectionFrame = getSelectionFrame(state.elements.filter(el => state.selectedElementsIds.includes(el.id)))
		renderSelectionFrame(state.interactiveCtx!, selectionFrame, state.canvasOffset)
	}
}

/** throttled to animation framerate */
// const _renderInteractiveSceneThrottled = throttleRAF(
// 	(state: EditorState) => { _renderInteractiveScene(state) },
// 	{ trailing: true },
// )

export function renderInteractiveScene(state: EditorState, throttle?: boolean) {
	if (throttle) {
		// renderInteractiveSceneThrottled(state)
		const animate = () => {
			_renderInteractiveScene(state)
			requestAnimationFrame(animate)
		}

		requestAnimationFrame(animate)
		return
	}

	_renderInteractiveScene(state)
}
