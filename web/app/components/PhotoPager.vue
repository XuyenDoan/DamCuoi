<script setup lang="ts">
const props = defineProps<{ page: number; totalPages: number }>()
const emit = defineEmits<{ 'update:page': [page: number] }>()

function go(target: number) {
  if (target < 1 || target > props.totalPages || target === props.page) return
  emit('update:page', target)
}
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="mt-10 flex items-center justify-center gap-3 sm:mt-14"
    aria-label="Phân trang album ảnh"
  >
    <button
      type="button"
      class="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-secondary-light text-text transition-colors duration-200 hover:bg-surface disabled:pointer-events-none disabled:opacity-30"
      :disabled="page <= 1"
      aria-label="Trang trước"
      @click="go(page - 1)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4">
        <path d="M15 6l-6 6 6 6" />
      </svg>
    </button>

    <span class="min-w-24 text-center text-sm text-text-muted">Trang {{ page }} / {{ totalPages }}</span>

    <button
      type="button"
      class="focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-secondary-light text-text transition-colors duration-200 hover:bg-surface disabled:pointer-events-none disabled:opacity-30"
      :disabled="page >= totalPages"
      aria-label="Trang sau"
      @click="go(page + 1)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  </nav>
</template>
