<script setup lang="ts">
import type { Wish } from '../../server/utils/types'

const props = defineProps<{ wish: Wish | null }>()
const emit = defineEmits<{ close: [] }>()

const dialogRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)

const isOpen = computed(() => props.wish !== null)
useFocusTrap(isOpen, dialogRef, closeButtonRef, {
  onEscape: () => emit('close')
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="wish"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        :aria-label="`Lời chúc từ ${wish.name}`"
        class="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border border-secondary-light/40 bg-bg p-6 shadow-lg"
      >
        <div class="mb-3 flex items-start justify-between gap-4">
          <div>
            <p class="font-heading text-lg text-text">{{ wish.name }}</p>
            <p class="text-xs text-text-muted">{{ formatShortDate(wish.createdAt) }}</p>
          </div>
          <button
            ref="closeButtonRef"
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text"
            aria-label="Đóng"
            @click="emit('close')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <img
          v-if="wish.photo"
          :src="`/uploads/${wish.photo}`"
          alt="Ảnh đính kèm lời chúc"
          class="mb-4 max-h-72 w-full rounded-lg object-cover"
        />

        <p class="whitespace-pre-line text-text-muted">{{ wish.message }}</p>
      </div>
    </div>
  </Teleport>
</template>
