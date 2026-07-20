<script setup lang="ts">
import type { Wish } from '../../server/utils/types'

const props = defineProps<{ wish: Wish | null }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <AppModal
    :open="wish !== null"
    :aria-label="wish ? `Lời chúc từ ${wish.name}` : 'Lời chúc'"
    @close="emit('close')"
  >
    <template #header>
      <p class="font-heading text-lg text-text">{{ wish?.name }}</p>
      <p class="text-xs text-text-muted">{{ wish ? formatShortDate(wish.createdAt) : '' }}</p>
    </template>

    <img
      v-if="wish?.photo"
      :src="`/uploads/${wish.photo}`"
      alt="Ảnh đính kèm lời chúc"
      class="mb-4 max-h-72 w-full rounded-lg object-cover"
    />

    <p class="whitespace-pre-line break-words text-text-muted">{{ wish?.message }}</p>
  </AppModal>
</template>
