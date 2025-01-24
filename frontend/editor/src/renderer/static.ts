import type { Element } from '@/elements'
import type { EditorState } from '@/store'
import { throttleRAF } from '@/lib/utils.ts'
import { _clearCanvas, _transformCanvas } from '.'
import { renderElements } from './element.ts'

function _renderBackgroundGrid(
	ctx: CanvasRenderingContext2D,
	offsetX: number,
	offsetY: number,
	zoom: number,
	gridSize: number,
) {
	ctx.save()

	ctx.strokeStyle = '#aaa'
	ctx.lineWidth = 0.2 / zoom

	// Горизонтальные линии
	for (let y = offsetY % gridSize; y < ctx.canvas.height / zoom; y += gridSize) {
		ctx.beginPath()
		ctx.moveTo(0, y)
		ctx.lineTo(ctx.canvas.width / zoom, y)
		ctx.stroke()
	}

	// Вертикальные линии
	for (let x = offsetX % gridSize; x < ctx.canvas.width / zoom; x += gridSize) {
		ctx.beginPath()
		ctx.moveTo(x, 0)
		ctx.lineTo(x, ctx.canvas.height / zoom)
		ctx.stroke()
	}

	ctx.restore()
}

function _getVisibleElements(
	ctx: CanvasRenderingContext2D,
	offsetX: number,
	offsetY: number,
	zoom: number,
	elements: Element[],
) {
	return elements.filter(element => element.isVisible(ctx.canvas, offsetX, offsetY, zoom))
}

function _renderStaticScene(appState: EditorState) {
	_clearCanvas(appState.staticCtx!, appState.zoom)
	_transformCanvas(appState.staticCtx!, appState.zoom)

	_renderBackgroundGrid(
		appState.staticCtx!,
		appState.canvasOffset.offsetX,
		appState.canvasOffset.offsetY,
		appState.zoom,
		appState.canvasGridSize,
	)

	const elementsForRender = _getVisibleElements(
		appState.staticCtx!,
		appState.canvasOffset.offsetX,
		appState.canvasOffset.offsetY,
		appState.zoom,
		appState.elements,
	)
	renderElements(appState.staticCtx!, appState.canvasOffset, elementsForRender)
}

/** throttled to animation framerate */
const _renderStaticSceneThrottled = throttleRAF(
	(state: EditorState) => { _renderStaticScene(state) },
	{ trailing: true },
)

export function renderStaticScene(state: EditorState, throttle?: boolean) {
	if (throttle) {
		// renderStaticSceneThrottled(state)
		const animate = () => {
			_renderStaticScene(state)
			requestAnimationFrame(animate)
		}

		requestAnimationFrame(animate)

		return
	}

	_renderStaticScene(state)
}
