import type { Element } from '@/elements'
import type { EditorState } from '@/store'
import { getSelectionFrame } from '@/scene/selection.ts'

export function select(state: EditorState, ...elements: Element[]) {
  state.selectionFrame = getSelectionFrame(elements)
  state.selectedIds = elements.map((el) => el.id)
}
