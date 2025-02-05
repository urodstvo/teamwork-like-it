import type { Element } from '@/elements'
import type { Links } from '@/links'
import type { EditorState } from '@/store'

export function renderElements(
  ctx: CanvasRenderingContext2D,
  offset: EditorState['canvasOffset'],
  elements: Element[],
) {
  elements.forEach((element) => element.draw(ctx, offset.x, offset.y))
}

export function renderLinks(ctx: CanvasRenderingContext2D, offset: EditorState['canvasOffset'], links: Links[]) {
  links.forEach((link) => link.draw(ctx, offset.x, offset.y))
}
