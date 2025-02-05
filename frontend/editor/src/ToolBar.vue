<script setup lang="ts">
import { ElementType, newElement } from '@/elements'
import { Line } from '@/links'
import { NewElement, NewLine } from '@/scene'
import { useEditorStore } from '@/store'
import { Circle, MoveUpRight, Square } from 'lucide-vue-next'

const store = useEditorStore()
// const refs = storeToRefs(canvasStore)

// const newElementClick = () => {
//   if (canvasStore.newElement) {
//     refs.newElement.value = null;
//     document.body.style.cursor = "default";
//   } else {
//     refs.newElement.value = refs.lastElementType.value;
//     document.body.style.cursor = "copy";
//   }
// }

function elementButtonClick(type: ElementType) {
  if (store.newElement) {
    store.newElement = null
    document.body.style.cursor = 'default'
  } else {
    store.newElement = new NewElement(newElement(type, -1000e10, -1000e10))
    document.body.style.cursor = 'crosshair'
  }
}

function lineButtonClick() {
  if (store.isDrawingLine) {
    store.newLine = null
    document.body.style.cursor = 'default'
  } else {
    store.newLine = new NewLine(
      new Line(
        {
          type: 'point',
          x: -1000e10,
          y: -1000e10,
        },
        {
          type: 'point',
          x: -1000e10,
          y: -1000e10,
        },
      ),
    )
    document.body.style.cursor = 'crosshair'
  }
}
</script>

<template>
  <section class="toolbar">
    <div
      class="toolbar__content"
      :class="{ hidden: store.selectionFrame.isReplacing || store.selectionFrame.isResizing || store.isDragging }"
    >
      <div class="zoom">zoom: {{ store.zoom * 100 }}%</div>
      <div class="divider" />
      <div class="actions">
        <button
          :class="{ active: store.newElement?.element.type === ElementType.RECTANGLE }"
          :aria-pressed="store.newElement?.element.type === ElementType.RECTANGLE"
          @click="() => elementButtonClick(ElementType.RECTANGLE)"
        >
          <Square class="icon" />
        </button>
        <button
          :class="{ active: store.newElement?.element.type === ElementType.ELLIPSE }"
          :aria-pressed="store.newElement?.element.type === ElementType.ELLIPSE"
          @click="() => elementButtonClick(ElementType.ELLIPSE)"
        >
          <Circle class="icon" />
        </button>
        <button :class="{ active: store.isDrawingLine }" :aria-pressed="store.isDrawingLine" @click="lineButtonClick">
          <MoveUpRight class="icon" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.divider {
  width: 1px;
  height: 16px;
  background: #ddd;
}

.toolbar {
  pointer-events: none;
  width: 100vw;
  position: fixed;
  bottom: 24px;
  left: 0;
  z-index: 100;

  display: flex;
  align-items: center;
  justify-content: center;

  & > .toolbar__content {
    pointer-events: all;
    border: 1px solid #eee;
    width: 300px;
    display: flex;
    align-items: center;
    gap: 12px;

    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(12px) contrast(90%);
    border-radius: 32px;
    padding: 8px 16px;

    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    transition: opacity 0.2s ease;

    &.hidden {
      opacity: 0;
      pointer-events: none;
    }

    & > .zoom {
      white-space: nowrap;
      width: 80px;
    }

    & > .actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  & button {
    border: 1px solid transparent;
    margin: 0;
    padding: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 4px;
    background: transparent;

    transition: background 0.2s ease;

    &.active {
      background: #dddddd;
    }

    & > .icon {
      width: 16px;
      height: 16px;
      stroke-width: 1px;
      fill: currentColor;
    }

    &:hover {
      background: #e6e6e6;
      border: 1px solid #ddd;
    }
  }
}
</style>
