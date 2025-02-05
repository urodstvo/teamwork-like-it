import type { Line } from '@/links'
import type { LineEndpoint } from '@/links/line.ts'
import type { EventType } from '@/scene/events'
import type { EditorState } from '@/store'
import { getOffsetedPointerPosition, normalizePoint, pointer } from '@/lib/helpers'

export class NewLine {
  isDrawing = false

  element: Line

  startX: number = -1000e10
  startY: number = -1000e10

  events: {
    [T in keyof EventType]?: ((event: EventType[T], state: EditorState) => boolean)[]
  } = {
    pointerdown: [],
    pointermove: [],
    pointerup: [],
  }

  constructor(element: Line) {
    this.element = element

    this.events.pointerdown?.push(
      pointer((event, state) => {
        if (this.isDrawing) return

        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        this._setSource({ type: 'point', x: normalizePoint(x), y: normalizePoint(y) })
        this.startX = normalizePoint(x)
        this.startY = normalizePoint(y)
      }),
    )
    this.events.pointermove?.push(
      pointer((event, state) => {
        if (!this.isDrawing) return
        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        this.element.dst = { type: 'point', x: normalizePoint(x), y: normalizePoint(y) }
      }),
    )
    this.events.pointerup?.push(
      pointer((event, state) => {
        if (!this.isDrawing) return
        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        if (this.element.dst.type === 'point' && (Math.abs(x - this.startX) < 10 || Math.abs(y - this.startY) < 10))
          this._setDestination(
            {
              type: 'point',
              x: normalizePoint(this.startX + 50),
              y: normalizePoint(this.startY + 50),
            },
            state,
          )
        else this._setDestination({ type: 'point', x: normalizePoint(x), y: normalizePoint(y) }, state)
      }),
    )
  }

  trigger<T extends keyof EventType>(type: T, event: EventType[T], state: EditorState) {
    let isAllTriggered = false
    let isSomeTriggered = false
    let isNotTriggered = true

    const handlers = this.events[type]

    if (!handlers) {
      return {
        isAllTriggered,
        isSomeTriggered,
        isNotTriggered,
      }
    }

    const triggered = handlers.map((handler) => handler(event, state))

    isAllTriggered = triggered.every(Boolean)
    isSomeTriggered = triggered.some(Boolean)
    isNotTriggered = !isSomeTriggered

    return {
      isAllTriggered,
      isSomeTriggered,
      isNotTriggered,
    }
  }

  _setSource(endpoint: LineEndpoint) {
    this.isDrawing = true
    this.element.src = endpoint
  }

  _setDestination(endpoint: LineEndpoint, state: EditorState) {
    this.isDrawing = false
    this.element.dst = endpoint
    state.linksMap.set(this.element.id, this.element)
    state.newLine = null
    document.body.style.cursor = 'default'
  }

  draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    this.element.draw(ctx, offsetX, offsetY)
  }
}
