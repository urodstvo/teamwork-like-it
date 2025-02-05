import { BaseElement } from './base'

export class EllipseElement extends BaseElement {
  override draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    const leftX = this.x + offsetX
    const leftY = this.y + offsetY

    const centerX = leftX + this.width / 2
    const centerY = leftY + this.height / 2
    const radiusX = this.width / 2
    const radiusY = this.height / 2

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

    if (this.isHovered) this.drawOutline(ctx, offsetX, offsetY)
  }

  override drawOutline(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    const leftX = this.x + offsetX
    const leftY = this.y + offsetY

    const centerX = leftX + this.width / 2
    const centerY = leftY + this.height / 2
    const radiusX = this.width / 2
    const radiusY = this.height / 2

    ctx.save()

    ctx.strokeStyle = 'rgb(0, 0, 255)'
    ctx.fillStyle = 'rgb(0, 0, 255)'
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.stroke()

    if (this.anchorPointX && this.anchorPointY) {
      ctx.beginPath()
      ctx.arc(
        this.x + this.width / 2 + this.anchorPointX + offsetX,
        this.y + this.height / 2 - this.anchorPointY + offsetY,
        3,
        0,
        Math.PI * 2,
      )
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()
  }

  getAnchorPoint(x: number, y: number) {
    let intersections: { x: number; y: number }[] = []

    let vx = x
    let vy = y
    const w = this.width
    const h = this.height

    const length = Math.sqrt(vx * vx + vy * vy)
    vx /= length
    vy /= length

    const a = w / 2
    const b = h / 2
    const A = (vx * vx) / (a * a) + (vy * vy) / (b * b)
    const C = -1
    const D = -4 * A * C // Дискриминант
    if (D >= 0) {
      const t1 = Math.sqrt(D) / (2 * A)
      const t2 = -t1
      ;[t1, t2].forEach((t) => {
        const x = t * vx
        const y = t * vy
        if ((x * x) / (a * a) + (y * y) / (b * b) <= 1) intersections.push({ x, y })
      })
    }

    intersections = intersections.filter(({ x, y }) => x * vx >= 0 && y * vy >= 0)
    intersections.sort((a, b) => a.x ** 2 + a.y ** 2 - (b.x ** 2 + b.y ** 2))
    return intersections[0]
  }
}
