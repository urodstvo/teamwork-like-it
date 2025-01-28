import { type Element, ElementType } from '@/elements'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditorStore = defineStore('canvas-app', () => {
	const canvasGridSize = 100
	const staticCanvasRef = ref<HTMLCanvasElement | null>(null)
	const interactiveCanvasRef = ref<HTMLCanvasElement | null>(null)
	const staticCtx = ref<CanvasRenderingContext2D | null>(null)
	const interactiveCtx = ref<CanvasRenderingContext2D | null>(null)
	const canvasOffset = ref<{ offsetX: number, offsetY: number }>({ offsetX: 0, offsetY: 0 })

	// const elements = ref<Element[]>([])
	const elements = [] as Element[]

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
	const selectionFrame = null as { leftX: number, leftY: number, rightX: number, rightY: number } | null
	const selectedElementsIds = [] as string[]
	const selectedElementsFixedState = new Map<string, Element>()

	const startDragPosition = null as { x: number, y: number } | null
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

	return {
		canvasGridSize,
		staticCanvasRef,
		interactiveCanvasRef,
		staticCtx,
		interactiveCtx,
		elements,
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
		selectedElementsIds,
		zoomedTo,
		isResizing,
		resizeDirection,
		selectedElementsFixedState,
	}
})

export type EditorState = Omit<ReturnType<typeof useEditorStore>, keyof ReturnType<typeof defineStore>>

// export type CanvasAppState = ReturnType<typeof useCanvasAppStore>;
