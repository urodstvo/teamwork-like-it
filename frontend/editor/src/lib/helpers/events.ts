import type { Element } from '@/elements'
import type { SelectionArea, SelectionFrame } from '@/scene/selection.ts'
import type { EditorState } from '@/store'
import { getOffsetedPointerPosition } from '@/lib/helpers'

type PointerElement = Element | SelectionFrame | SelectionArea

export function pointer(
  handler: (event: PointerEvent, state: EditorState) => void,
): (event: PointerEvent, state: EditorState) => boolean

export function pointer(
  position: 'out' | 'in',
  handler: (event: PointerEvent, state: EditorState) => void,
): (element: PointerElement) => (event: PointerEvent, state: EditorState) => boolean

export function pointer(
  arg1: 'out' | 'in' | ((event: PointerEvent, state: EditorState) => void),
  arg2?: (event: PointerEvent, state: EditorState) => void,
) {
  if (typeof arg1 === 'function') {
    // Первая перегрузка: простой обработчик
    return (event: PointerEvent, state: EditorState) => {
      arg1(event, state)
      return true
    }
  } else {
    // Вторая перегрузка: обработчик с проверкой позиции
    const position = arg1
    const handler = arg2!

    return (element: PointerElement) => {
      return (event: PointerEvent, state: EditorState) => {
        const { x, y } = getOffsetedPointerPosition(event, state.interactiveCanvasRef!, state.zoom, state.canvasOffset)

        if (position === 'in' && element.isPointInside(x, y)) {
          handler(event, state)
          return true
        } else if (position === 'out' && !element.isPointInside(x, y)) {
          handler(event, state)
          return true
        }

        return false
      }
    }
  }
}
