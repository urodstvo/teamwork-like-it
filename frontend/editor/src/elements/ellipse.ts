import { BaseElement } from './base'

export class EllipseElement extends BaseElement {
  override draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    const leftX = this.x + offsetX
    const leftY = this.y + offsetY

    const centerX = leftX + this.width / 2 // Центр по X
    const centerY = leftY + this.height / 2 // Центр по Y
    const radiusX = this.width / 2 // Горизонтальный радиус
    const radiusY = this.height / 2 // Вертикальный радиус

    ctx.save()

    ctx.fillStyle = this.fillColor
    ctx.strokeStyle = this.strokeColor

    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.restore()

    this.text.draw(ctx, centerX, centerY)
  }
}
