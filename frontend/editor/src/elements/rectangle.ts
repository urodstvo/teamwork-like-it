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

    if (this.isHovered) this.drawOutline(ctx, offsetX, offsetY)
  }

  override drawOutline(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    const leftX = this.x + offsetX
    const leftY = this.y + offsetY
    const rightX = this.x + this.width + offsetX
    const rightY = this.y + this.height + offsetY

    let radius = this.borderRadius
    if (this.height === 10 || this.width === 10) radius = radius >= 2 ? 2 : 0
    if (this.height === 0 || this.width === 0) radius = 0

    ctx.save()

    ctx.strokeStyle = 'rgb(0, 0, 255)'
    ctx.fillStyle = 'rgb(0, 0, 255)'
    ctx.lineWidth = 2

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
    if (vx === 0 && vy === 0) return null

    const w = this.width
    const h = this.height
    const radius = this.borderRadius

    const length = Math.sqrt(vx * vx + vy * vy)
    vx /= length
    vy /= length

    const rectIntersections: { x: number; y: number }[] = []

    // 1. Пересечения с вертикальными границами
    if (vx !== 0) {
      const t1 = w / 2 / vx
      const y1 = t1 * vy
      if (y1 >= -h / 2 && y1 <= h / 2) rectIntersections.push({ x: w / 2, y: y1 })

      const t2 = -w / 2 / vx
      const y2 = t2 * vy
      if (y2 >= -h / 2 && y2 <= h / 2) rectIntersections.push({ x: -w / 2, y: y2 })
    }

    // 2. Пересечения с горизонтальными границами
    if (vy !== 0) {
      const t3 = h / 2 / vy
      const x3 = t3 * vx
      if (x3 >= -w / 2 && x3 <= w / 2) rectIntersections.push({ x: x3, y: h / 2 })

      const t4 = -h / 2 / vy
      const x4 = t4 * vx
      if (x4 >= -w / 2 && x4 <= w / 2) rectIntersections.push({ x: x4, y: -h / 2 })
    }

    // Коррекция точек внутри закругленных углов
    const correctedIntersections = rectIntersections.map(({ x, y }) => {
      const inCorner = Math.abs(x) > w / 2 - radius && Math.abs(y) > h / 2 - radius

      if (!inCorner) return { x, y } // Если не в углу — оставляем

      // Определяем центр дуги
      const cx = Math.sign(x) * (w / 2 - radius)
      const cy = Math.sign(y) * (h / 2 - radius)

      // Перемещаем точку на окружность
      const angle = Math.atan2(y - cy, x - cx)
      return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
    })

    intersections.push(...correctedIntersections)

    // 3. Проверяем пересечения с дугами (четвертями окружностей)
    const cornerCenters = [
      { x: w / 2 - radius, y: h / 2 - radius },
      { x: -w / 2 + radius, y: h / 2 - radius },
      { x: -w / 2 + radius, y: -h / 2 + radius },
      { x: w / 2 - radius, y: -h / 2 + radius },
    ]

    for (const { x: cx, y: cy } of cornerCenters) {
      const a = vx * vx + vy * vy
      const b = 2 * (cx * vx + cy * vy)
      const c = cx * cx + cy * cy - radius * radius
      const D = b * b - 4 * a * c

      if (D >= 0) {
        const t1 = (-b + Math.sqrt(D)) / (2 * a)
        const t2 = (-b - Math.sqrt(D)) / (2 * a)

        ;[t1, t2].forEach((t) => {
          const x = t * vx
          const y = t * vy
          if ((x - cx) ** 2 + (y - cy) ** 2 <= radius * radius) intersections.push({ x, y })
        })
      }
    }

    intersections = intersections.filter(({ x, y }) => x * vx >= 0 && y * vy >= 0)
    intersections.sort((a, b) => a.x ** 2 + a.y ** 2 - (b.x ** 2 + b.y ** 2))
    return intersections[0]
  }
}
