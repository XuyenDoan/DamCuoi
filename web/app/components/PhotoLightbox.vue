<script setup lang="ts">
import type { LightboxPhoto } from '../../server/utils/types'

const props = withDefaults(
  defineProps<{
    photos: LightboxPhoto[]
    index: number | null
    /** Tắt cho ảnh không thuộc album (VD ảnh mốc "Câu chuyện tình yêu") — không có endpoint tải riêng */
    showDownload?: boolean
  }>(),
  { showDownload: true }
)

const emit = defineEmits<{
  close: []
  next: []
  prev: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)

const currentPhoto = computed<LightboxPhoto | null>(() =>
  props.index !== null ? (props.photos[props.index] ?? null) : null
)

const isOpen = computed(() => props.index !== null)
useFocusTrap(isOpen, dialogRef, closeButtonRef, {
  onEscape: () => emit('close'),
  onArrowRight: () => emit('next'),
  onArrowLeft: () => emit('prev')
})

let touchStartX = 0
function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0]?.clientX ?? 0
}
function onTouchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX
  if (Math.abs(dx) < 50) return
  if (dx < 0) emit('next')
  else emit('prev')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox-fade">
    <div
      v-if="currentPhoto"
      ref="dialogRef"
      class="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      :aria-label="currentPhoto.caption || 'Xem ảnh cưới'"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <div class="flex items-center justify-between px-4 py-3 sm:px-6">
        <p class="text-sm text-white/70">
          {{ (index ?? 0) + 1 }} / {{ photos.length }}
        </p>
        <div class="flex items-center gap-2">
          <a
            v-if="showDownload"
            :href="`/api/photos/${currentPhoto.id}/download`"
            class="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Tải ảnh này về máy"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" />
            </svg>
          </a>
          <button
            ref="closeButtonRef"
            type="button"
            class="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Đóng xem ảnh"
            @click="emit('close')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-6 w-6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div class="relative flex flex-1 items-center justify-center px-2 pb-2 sm:px-6 sm:pb-6">
        <button
          v-if="photos.length > 1"
          type="button"
          class="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:flex"
          aria-label="Ảnh trước"
          @click="emit('prev')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <img
          :src="`/uploads/${currentPhoto.filename}`"
          :alt="currentPhoto.caption || 'Ảnh cưới'"
          :width="currentPhoto.width"
          :height="currentPhoto.height"
          class="max-h-[75vh] max-w-full rounded-md object-contain"
        />

        <button
          v-if="photos.length > 1"
          type="button"
          class="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:flex"
          aria-label="Ảnh tiếp theo"
          @click="emit('next')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <p v-if="currentPhoto.caption" class="px-6 pb-6 text-center text-sm text-white/80">
        {{ currentPhoto.caption }}
      </p>
    </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.22s ease;
}
.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .lightbox-fade-enter-active,
  .lightbox-fade-leave-active {
    transition: none;
  }
}
</style>
