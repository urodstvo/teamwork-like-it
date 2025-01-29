import type { Element } from '@/elements'
import type { EditorState } from '@/store'
import { changeResizeDirectionOnBoundIntersect, getSelectedElements, normalizePoint } from '@/lib/helpers'

export function getDirection(
  selectionFrame: Exclude<EditorState['selectionFrame'], null>,
  cursorX: number,
  cursorY: number,
) {
  const [left, top, right, bottom] = isCursorOnSelectionFrameBound(selectionFrame, cursorX, cursorY)
  let direction: 'n' | 'e' | 'ne' | 'nw' | undefined

  if (top || bottom) direction = 'n'
  if (left || right) direction = 'e'
  if ((left && top) || (right && bottom)) direction = 'nw'
  if ((right && top) || (left && bottom)) direction = 'ne'

  return direction
}

export function getSelectedElementsFromSelectionArea(
  elements: Element[],
  selectionArea: EditorState['selectionArea'],
  canvasOffset: EditorState['canvasOffset'],
): Element[] {
  if (!selectionArea) return []

  const { leftX, leftY, rightX, rightY } = normalizeSelectionArea(selectionArea)

  return elements.filter((el) => {
    const a = el.x + canvasOffset.x >= leftX
    const b = el.y + canvasOffset.y >= leftY
    const c = el.x + el.width + canvasOffset.x <= rightX
    const d = el.y + el.height + canvasOffset.y <= rightY

    return a && b && c && d
  })
}

export function getSelectionFrame(elements: Element[]) {
  let leftX = Number.MAX_VALUE
  let leftY = Number.MAX_VALUE
  let rightX = -Number.MAX_VALUE
  let rightY = -Number.MAX_VALUE

  elements.forEach((el) => {
    if (el.x < leftX) leftX = el.x
    if (el.x + el.width > rightX) rightX = el.x + el.width
    if (el.y < leftY) leftY = el.y
    if (el.y + el.height > rightY) rightY = el.y + el.height
  })

  return { leftX, leftY, rightX, rightY }
}

export function normalizeSelectionArea(selectionArea: Exclude<EditorState['selectionArea'], null>) {
  let { leftX, leftY, rightX, rightY } = selectionArea

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

export function isCursorInSelectionFrame(
  selectionFrame: Exclude<EditorState['selectionArea'], null>,
  cursorX: number,
  cursorY: number,
) {
  const offset = 6
  return (
    cursorX >= selectionFrame.leftX - offset &&
    cursorX <= selectionFrame.rightX + offset &&
    cursorY >= selectionFrame.leftY - offset &&
    cursorY <= selectionFrame.rightY + offset
  )
}

export function isCursorOnSelectionFrameBound(
  selectionFrame: Exclude<EditorState['selectionFrame'], null>,
  cursorX: number,
  cursorY: number,
) {
  const maxGap = 6

  const isCursorOnLeftBound = cursorX >= selectionFrame.leftX - maxGap && cursorX <= selectionFrame.leftX
  const isCursorOnTopBound = cursorY >= selectionFrame.leftY - maxGap && cursorY <= selectionFrame.leftY
  const isCursorOnRightBound = cursorX >= selectionFrame.rightX && cursorX <= selectionFrame.rightX + maxGap
  const isCursorOnBottomBound = cursorY >= selectionFrame.rightY && cursorY <= selectionFrame.rightY + maxGap
  return [isCursorOnLeftBound, isCursorOnTopBound, isCursorOnRightBound, isCursorOnBottomBound]
}

export function replaceSelectionFrame(state: EditorState, cursorX: number, cursorY: number) {
  if (!state.selectionFrame) return
  if (!state.replaceFrameOffset) return

  const selectedElements = getSelectedElements(state)
  selectedElements.forEach((el) => {
    const prevState = state.selectedElementsFixedState.get(el.id)
    if (!prevState) {
      state.selectedElementsFixedState.set(el.id, JSON.parse(JSON.stringify(el)))
    }
    const { x, y } = prevState || el
    const dx = cursorX - state.selectionFrame!.leftX - state.replaceFrameOffset.x
    const dy = cursorY - state.selectionFrame!.leftY - state.replaceFrameOffset.y
    el.moveTo(x + dx, y + dy)

    state.selectedElementsFixedState.set(el.id, JSON.parse(JSON.stringify(el)))
    return el
  })

  const newSelectionFrame = getSelectionFrame(selectedElements)
  state.selectionFrame.leftX = newSelectionFrame.leftX
  state.selectionFrame.leftY = newSelectionFrame.leftY
  state.selectionFrame.rightX = newSelectionFrame.rightX
  state.selectionFrame.rightY = newSelectionFrame.rightY
}

export function resizeSelectionFrame(state: EditorState, cursorX: number, cursorY: number) {
  if (!state.resizeDirection) return
  if (!state.selectionFrame) return

  changeResizeDirectionOnBoundIntersect(state, cursorX, cursorY)

  const selectionFrame = state.selectionFrame
  const { right, left, top, bottom } = state.resizeDirection

  const selectedElements = getSelectedElements(state)

  let newLeftX = selectionFrame.leftX
  let newLeftY = selectionFrame.leftY
  let newRightX = selectionFrame.rightX
  let newRightY = selectionFrame.rightY

  const oldWidth = newRightX - newLeftX
  const oldHeight = newRightY - newLeftY

  const diffX = normalizePoint(left ? selectionFrame.rightX - cursorX : cursorX - selectionFrame.leftX)
  const diffY = normalizePoint(top ? selectionFrame.rightY - cursorY : cursorY - selectionFrame.leftY)

  if (right) newRightX = selectionFrame.leftX + diffX
  if (left) newLeftX = selectionFrame.rightX - diffX
  if (top) newLeftY = selectionFrame.rightY - diffY
  if (bottom) newRightY = selectionFrame.leftY + diffY

  const newWidth = newRightX - newLeftX
  const newHeight = newRightY - newLeftY

  const factorX = newWidth / (oldWidth || 10)
  const factorY = newHeight / (oldHeight || 10)

  selectedElements.forEach((el) => {
    const prevState = state.selectedElementsFixedState.get(el.id)
    if (!prevState) {
      state.selectedElementsFixedState.set(el.id, JSON.parse(JSON.stringify(el)))
    }
    const { x, y, width, height } = prevState || el
    let xInFrame = left ? selectionFrame.rightX - x - width : x - selectionFrame.leftX
    let yInFrame = top ? selectionFrame.rightY - y - height : y - selectionFrame.leftY

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
