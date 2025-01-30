<script setup lang="ts">
import { cn } from '@/lib/utils.ts'
import { useEditorStore } from '@/store'
import { CornerDownRight } from 'lucide-vue-next'

const { ids } = defineProps<{ ids: string[] }>()
const store = useEditorStore()
const objs = ids.map((id) => store.objectsMap.get(id)!)
</script>

<template>
  <template v-for="obj in objs">
    <template v-if="'children' in obj">
      <div :key="obj.id" class="flex items-end gap-2 border-b">
        <CornerDownRight class="stroke-1 size-5" />
        <NestedLayerList :ids="obj.children" />
      </div>
    </template>
    <template v-else>
      <div
        :key="obj.id"
        :class="
          cn(
            'px-4 py-1 text-sm text-nowrap overflow-ellipsis whitespace-nowrap overflow-hidden [&:not(:last-of-type)]:border-b',
            {
              'bg-sky-400 text-white': store.selectedIds.includes(obj.id),
            },
          )
        "
      >
        {{ obj.name }}
        <div class="flex items-end gap-2">
          <CornerDownRight class="stroke-1 size-5" />
          {{ obj.text.name }}
        </div>
      </div>
    </template>
  </template>
</template>

<style scoped></style>
