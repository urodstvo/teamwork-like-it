<script setup lang="ts">
import { useEditorStore } from '@/store'

const { ids } = defineProps<{ ids: string[] }>()
const store = useEditorStore()
const objs = ids.map((id) => store.objectsMap.get(id)!)
</script>

<template>
  <template v-for="obj in objs">
    <template v-if="'children' in obj">
      <div :key="obj.id" class="pl-2">
        <NestedLayerList :ids="obj.children" />
      </div>
    </template>
    <template v-else>
      <div :key="obj.id" class="px-4 py-1 text-sm">
        {{ obj.name }}
      </div>
    </template>
  </template>
</template>

<style scoped></style>
