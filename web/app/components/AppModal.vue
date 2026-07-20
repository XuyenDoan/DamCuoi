<script setup lang="ts">
/**
 * Component gốc dùng chung cho MỌI popup dạng "thẻ" (card dialog) trong dự
 * án — chuẩn hoá overlay, khung thẻ, animation mở/đóng, focus-trap và cách
 * đóng (nút X / phím Esc / bấm ra ngoài) theo đúng 1 tiêu chuẩn duy nhất.
 *
 * Bối cảnh (rà soát UI): trước đây `WishModal`/`WishSubmitModal` đã có
 * transition fade+scale+slide (0.22s ease) khá chuẩn, nhưng 2 popup admin
 * (`PageBackgroundEditModal`, `LoveStoryEditModal`) HOÀN TOÀN không có
 * animation — mở/đóng tức thì. Nguyên nhân: trang cha gỡ hẳn component khi
 * đóng (`v-if="editingX"` ở nơi gọi) nên dù có thêm `<Transition>` bên trong
 * cũng không kịp chạy lúc đóng (component đã bị unmount trước khi transition
 * kết thúc). Tách logic dùng chung ra component này để chuẩn hoá 1 lần, mọi
 * popup sau này chỉ cần dùng lại, không lặp code.
 *
 * QUAN TRỌNG khi dùng: nơi gọi phải LUÔN render component này (không bọc
 * bằng `v-if`/`v-show` ở template cha), chỉ đổi prop `open` — animation đóng
 * cần DOM còn tồn tại trong lúc Transition chạy.
 *
 * `PhotoLightbox.vue` KHÔNG dùng component này — bản chất khác hẳn (toàn màn
 * hình, nền tối, không phải thẻ card nổi giữa overlay sáng) nên giữ animation
 * fade riêng, nhưng dùng cùng thời lượng/easing để cảm giác nhất quán.
 */
const props = withDefaults(
  defineProps<{
    open: boolean
    ariaLabel: string
    /** md ~ nội dung ngắn/form vừa (mặc định), lg ~ form dài nhiều trường */
    maxWidth?: 'md' | 'lg'
    /** Tắt khi nội dung luôn ngắn/cố định, không cần khung cuộn riêng */
    scrollable?: boolean
    closeOnOverlayClick?: boolean
  }>(),
  { maxWidth: 'md', scrollable: true, closeOnOverlayClick: true }
)

const emit = defineEmits<{ close: [] }>()

const dialogRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)

const isOpen = computed(() => props.open)
useFocusTrap(isOpen, dialogRef, closeButtonRef, { onEscape: () => emit('close') })

const maxWidthClass = computed(() => (props.maxWidth === 'lg' ? 'max-w-lg' : 'max-w-md'))

function onOverlayClick() {
  if (props.closeOnOverlayClick) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="app-modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="onOverlayClick"
      >
        <div
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          :aria-label="ariaLabel"
          class="app-modal-panel w-full rounded-xl border border-secondary-light/40 bg-bg p-6 shadow-lg"
          :class="[maxWidthClass, scrollable ? 'max-h-[85vh] overflow-y-auto' : '']"
        >
          <div class="mb-4 flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <slot name="header" />
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

          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-modal-enter-active,
.app-modal-leave-active {
  transition: opacity 0.22s ease;
}
.app-modal-enter-active .app-modal-panel,
.app-modal-leave-active .app-modal-panel {
  transition: transform 0.22s ease, opacity 0.22s ease;
}
.app-modal-enter-from,
.app-modal-leave-to {
  opacity: 0;
}
.app-modal-enter-from .app-modal-panel,
.app-modal-leave-to .app-modal-panel {
  transform: translateY(12px) scale(0.98);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .app-modal-enter-active,
  .app-modal-leave-active,
  .app-modal-enter-active .app-modal-panel,
  .app-modal-leave-active .app-modal-panel {
    transition: none;
  }
}
</style>
