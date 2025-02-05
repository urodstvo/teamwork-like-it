import type { Line } from '@/links'
import type { Group, NewElement, NewLine } from '@/scene'
import { type Element, ElementType } from '@/elements'
import { SelectionArea, SelectionFrame } from '@/scene/selection.ts'
import { defineStore } from 'pinia'

export const useEditorStore = defineStore('canvas-app', () => {
  const canvasGridSize = 100
  const staticCanvasRef = null as HTMLCanvasElement | null
  const interactiveCanvasRef = null as HTMLCanvasElement | null
  const staticCtx = null as CanvasRenderingContext2D | null
  const interactiveCtx = null as CanvasRenderingContext2D | null
  const canvasOffset = { x: 0, y: 0 }

  const isDragging = false
  const isDrawingLine = false

  const selectionFrame = new SelectionFrame()
  const selectionArea = new SelectionArea()

  const startDragPosition = null as { x: number; y: number } | null

  const zoom = 1.0
  const zoomedTo = { x: 0, y: 0 }

  const newLine = null as NewLine | null
  const newElement = null as NewElement | null
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
  const linksMap = new Map<string, Line>()

  return {
    canvasGridSize,
    staticCanvasRef,
    interactiveCanvasRef,
    staticCtx,
    interactiveCtx,
    canvasOffset,
    selectionArea,
    isDragging,
    startDragPosition,
    zoom,
    newElement,
    lastElementType,
    cursorPosition,
    selectionFrame,
    zoomedTo,
    resizeDirection,
    layers,
    objectsMap,
    isDrawingLine,
    newLine,
    linksMap,
  }
})

export type EditorState = Omit<ReturnType<typeof useEditorStore>, keyof ReturnType<typeof defineStore>>

// export type CanvasAppState = ReturnType<typeof useCanvasAppStore>;
