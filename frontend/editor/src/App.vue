<script setup lang="ts">
import InteractiveCanvas from '@/canvas/InteractiveCanvas.vue'
import StaticCanvas from '@/canvas/StaticCanvas.vue'
import ToolBar from '@/ToolBar.vue'
</script>

<template>
  <div class="container">
    <StaticCanvas />
    <InteractiveCanvas />
    <ToolBar />
  </div>
</template>

<style scoped lang="css">
.container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: relative;
}
</style>
