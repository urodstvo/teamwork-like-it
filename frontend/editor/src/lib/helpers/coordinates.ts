import type { EditorState } from '@/store'

export function getPointerPosition(
	event: PointerEvent | WheelEvent,
	canvas: HTMLCanvasElement,
	zoom: EditorState['zoom'],
) {
	const rect = canvas.getBoundingClientRect()
	const x = (event.clientX - rect.left) / zoom
	const y = (event.clientY - rect.top) / zoom

	return { x, y }
}

export function normalizePoint(n: number) {
	const x = Math.round(Math.abs(n) / 10) * 10
	return n >= 0 ? x : -x
}
