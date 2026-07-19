import type { Ref } from 'vue'

interface FocusTrapOptions {
  onEscape?: () => void
  onArrowRight?: () => void
  onArrowLeft?: () => void
}

/**
 * Bẫy focus + phím tắt cho dialog/modal toàn màn hình — tách từ
 * `PhotoLightbox.vue` (logic gốc) để dùng chung với `WishModal.vue` và mọi
 * popup khác trong tương lai, tránh lặp code bẫy focus/Escape/khoá cuộn nền.
 *
 * @param active - true khi dialog đang mở (kích hoạt bẫy + khoá cuộn body)
 * @param containerRef - phần tử gốc của dialog (để dò các phần tử focus được)
 * @param initialFocusRef - phần tử nhận focus đầu tiên khi dialog mở (thường là nút đóng)
 */
export function useFocusTrap(
  active: Ref<boolean>,
  containerRef: Ref<HTMLElement | null>,
  initialFocusRef: Ref<HTMLElement | null>,
  options: FocusTrapOptions = {}
) {
  let lastFocusedEl: HTMLElement | null = null

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      options.onEscape?.()
    } else if (e.key === 'ArrowRight') {
      options.onArrowRight?.()
    } else if (e.key === 'ArrowLeft') {
      options.onArrowLeft?.()
    } else if (e.key === 'Tab') {
      const focusable = containerRef.value?.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  watch(active, async (isActive) => {
    if (isActive) {
      lastFocusedEl = document.activeElement as HTMLElement
      await nextTick()
      initialFocusRef.value?.focus()
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
      lastFocusedEl?.focus()
    }
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  })
}
