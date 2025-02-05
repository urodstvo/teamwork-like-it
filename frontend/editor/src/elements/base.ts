import type { EventType } from '@/scene/events'
import type { EditorState } from '@/store'
import { TextElement } from '@/elements'
import { getOffsetedPointerPosition, normalizePoint, pointer } from '@/lib/helpers'
import { generateId } from '@/lib/utils.ts'

export enum ElementType {
  BASE = 'base',
  RECTANGLE = 'rectangle',
  ELLIPSE = 'ellipse',
  TRIANGLE = 'triangle',
  LINE = 'line',
}

export interface BaseElementType {
  name: string
  x: number
  y: number
  width: number
  height: number
  borderRadius: number
  fillColor: string
  strokeColor: string
  type: ElementType
  text: TextElement

  visibility: boolean
}

export type BaseElementWithIdType = BaseElementType & {
  id: string
}

/*
    Base abstract class for possible elements (shapes)
 */
export class BaseElement {
  id: string
  name: string

  // base parameters
  x: number
  y: number
  width: number
  height: number
  type: ElementType

  // border parameters
  borderRadius: number

  // styles parameters
  fillColor: string
  strokeColor: string

  visibility: boolean = true
  text: TextElement = new TextElement()

  // util parameters
  isSelected: boolean = false

  events: {
    [T in keyof EventType]?: ((event: EventType[T], state: EditorState) => boolean)[]
  } = {
    pointerdown: [],
    pointermove: [],
    pointerup: [],
  }

  isHovered = false
  anchorPointX: number = 0
  anchorPointY: number = 0

  /**
   * Element constructor for creating an instance.
   */
  constructor(props?: Partial<BaseElementType>) {
    // generating a unique id for a new element
    this.id = generateId()
    this.name = `${props?.type ?? ElementType.BASE} ${this.id}`

    this.x = props?.x ?? 0
    this.y = props?.y ?? 0
    this.width = props?.width ?? 100
    this.height = props?.height ?? 100
    this.type = props?.type ?? ElementType.BASE
    this.borderRadius = props?.borderRadius ?? 0
    this.fillColor = props?.fillColor ?? 'rgba(0,0,0,1)'
    this.strokeColor = props?.strokeColor ?? 'rgba(0,0,0,1)'

    this.events.pointerdown?.push(
      pointer('in', (_e, state) => {
        if (state.newLine) return

        state.selectionFrame.setSelected([this])
        this.isSelected = true
      })(this),
      pointer('in', (event, state) => {
        if (!state.newLine) return

        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        if (!state.newLine.isDrawing) {
          const anchor = this.getAnchorPoint(x - (this.x + this.width / 2), this.y + this.height / 2 - y)
          if (anchor) {
            this.anchorPointY = anchor.y
            this.anchorPointX = anchor.x
          }

          state.newLine._setSource({
            type: 'element',
            element: this,
            anchor: 'border',
            offsetX: this.anchorPointX,
            offsetY: this.anchorPointY,
          })
        }
      })(this),
    )
    this.events.pointermove?.push(
      pointer('in', (event, state) => {
        if (!state.newLine) return
        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        this.isHovered = true

        const anchor = this.getAnchorPoint(x - (this.x + this.width / 2), this.y + this.height / 2 - y)
        if (anchor) {
          this.anchorPointY = anchor.y
          this.anchorPointX = anchor.x
        }
        state.newLine.element.dst = {
          type: 'element',
          element: this,
          anchor: 'border',
          offsetX: this.anchorPointX,
          offsetY: this.anchorPointY,
        }
      })(this),
      pointer('out', (_e, state) => {
        if (!state.newLine) return

        this.isHovered = false
      })(this),
    )
    this.events.pointerup?.push(
      pointer('in', (_event, state) => {
        if (!state.newLine) return

        this.isHovered = false
        if (state.newLine.isDrawing) {
          state.newLine._setDestination(
            {
              type: 'element',
              element: this,
              anchor: 'border',
              offsetX: this.anchorPointX,
              offsetY: this.anchorPointY,
            },
            state,
          )
        }
      })(this),
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

  /**
   *   Element method for rendering on the canvas.
   */
  draw(..._args: unknown[]) {
    throw new Error('Base element cannot be rendered.')
  }

  /**
   *   Element method for rendering border on the canvas.
   */
  drawOutline(..._args: unknown[]) {
    throw new Error('Base element cannot be rendered.')
  }

  /**
   * Element method for resizing.
   */
  resize(width: number, height: number) {
    this.width = width
    this.height = height
  }

  /**
   * Element method for resizing with factor.
   */
  resizeByFactor(factorX: number, factorY?: number) {
    this.width = normalizePoint(this.width * factorX)
    this.height = normalizePoint(factorY ? this.height * factorY : this.height * factorX)
  }

  /**
   * Element method for moving by a certain value.
   */
  moveBy(x: number, y: number) {
    this.x += normalizePoint(x)
    this.y += normalizePoint(y)
  }

  /**
   * Element method to move to a specific point.
   */
  moveTo(x: number, y: number) {
    this.x = normalizePoint(x)
    this.y = normalizePoint(y)
  }

  /**
   * Element method for checking is element in viewport.
   */
  isVisible(canvas: HTMLCanvasElement, offsetX: number, offsetY: number, zoom: number) {
    if (!this.visibility) return false

    const isVisibleFromRight = this.x + offsetX < canvas.width / zoom
    const isVisibleFromLeft = this.x + offsetX + this.width > 0
    const isVisibleFromTop = this.y + offsetY + this.height > 0
    const isVisibleFromBottom = this.y + offsetY < canvas.height / zoom

    return isVisibleFromRight && isVisibleFromLeft && isVisibleFromTop && isVisibleFromBottom
  }

  /**
   * Element method for checking is point(x,y) inside.
   */
  isPointInside(x: number, y: number) {
    return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height
  }

  /**
   * Element method for changing styles parameters.
   */
  restyle(fillColor: string, strokeColor?: string) {
    this.fillColor = fillColor
    if (strokeColor) this.strokeColor = strokeColor
  }

  // markAsSelected(state: EditorState) {
  //   state.selectedIds.splice(0, state.selectedIds.length)
  //   state.selectedIds.push(this.id)
  // }
  //
  // addToSelected(state: EditorState) {
  //   state.selectedIds.push(this.id)
  // }

  getAnchorPoint(_x: number, _y: number): { x: number; y: number } | null {
    throw new Error('Method not implemented.')
  }
}
