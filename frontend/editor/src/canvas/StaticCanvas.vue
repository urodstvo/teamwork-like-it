<script setup lang="ts">
import { renderStaticScene } from '@/renderer'
import { useEditorStore } from '@/store'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

const store = useEditorStore()
const storeRefs = storeToRefs(store)

const staticCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
	if (!staticCanvas.value) return

	staticCanvas.value.width = window.innerWidth
	staticCanvas.value.height = window.innerHeight

	storeRefs.staticCtx.value = staticCanvas.value.getContext('2d')!
	storeRefs.staticCanvasRef.value = staticCanvas.value

	renderStaticScene(store, true)

	window.addEventListener('resize', () => {
		staticCanvas.value!.width = window.innerWidth
		staticCanvas.value!.height = window.innerHeight
	})
})
</script>

<template>
  <canvas
    id="staticCanvas"
    ref="staticCanvas"
    width="1000"
    height="600"
  />
</template>

<style scoped>
#staticCanvas {
    /* border: 1px solid black; */
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
}
</style>
