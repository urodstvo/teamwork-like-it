import { BaseElement } from './base'

export class RectangleElement extends BaseElement {
  override draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    const leftX = this.x + offsetX
    const leftY = this.y + offsetY
    const rightX = this.x + this.width + offsetX
    const rightY = this.y + this.height + offsetY

    let radius = this.borderRadius
    if (this.height === 10 || this.width === 10) radius = radius >= 2 ? 2 : 0
    if (this.height === 0 || this.width === 0) radius = 0

    ctx.save()

    ctx.fillStyle = this.fillColor
    ctx.strokeStyle = this.strokeColor

    ctx.beginPath()
    ctx.moveTo(leftX + radius, leftY) // .
    ctx.lineTo(rightX - radius, leftY) // from left to right
    ctx.quadraticCurveTo(rightX, leftY, rightX, leftY + radius) // corner
    ctx.lineTo(rightX, rightY - radius) // from top to bottom
    ctx.quadraticCurveTo(rightX, rightY, rightX - radius, rightY) // corner
    ctx.lineTo(leftX + radius, rightY) // from right to left
    ctx.quadraticCurveTo(leftX, rightY, leftX, rightY - radius) // corner
    ctx.lineTo(leftX, leftY + radius) // from bottom to top
    ctx.quadraticCurveTo(leftX, leftY, leftX + radius, leftY) // corner
    ctx.closePath()

    ctx.fill()
    ctx.stroke()

    ctx.restore()

    this.text.draw(ctx, leftX + this.width / 2, leftY + this.height / 2)
  }
}
