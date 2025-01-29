import type { EditorState } from '@/store'
import { normalizePoint } from '@/lib/helpers'

export enum ElementType {
  BASE = 'base',
  RECTANGLE = 'rectangle',
  ELLIPSE = 'ellipse',
  TRIANGLE = 'triangle',
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

  /**
   * Element constructor for creating an instance.
   */
  constructor(props?: Partial<BaseElementType>) {
    // generating a unique id for a new element
    this.id = Date.now().toString(36) + Math.random().toString(36).substring(2)
    this.name = props?.type ?? ElementType.BASE

    this.x = props?.x ?? 0
    this.y = props?.y ?? 0
    this.width = props?.width ?? 100
    this.height = props?.height ?? 100
    this.type = props?.type ?? ElementType.BASE
    this.borderRadius = props?.borderRadius ?? 0
    this.fillColor = props?.fillColor ?? 'rgba(0,0,0,1)'
    this.strokeColor = props?.strokeColor ?? 'rgba(0,0,0,1)'
  }

  /**
   *   Element method for rendering on the canvas.
   */
  draw(..._args: unknown[]) {
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

  markAsSelected(state: EditorState) {
    state.selectedIds.splice(0, state.selectedIds.length)
    state.selectedIds.push(this.id)
  }

  addToSelected(state: EditorState) {
    state.selectedIds.push(this.id)
  }
}
