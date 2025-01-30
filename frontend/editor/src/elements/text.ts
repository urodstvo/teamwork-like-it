import { generateId } from '@/lib/utils.ts'

export class TextElement {
  id: string
  name: string = 'Text'
  content: string = ''

  // stylistic parameters
  fontWeight: number = 400
  fontSize: number = 12
  color: string = 'rgb(255,255,255)'
  fontFamily: string = 'Arial'

  constructor(content?: string) {
    this.id = generateId()
    if (content) this.content = content
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save()

    ctx.font = `${this.fontSize}px ${this.fontFamily}`
    ctx.fillStyle = this.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.textRendering = 'geometricPrecision'
    ctx.fillText(this.content, x, y)

    ctx.restore()
  }
}
