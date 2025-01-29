import type { Group } from '@/scene/group.ts'
import { type Element, ElementType } from '@/elements'
import { defineStore } from 'pinia'

export const useEditorStore = defineStore('canvas-app', () => {
  const canvasGridSize = 100
  const staticCanvasRef = null as HTMLCanvasElement | null
  const interactiveCanvasRef = null as HTMLCanvasElement | null
  const staticCtx = null as CanvasRenderingContext2D | null
  const interactiveCtx = null as CanvasRenderingContext2D | null
  const canvasOffset = { x: 0, y: 0 }

  // const elements = ref<Element[]>([])
  // const elements = [] as Element[]

  const isDragging = false
  const isSelecting = false
  const isReplacing = false
  const isResizing = false

  const selectionArea = null as {
    leftX: number
    leftY: number
    rightX: number
    rightY: number
  } | null
  const selectionFrame = null as { leftX: number; leftY: number; rightX: number; rightY: number } | null
  const selectedIds = [] as string[]
  const selectedElementsFixedState = new Map<string, Element>()

  const startDragPosition = null as { x: number; y: number } | null
  const replaceFrameOffset = { x: 0, y: 0 }

  const zoom = 1.0
  const zoomedTo = { x: 0, y: 0 }

  const newElement = null as Element | null
  const lastElementType = ElementType.ELLIPSE
  const cursorPosition = { x: 0, y: 0 }

  const resizeDirection = {
    left: false,
    right: false,
    top: false,
    bottom: false,
  }

  const layers = [] as Group[]
  const objectsMap = new Map<string, Element | Group>()

  return {
    canvasGridSize,
    staticCanvasRef,
    interactiveCanvasRef,
    staticCtx,
    interactiveCtx,
    // elements,
    canvasOffset,
    selectionArea,
    isSelecting,
    isDragging,
    startDragPosition,
    zoom,
    newElement,
    lastElementType,
    cursorPosition,
    selectionFrame,
    isReplacing,
    replaceFrameOffset,
    selectedIds,
    zoomedTo,
    isResizing,
    resizeDirection,
    selectedElementsFixedState,
    layers,
    objectsMap,
  }
})

export type EditorState = Omit<ReturnType<typeof useEditorStore>, keyof ReturnType<typeof defineStore>>

// export type CanvasAppState = ReturnType<typeof useCanvasAppStore>;
