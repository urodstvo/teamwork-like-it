import type { Element } from '@/elements'
import type { EventType } from '@/scene/events'
import type { EditorState } from '@/store'
import { getOffsetedPointerPosition, normalizePoint, pointer } from '@/lib/helpers'
import { Group } from '@/scene/group.ts'

export class NewElement {
  isDrawing = false

  element: Element

  startX: number = -1000e10
  startY: number = -1000e10

  events: {
    [T in keyof EventType]?: ((event: EventType[T], state: EditorState) => boolean)[]
  } = {
    pointerdown: [],
    pointermove: [],
    pointerup: [],
  }

  constructor(element: Element) {
    this.element = element
    this.element.restyle('rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.5)')
    this.element.width = 0
    this.element.height = 0

    this.events.pointerdown?.push(
      pointer((event, state) => {
        if (this.isDrawing) return

        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        this.isDrawing = true
        this.element.x = normalizePoint(x)
        this.element.y = normalizePoint(y)
        this.startX = normalizePoint(x)
        this.startY = normalizePoint(y)
      }),
    )
    this.events.pointermove?.push(
      pointer((event, state) => {
        if (!this.isDrawing) return
        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        const width = normalizePoint(x - this.startX)
        const height = normalizePoint(y - this.startY)
        const { x: nX, y: nY, width: w, height: h } = this._normalizeParams(width, height)
        this.element.x = nX
        this.element.y = nY
        this.element.width = w
        this.element.height = h
      }),
    )
    this.events.pointerup?.push(
      pointer((event, state) => {
        if (!this.isDrawing) return
        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        const dx = x - this.startX
        const dy = y - this.startY
        if (Math.abs(dx) < 10 || Math.abs(dy) < 10) {
          this.element.width = 50
          this.element.height = 50
        }
        this.element.restyle('rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)')
        state.objectsMap.set(this.element.id, this.element)
        state.layers.push(new Group(this.element.id))
        state.lastElementType = this.element.type
        state.selectionFrame.setSelected([this.element])
        this.isDrawing = false
        state.newElement = null
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

  _normalizeParams(dx: number, dy: number) {
    let x = this.startX
    let y = this.startY
    let width = dx
    let height = dy

    if (width < 0) {
      x += width
      width = -width
    }
    if (height < 0) {
      y += height
      height = -height
    }

    return { x, y, width, height }
  }

  draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
    this.element.draw(ctx, offsetX, offsetY)
  }
}
