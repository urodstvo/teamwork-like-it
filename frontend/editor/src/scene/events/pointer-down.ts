import type { EditorState } from '@/store'
import { getPointerPosition, getVisibleElements } from '@/lib/helpers'

export function handlePointerDown(event: PointerEvent, state: EditorState) {
  const { x, y } = getPointerPosition(event, state.interactiveCanvasRef!, state.zoom)
  // const cursorX = x - state.canvasOffset.x
  // const cursorY = y - state.canvasOffset.y
  // const visibleElements = getVisibleElements(
  //   state.staticCtx!,
  //   state.canvasOffset.x,
  //   state.canvasOffset.y,
  //   state.zoom,
  //   state.objectsMap,
  // )

  switch (event.button) {
    case 0: {
      // if (state.isDrawingLine) {
      // const element = getElementWithCursorInside(visibleElements, cursorX, cursorY)
      // const offsetX = element ? cursorX - (element.x + element.width / 2) : 0
      // const offsetY = element ? cursorY - (element.y + element.height / 2) : 0
      // if (state.newLine === null) {
      //   state.newLine = new Line(
      //     !element
      //       ? {
      //           type: 'point',
      //           x: cursorX,
      //           y: cursorY,
      //         }
      //       : {
      //           type: 'element',
      //           offsetX,
      //           offsetY,
      //           element,
      //           anchor: 'border',
      //         },
      //     {
      //       type: 'point',
      //       x: cursorX,
      //       y: cursorY,
      //     },
      //   )
      //   return
      // } else {
      //   state.newLine.dst = !element
      //     ? {
      //         type: 'point',
      //         x: cursorX,
      //         y: cursorY,
      //       }
      //     : {
      //         type: 'element',
      //         offsetX,
      //         offsetY,
      //         element,
      //         anchor: 'border',
      //       }
      //
      //   state.linksMap.set(state.newLine.id, state.newLine)
      //   state.newLine = null
      //   state.isDrawingLine = false
      //   document.body.style.cursor = 'default'
      //   return
      // }
      // }

      const elements = getVisibleElements(
        state.interactiveCtx!,
        state.canvasOffset.x,
        state.canvasOffset.y,
        state.zoom,
        state.objectsMap,
      )
      elements.forEach((el) => el.trigger('pointerdown', event, state))
      state.selectionFrame.trigger('pointerdown', event, state)
      state.selectionArea.trigger('pointerdown', event, state)
      state.newElement?.trigger('pointerdown', event, state)
      state.newLine?.trigger('pointerdown', event, state)

      break
    }
    case 2: {
      if (state.newElement) {
        state.newElement = null
        return
      }

      state.isDragging = true
      state.startDragPosition = { x, y }
      document.body.style.cursor = 'grab'
      break
    }
  }
}
