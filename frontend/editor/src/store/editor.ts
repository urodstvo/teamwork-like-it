import { type Element, ElementType } from '@/elements'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEditorStore = defineStore('canvas-app', () => {
	const canvasGridSize = ref(100)
	const staticCanvasRef = ref<HTMLCanvasElement | null>(null)
	const interactiveCanvasRef = ref<HTMLCanvasElement | null>(null)
	const staticCtx = ref<CanvasRenderingContext2D | null>(null)
	const interactiveCtx = ref<CanvasRenderingContext2D | null>(null)
	const canvasOffset = ref<{ offsetX: number, offsetY: number }>({ offsetX: 0, offsetY: 0 })

	const elements = ref<Element[]>([])
	const selectedElementsIds = ref<string[]>([])

	const isDragging = ref(false)
	const isSelecting = ref(false)
	const isReplacing = ref(false)
	const isResizing = ref(false)

	const selectionArea = ref<{
		leftX: number
		leftY: number
		rightX: number
		rightY: number
	} | null>(null)
	const selectionFrame = ref<{ leftX: number, leftY: number, rightX: number, rightY: number } | null>(null)

	const startDragPosition = ref<{ x: number, y: number } | null>(null)
	const replaceFrameOffset = ref<{ x: number, y: number }>({ x: 0, y: 0 })

	const zoom = ref(1.0)
	const zoomedTo = ref({ x: 0, y: 0 })

	const newElement = ref<Element | null>(null)
	const lastElementType = ref<ElementType>(ElementType.ELLIPSE)
	const cursorPosition = ref({ x: 0, y: 0 })

	const resizeDirection = ref({
		left: false,
		right: false,
		top: false,
		bottom: false,
	})

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
	}
})

export type EditorState = Omit<ReturnType<typeof useEditorStore>, keyof ReturnType<typeof defineStore>>

// export type CanvasAppState = ReturnType<typeof useCanvasAppStore>;
