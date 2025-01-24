export * from './interactive.ts'
export * from './static.ts'

export function _clearCanvas(ctx: CanvasRenderingContext2D, zoom: number) {
	ctx.clearRect(0, 0, ctx.canvas.width / zoom, ctx.canvas.height / zoom)
}

export function _transformCanvas(ctx: CanvasRenderingContext2D, zoom: number) {
	ctx.setTransform(zoom, 0, 0, zoom, 0, 0)
	// ctx.scale(zoom, zoom);
}
