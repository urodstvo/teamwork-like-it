import type { Element } from '@/elements'
import { generateId } from '@/lib/utils.ts'

export type AnchorType = 'border'

export type LineEndpoint =
  | {
      type: 'element'
      element: Element
      anchor: AnchorType
      offsetX: number
      offsetY: number
    }
  | {
      type: 'point'
      x: number
      y: number
    }

export class Line {
  id: string

  src: LineEndpoint
  dst: LineEndpoint

  // stylistic parameters
  lineStyle: 'dotted' | 'straight' = 'straight'
  srcPointerType: string | undefined
  dstPointerType: string | undefined

  constructor(src: LineEndpoint, dst: LineEndpoint) {
    this.id = generateId()

    this.src = src
    this.dst = dst
  }

  _getEndpointPosition(endpoint: LineEndpoint) {
    if (endpoint.type === 'element') {
      const x = endpoint.element.x + endpoint.element.width / 2 + endpoint.offsetX
      const y = endpoint.element.y + endpoint.element.height / 2 - endpoint.offsetY
      return { x, y }
    }
    return { x: endpoint.x, y: endpoint.y }
  }

  draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    ctx.save()
    const start = this._getEndpointPosition(this.src)
    const end = this._getEndpointPosition(this.dst)

    ctx.strokeStyle = 'rgb(255,0,0)'
    ctx.beginPath()
    ctx.moveTo(start.x + offsetX, start.y + offsetY)
    ctx.lineTo(end.x + offsetX, end.y + offsetY)
    ctx.stroke()
    ctx.restore()
  }

  isVisible(canvas: HTMLCanvasElement, offsetX: number, offsetY: number, zoom: number): boolean {
    const viewportLeft = -offsetX
    const viewportRight = canvas.width / zoom - offsetX
    const viewportTop = -offsetY
    const viewportBottom = canvas.height / zoom - offsetY

    const { x: srcX, y: srcY } = this._getEndpointPosition(this.src)
    const { x: dstX, y: dstY } = this._getEndpointPosition(this.dst)

    const lineLeft = Math.min(srcX, dstX)
    const lineRight = Math.max(srcX, dstX)
    const lineTop = Math.min(srcY, dstY)
    const lineBottom = Math.max(srcY, dstY)

    return lineRight > viewportLeft && lineLeft < viewportRight && lineBottom > viewportTop && lineTop < viewportBottom
  }
}
