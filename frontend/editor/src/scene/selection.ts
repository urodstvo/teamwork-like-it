import type { Element } from '@/elements'
import type { EventType } from '@/scene/events'
import type { EditorState } from '@/store'
import {
  getAllElements,
  getOffsetedPointerPosition,
  getPointerPosition,
  normalizePoint,
  pointer,
  setResizeCursor,
} from '@/lib/helpers'

export class SelectionArea {
  leftX: number = 0
  leftY: number = 0
  rightX: number = 0
  rightY: number = 0

  fillColor = 'rgba(0, 0, 255, 0.1)'
  strokeColor = 'rgb(128, 128, 255)'

  isSelecting = false

  events: {
    [T in keyof EventType]?: ((event: EventType[T], state: EditorState) => boolean)[]
  } = {
    pointerdown: [],
    pointermove: [],
    pointerup: [],
  }

  constructor() {
    this.events.pointerdown?.push(
      pointer((event, state) => {
        if (state.newElement) return
        if (state.newLine) return

        const { x, y } = getPointerPosition(event, state.interactiveCanvasRef!, state.zoom)

        if (state.selectionFrame.isPointInside(x - state.canvasOffset.x, y - state.canvasOffset.y)) return

        this.isSelecting = true
        this.leftX = x
        this.leftY = y
        this.rightX = x
        this.rightY = y
      }),
    )
    this.events.pointermove?.push(
      pointer((event, state) => {
        if (!this.isSelecting) return

        const { x, y } = getPointerPosition(event, state.interactiveCanvasRef!, state.zoom)
        this.rightX = x
        this.rightY = y

        const allElements = getAllElements(state.objectsMap)
        const elements = this._filter(allElements, state.canvasOffset)
        state.selectionFrame.setSelected(elements)
      }),
    )
    this.events.pointerup?.push(
      pointer(() => {
        if (!this.isSelecting) return

        this.reset()
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

  draw(ctx: CanvasRenderingContext2D, zoom: EditorState['zoom']) {
    if (!this.isSelecting) return

    ctx.save()

    ctx.strokeStyle = this.strokeColor
    ctx.fillStyle = this.fillColor

    ctx.lineWidth = 1.0 / zoom

    const width = this.rightX - this.leftX
    const height = this.rightY - this.leftY

    ctx.strokeRect(this.leftX, this.leftY, width, height)
    ctx.fillRect(this.leftX, this.leftY, width, height)

    ctx.restore()
  }

  reset() {
    this.isSelecting = false
  }

  _filter(elements: Element[], canvasOffset: EditorState['canvasOffset']) {
    if (!this.isSelecting) return []

    const { leftX, leftY, rightX, rightY } = this._normalize()

    return elements.filter((el) => {
      const a = el.x + canvasOffset.x >= leftX
      const b = el.y + canvasOffset.y >= leftY
      const c = el.x + el.width + canvasOffset.x <= rightX
      const d = el.y + el.height + canvasOffset.y <= rightY

      return a && b && c && d
    })
  }

  _normalize() {
    let { leftX, leftY, rightX, rightY } = this

    if (rightY - leftY < 0) {
      const tmp = leftY
      leftY = rightY
      rightY = tmp
    }
    if (rightX - leftX < 0) {
      const tmp = leftX
      leftX = rightX
      rightX = tmp
    }

    return {
      leftX,
      leftY,
      rightX,
      rightY,
    }
  }

  isPointInside(x: number, y: number) {
    const offset = 0
    return (
      x >= this.leftX - offset && x <= this.rightX + offset && y >= this.leftY - offset && y <= this.rightY + offset
    )
  }
}

export class SelectionFrame {
  leftX: number = 0
  leftY: number = 0
  rightX: number = 0
  rightY: number = 0

  // styles parameters
  fillColor = '#00acfd'
  strokeColor = '#00acfd'

  children: Element[] = []

  events: {
    [T in keyof EventType]?: ((event: EventType[T], state: EditorState) => boolean)[]
  } = {
    pointerdown: [],
    pointermove: [],
    pointerup: [],
  }

  replaceOffsetX: number = 0
  replaceOffsetY: number = 0

  isReplacing = false
  isResizing = false

  selectedElementsFixedState = new Map<string, Element>()

  resizeDirection = {
    left: false,
    right: false,
    top: false,
    bottom: false,
  }

  constructor() {
    this.events.pointerdown?.push(
      pointer('out', () => {
        this.reset()
      })(this),
      pointer('in', (event, state) => {
        if (!this._shouldDraw()) return

        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        const cursorOnBorder = this.isPointOnBorder(x, y)
        if (cursorOnBorder.some(Boolean)) {
          this.isResizing = true
          const [left, top, right, bottom] = cursorOnBorder
          this.resizeDirection.left = left
          this.resizeDirection.right = right
          this.resizeDirection.top = top
          this.resizeDirection.bottom = bottom

          return
        }

        this.isReplacing = true
        this.replaceOffsetX = x - this.leftX
        this.replaceOffsetY = y - this.leftY
      })(this),
    )
    this.events.pointermove?.push(
      pointer((event, state) => {
        if (!this._shouldDraw()) return

        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        if (this.isReplacing) this.replace(x, y)
      }),
      pointer((event, state) => {
        if (!this._shouldDraw()) return

        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        if (this.isResizing) this.resize(x, y)
      }),
      pointer('in', (event, state) => {
        if (!this._shouldDraw()) return

        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)
        const cursorOnBorder = this.isPointOnBorder(x, y)
        if (this.isResizing) setResizeCursor(this.resizeDirection)
        else if (cursorOnBorder.some(Boolean)) document.body.style.cursor = `${this._getDirection(x, y)}-resize`
        else if (this.isReplacing) document.body.style.cursor = 'move'
      })(this),
      pointer('out', (_event, _state) => {
        if (!this._shouldDraw()) return
        if (this.isReplacing || this.isResizing) return
        document.body.style.cursor = 'default'
      })(this),
    )
    this.events.pointerup?.push(
      pointer(() => {
        if (!this._shouldDraw()) return
        if (!this.isReplacing) return

        this.isReplacing = false
        document.body.style.cursor = 'default'
      }),
      pointer(() => {
        if (!this._shouldDraw()) return
        if (!this.isResizing) return

        this.isResizing = false
        this.setSelected(this.children)
        document.body.style.cursor = 'default'
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

  _shouldDraw() {
    return this.children.length > 0
  }

  reset() {
    this.children = []
    this.isReplacing = false
    this.isResizing = false
    this.selectedElementsFixedState.clear()
  }

  draw(ctx: CanvasRenderingContext2D, canvasOffset: EditorState['canvasOffset']) {
    if (!this._shouldDraw()) return

    ctx.save()
    ctx.strokeStyle = this.strokeColor
    ctx.fillStyle = this.fillColor

    const frame = this._getFrameBox()

    const xWithOffset = frame.leftX + canvasOffset.x
    const yWithOffset = frame.leftY + canvasOffset.y
    const width = frame.rightX - frame.leftX
    const height = frame.rightY - frame.leftY

    ctx.strokeRect(xWithOffset - 3, yWithOffset - 3, width + 6, height + 6)
    ctx.fillRect(xWithOffset - 6, yWithOffset - 6, 6, 6)
    ctx.fillRect(xWithOffset + width, yWithOffset - 6, 6, 6)
    ctx.fillRect(xWithOffset + width, yWithOffset + height, 6, 6)
    ctx.fillRect(xWithOffset - 6, yWithOffset + height, 6, 6)

    ctx.restore()
  }

  replace(x: number, y: number) {
    if (!this._shouldDraw()) return

    const selectedElements = this.children

    selectedElements.forEach((el) => {
      const prevState = this.selectedElementsFixedState.get(el.id)
      if (!prevState) {
        this.selectedElementsFixedState.set(el.id, JSON.parse(JSON.stringify(el)))
      }
      const { x: prevX, y: prevY } = prevState || el
      const dx = x - this.leftX - this.replaceOffsetX
      const dy = y - this.leftY - this.replaceOffsetY
      el.moveTo(prevX + dx, prevY + dy)

      this.selectedElementsFixedState.set(el.id, JSON.parse(JSON.stringify(el)))
      return el
    })

    this._recalculateFrameBox()
  }

  resize(x: number, y: number) {
    if (!this._shouldDraw()) return

    this._changeResizeDirectionOnBorderIntersect(x, y)

    const { right, left, top, bottom } = this.resizeDirection
    const selectedElements = this.children

    let newLeftX = this.leftX
    let newLeftY = this.leftY
    let newRightX = this.rightX
    let newRightY = this.rightY

    const oldWidth = newRightX - newLeftX
    const oldHeight = newRightY - newLeftY

    const diffX = normalizePoint(left ? this.rightX - x : x - this.leftX)
    const diffY = normalizePoint(top ? this.rightY - y : y - this.leftY)

    if (right) newRightX = this.leftX + diffX
    if (left) newLeftX = this.rightX - diffX
    if (top) newLeftY = this.rightY - diffY
    if (bottom) newRightY = this.leftY + diffY

    const newWidth = newRightX - newLeftX
    const newHeight = newRightY - newLeftY

    const factorX = newWidth / (oldWidth || 10)
    const factorY = newHeight / (oldHeight || 10)

    selectedElements.forEach((el) => {
      const prevState = this.selectedElementsFixedState.get(el.id)
      if (!prevState) {
        this.selectedElementsFixedState.set(el.id, JSON.parse(JSON.stringify(el)))
      }
      const { x, y, width, height } = prevState || el
      let xInFrame = left ? this.rightX - x - width : x - this.leftX
      let yInFrame = top ? this.rightY - y - height : y - this.leftY

      xInFrame *= factorX
      yInFrame *= factorY

      el.resize(normalizePoint(factorX * width), normalizePoint(factorY * height))

      let newX = newLeftX + xInFrame
      let newY = newLeftY + yInFrame

      if (left) newX = newRightX - xInFrame - el.width
      if (top) newY = newRightY - yInFrame - el.height

      el.moveTo(newX, newY)

      if (el.width < 0) {
        el.x += el.width
        el.width = -el.width
      }

      if (el.height < 0) {
        el.y += el.height
        el.height = -el.height
      }

      return el
    })
  }

  isPointInside(x: number, y: number) {
    const offset = 6
    return (
      x >= this.leftX - offset && x <= this.rightX + offset && y >= this.leftY - offset && y <= this.rightY + offset
    )
  }

  isPointOutOfBorder(x: number, y: number) {
    return x >= this.leftX && x <= this.rightX && y >= this.leftY && y <= this.rightY
  }

  isPointOnBorder(x: number, y: number) {
    const maxGap = 6

    const isCursorOnLeftBound = x >= this.leftX - maxGap && x <= this.leftX
    const isCursorOnTopBound = y >= this.leftY - maxGap && y <= this.leftY
    const isCursorOnRightBound = x >= this.rightX && x <= this.rightX + maxGap
    const isCursorOnBottomBound = y >= this.rightY && y <= this.rightY + maxGap
    return [isCursorOnLeftBound, isCursorOnTopBound, isCursorOnRightBound, isCursorOnBottomBound]
  }

  _recalculateFrameBox() {
    const xs = this.children.flatMap((el) => [el.x, el.x + el.width])
    const ys = this.children.flatMap((el) => [el.y, el.y + el.height])

    this.leftX = Math.min(...xs)
    this.leftY = Math.min(...ys)
    this.rightX = Math.max(...xs)
    this.rightY = Math.max(...ys)
  }

  _getFrameBox() {
    const xs = this.children.flatMap((el) => [el.x, el.x + el.width])
    const ys = this.children.flatMap((el) => [el.y, el.y + el.height])

    return {
      leftX: Math.min(...xs),
      leftY: Math.min(...ys),
      rightX: Math.max(...xs),
      rightY: Math.max(...ys),
    }
  }

  _changeResizeDirectionOnBorderIntersect(x: number, y: number) {
    if (!this._shouldDraw()) return

    const { left, right, top, bottom } = this.resizeDirection
    let swapped = false

    if (x < this.leftX && right) {
      const temp = this.leftX
      this.leftX = this.rightX
      this.rightX = temp
      this.resizeDirection.left = true
      this.resizeDirection.right = false
      swapped = true
    }
    if (x > this.rightX && left) {
      const temp = this.leftX
      this.leftX = this.rightX
      this.rightX = temp
      this.resizeDirection.left = false
      this.resizeDirection.right = true
      swapped = true
    }
    if (y < this.leftY && bottom) {
      const temp = this.leftY
      this.leftY = this.rightY
      this.rightY = temp
      this.resizeDirection.top = true
      swapped = true
      this.resizeDirection.bottom = false
    }
    if (y > this.rightY && top) {
      const temp = this.leftY
      this.leftY = this.rightY
      this.rightY = temp
      this.resizeDirection.top = false
      this.resizeDirection.bottom = true
      swapped = true
    }

    return swapped
  }

  _getDirection(x: number, y: number) {
    const [left, top, right, bottom] = this.isPointOnBorder(x, y)
    let direction: 'n' | 'e' | 'ne' | 'nw' | undefined

    if (top || bottom) direction = 'n'
    if (left || right) direction = 'e'
    if ((left && top) || (right && bottom)) direction = 'nw'
    if ((right && top) || (left && bottom)) direction = 'ne'

    return direction
  }

  setSelected(elements: Element[]) {
    this.reset()

    this.children = elements
    for (const element of elements) {
      this.selectedElementsFixedState.set(element.id, JSON.parse(JSON.stringify(element)))
    }
    this._recalculateFrameBox()
  }
}
