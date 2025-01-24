<script setup lang="ts">
import { renderInteractiveScene } from '@/renderer'
import { handleContextMenu, handlePointerDown, handlePointerMove, handlePointerUp, handleWheel } from '@/scene/events'
import { useEditorStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

const store = useEditorStore()
const storeRefs = storeToRefs(store)

const interactiveCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
	if (!interactiveCanvas.value) return

	interactiveCanvas.value.width = window.innerWidth
	interactiveCanvas.value.height = window.innerHeight

	storeRefs.interactiveCtx.value = interactiveCanvas.value.getContext('2d')!
	storeRefs.interactiveCanvasRef.value = interactiveCanvas.value

	renderInteractiveScene(store, true)

	window.addEventListener('resize', () => {
		interactiveCanvas.value!.width = window.innerWidth
		interactiveCanvas.value!.height = window.innerHeight
	})
})
</script>

<template>
  <canvas
    id="interactiveCanvas"
    ref="interactiveCanvas"
    width="1000"
    height="600"
    @pointerdown="(e) => handlePointerDown(e, store)"
    @pointermove="(e) => handlePointerMove(e, store)"
    @pointerup="(e) => handlePointerUp(e, store)"
    @wheel="(e) => handleWheel(e, store)"
    @contextmenu="handleContextMenu"
  />
</template>

<style scoped>
#interactiveCanvas {
    background: transparent none;
    /* border: 1px solid black; */
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
}
</style>
