<script setup lang="ts">
import NestedLayerList from '@/NestedLayerList.vue'
import { useEditorStore } from '@/store'

const store = useEditorStore()
</script>

<template>
  <aside class="fixed top-2 left-2 border rounded bg-white z-[100] w-[200px]">
    <NestedLayerList v-for="layer in store.layers" :key="layer.id" :ids="layer.children" />
  </aside>
</template>

<style scoped></style>
