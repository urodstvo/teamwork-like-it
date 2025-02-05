import type { EditorState } from '@/store'

export function renderSelectionFrame(
  ctx: CanvasRenderingContext2D,
  selectionFrame: EditorState['selectionFrame'],
  canvasOffset: EditorState['canvasOffset'],
) {
  selectionFrame.draw(ctx, canvasOffset)
}

export function renderSelectionArea(
  ctx: CanvasRenderingContext2D,
  selectionArea: EditorState['selectionArea'],
  zoom: EditorState['zoom'],
) {
  selectionArea.draw(ctx, zoom)
}
