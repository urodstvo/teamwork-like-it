import { ElementType } from './base'
import { EllipseElement } from './ellipse'
import { RectangleElement } from './rectangle'

export { ElementType }
export type Element = RectangleElement | EllipseElement

export function moveElements(elements: Element[], moveByX: number, moveByY: number) {
	elements.forEach(element => element.moveBy(moveByX, moveByY))

	return elements
}

export function newElement(type: ElementType, x: number, y: number, color?: string) {
	switch (type) {
		case ElementType.RECTANGLE:
			return new RectangleElement({ x, y, type, fillColor: color, strokeColor: color })
		case ElementType.ELLIPSE:
			return new EllipseElement({ x, y, type, fillColor: color, strokeColor: color })
		default:
			throw new Error('Unrecognized element')
	}
}

export function isCursorInSomeElement(elements: Element[], cursorX: number, cursorY: number) {
	return elements.some(el => el.isPointInside(cursorX, cursorY))
}
export function getElementWithCursorInside(elements: Element[], cursorX: number, cursorY: number) {
	return elements.find(el => el.isPointInside(cursorX, cursorY))
}
