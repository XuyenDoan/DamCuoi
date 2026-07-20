<script setup lang="ts">
/**
 * Phân trang dùng chung cho MỌI nơi có phân trang trong dự án (Album công
 * khai, danh sách ảnh Admin...) — chuẩn hoá 1 lần theo yêu cầu chủ dự án:
 * - Bấm đổi trang (nút trước/sau HOẶC bấm thẳng số trang) tự cuộn lên đầu
 *   trang, để người xem luôn bắt đầu xem từ đầu mỗi khi sang trang mới.
 * - Khi tổng số trang > `PAGE_NUMBERS_THRESHOLD` (3): hiện các nút SỐ TRANG
 *   cụ thể để bấm thẳng tới trang mong muốn, không chỉ có mỗi nút trước/sau
 *   như bản cũ. Nhiều trang quá (>7) thì rút gọn bằng dấu "…" (giữ trang
 *   đầu, trang cuối, quanh trang hiện tại) — tránh 1 hàng dài cả chục nút
 *   số vỡ layout, đặc biệt trên mobile.
 * - Từ ≤3 trang: giữ kiểu cũ (chỉ "Trang X / Y") — đủ dùng, không cần số
 *   trang chi tiết khi ít lựa chọn.
 */
const props = withDefaults(
  defineProps<{
    page: number
    totalPages: number
    /** Nhãn `aria-label` riêng cho từng nơi dùng (VD "Phân trang album ảnh") */
    ariaLabel?: string
  }>(),
  { ariaLabel: 'Phân trang' }
)
const emit = defineEmits<{ 'update:page': [page: number] }>()

const PAGE_NUMBERS_THRESHOLD = 3

function scrollToTop() {
  if (typeof window === 'undefined') return
  // `behavior: 'smooth'` tự động tôn trọng `prefers-reduced-motion` nhờ quy
  // tắc `scroll-behavior: auto !important` sẵn có trong main.css (đã dùng
  // cùng cách này ở nút "Cuộn xuống" của Hero, index.vue).
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function go(target: number) {
  if (target < 1 || target > props.totalPages || target === props.page) return
  emit('update:page', target)
  scrollToTop()
}

type PageItem = number | 'ellipsis'

const visiblePages = computed<PageItem[]>(() => {
  const total = props.totalPages
  const current = props.page
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const items: PageItem[] = [1]
  if (current > 3) items.push('ellipsis')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) items.push(i)
  if (current < total - 2) items.push('ellipsis')
  items.push(total)
  return items
})
</script>

<template>
  <nav v-if="totalPages > 1" class="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-14" :aria-label="ariaLabel">
    <button
      type="button"
      class="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-secondary-light text-text transition-colors duration-200 hover:bg-surface disabled:pointer-events-none disabled:opacity-30"
      :disabled="page <= 1"
      aria-label="Trang trước"
      @click="go(page - 1)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4">
        <path d="M15 6l-6 6 6 6" />
      </svg>
    </button>

    <span v-if="totalPages <= PAGE_NUMBERS_THRESHOLD" class="min-w-24 text-center text-sm text-text-muted">
      Trang {{ page }} / {{ totalPages }}
    </span>

    <template v-else>
      <template v-for="(item, i) in visiblePages" :key="`${item}-${i}`">
        <span
          v-if="item === 'ellipsis'"
          class="w-5 shrink-0 select-none text-center text-sm text-text-muted"
          aria-hidden="true"
        >
          &hellip;
        </span>
        <button
          v-else
          type="button"
          class="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-all duration-200 active:scale-[0.98]"
          :class="
            item === page
              ? 'border-primary bg-primary text-white'
              : 'border-secondary-light text-text hover:bg-surface'
          "
          :aria-label="`Đến trang ${item}`"
          :aria-current="item === page ? 'page' : undefined"
          @click="go(item)"
        >
          {{ item }}
        </button>
      </template>
    </template>

    <button
      type="button"
      class="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-secondary-light text-text transition-colors duration-200 hover:bg-surface disabled:pointer-events-none disabled:opacity-30"
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
