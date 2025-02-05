import type { EditorState } from '@/store'
import { generateId } from '@/lib/utils.ts'

export interface GroupType {
  id: string
  name: string
  children: string[]
}

export class Group {
  id: string
  name: string
  children: string[] = []

  constructor(...children: string[]) {
    this.id = generateId()
    this.name = `Group ${this.id}`

    this.children = children
  }

  getAllChildrenElements(objectsMap: EditorState['objectsMap'], ids: string[] = this.children): string[] {
    const result = [] as string[]
    for (const id in ids) {
      const obj = objectsMap.get(id)
      if (obj) {
        if ('children' in obj && obj.children.length > 0) {
          result.push(...this.getAllChildrenElements(objectsMap, obj.children))
        } else {
          result.push(obj.id)
        }
      }
    }

    return result
  }

  markAsSelected(state: EditorState) {
    state.selectedIds.splice(0, state.selectedIds.length)
    state.selectedIds.push(...this.getAllChildrenElements(state.objectsMap))
  }

  addToSelected(state: EditorState) {
    state.selectedIds.push(...this.getAllChildrenElements(state.objectsMap))
  }
}
