import type { EditorState } from '@/store'

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
    this.id = Date.now().toString(36) + Math.random().toString(36).substring(2)
    this.name = `Group ${this.id}`

    this.children = children
  }

  _getAllChildrenElements(objectsMap: EditorState['objectsMap'], ids: string[]): string[] {
    const result = [] as string[]
    for (const id in ids) {
      const obj = objectsMap.get(id)
      if (obj) {
        if ('children' in obj && obj.children.length > 0) {
          result.push(...this._getAllChildrenElements(objectsMap, obj.children))
        } else {
          result.push(obj.id)
        }
      }
    }

    return result
  }

  markAsSelected(state: EditorState) {
    state.selectedIds.splice(0, state.selectedIds.length)
    state.selectedIds.push(...this._getAllChildrenElements(state.objectsMap, this.children))
  }

  addToSelected(state: EditorState) {
    state.selectedIds.push(...this._getAllChildrenElements(state.objectsMap, this.children))
  }
}
