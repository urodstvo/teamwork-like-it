import type { Element } from '@/elements'
import type { EditorState } from '@/store'

export function renderElements(
	ctx: CanvasRenderingContext2D,
	offset: EditorState['canvasOffset'],
	elements: Element[],
) {
	elements.forEach(element => element.draw(ctx, offset.offsetX, offset.offsetY))
}
