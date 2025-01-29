import type { EditorState } from '@/store'

export function renderSelectionFrame(
  ctx: CanvasRenderingContext2D,
  selectionFrame: Exclude<EditorState['selectionFrame'], null>,
  canvasOffset: EditorState['canvasOffset'],
) {
  ctx.save()
  ctx.strokeStyle = '#00acfd'
  ctx.fillStyle = '#00acfd'

  const xWithOffset = selectionFrame.leftX + canvasOffset.x
  const yWithOffset = selectionFrame.leftY + canvasOffset.y
  const width = selectionFrame.rightX - selectionFrame.leftX
  const height = selectionFrame.rightY - selectionFrame.leftY

  ctx.strokeRect(xWithOffset - 3, yWithOffset - 3, width + 6, height + 6)
  ctx.fillRect(xWithOffset - 6, yWithOffset - 6, 6, 6)
  ctx.fillRect(xWithOffset + width, yWithOffset - 6, 6, 6)
  ctx.fillRect(xWithOffset + width, yWithOffset + height, 6, 6)
  ctx.fillRect(xWithOffset - 6, yWithOffset + height, 6, 6)

  ctx.restore()
}

export function renderSelectionArea(
  ctx: CanvasRenderingContext2D,
  selectionArea: Exclude<EditorState['selectionArea'], null>,
  zoom: EditorState['zoom'],
) {
  ctx.save()

  ctx.strokeStyle = 'rgb(128, 128, 255)'
  ctx.fillStyle = 'rgba(0, 0, 255, 0.1)'

  ctx.lineWidth = 1.0 / zoom

  const width = selectionArea.rightX - selectionArea.leftX
  const height = selectionArea.rightY - selectionArea.leftY

  ctx.strokeRect(selectionArea.leftX, selectionArea.leftY, width, height)
  ctx.fillRect(selectionArea.leftX, selectionArea.leftY, width, height)

  ctx.restore()
}
