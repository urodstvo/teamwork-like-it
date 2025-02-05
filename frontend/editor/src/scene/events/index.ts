import { handleContextMenu } from './context-menu'
import { handlePointerDown } from './pointer-down'
import { handlePointerMove } from './pointer-move'
import { handlePointerUp } from './pointer-up'
import { handleWheel } from './wheel'

export { handleContextMenu, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel }

export interface EventType {
  pointerdown: PointerEvent
  pointermove: PointerEvent
  pointerup: PointerEvent
  wheel: WheelEvent
  contextmenu: MouseEvent
}
