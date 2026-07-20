<script setup lang="ts">
import { pageKeyFromPath } from '#shared/pages'

/**
 * Nền toàn trang, cố định khi cuộn, nằm phía sau nội dung (mục 15.2 spec.md):
 * - Nếu trang hiện tại có ảnh nền riêng -> hiện ảnh đó, mờ nhẹ, phủ toàn viewport.
 * - Nếu không -> hiện khung cảnh ao sen (LotusScene): ban đầu vài bông (có bông
 *   còn là búp), cuộn xuống thì thêm bông xuất hiện và nở dần.
 * Chỉ dùng trong layout default (trang công khai) — KHÔNG dùng cho layout admin.
 */
const route = useRoute()
const { data: settings } = useSiteSettings()

const pageKey = computed(() => pageKeyFromPath(route.path))
const backgroundImage = computed(() => settings.value?.pageBackgrounds?.[pageKey.value] ?? null)

const bloomProgress = ref(0)
let ticking = false
let prefersReducedMotion = false

function updateBloomProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight
  bloomProgress.value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1
  ticking = false
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(updateBloomProgress)
}

onMounted(() => {
  prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    bloomProgress.value = 1 // hiện hoa nở sẵn, không gây chuyển động cho người nhạy cảm
    return
  }
  updateBloomProgress()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', updateBloomProgress)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updateBloomProgress)
})

// Route đổi trang (SPA nav) -> reset búp về đầu để hiệu ứng nở lặp lại đúng ý mô tả
watch(pageKey, () => {
  if (!prefersReducedMotion) bloomProgress.value = 0
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
    <img
      v-if="backgroundImage"
      :src="`/uploads/${backgroundImage}`"
      alt=""
      class="h-full w-full object-cover opacity-[0.14]"
    />
    <div v-else class="h-full w-full opacity-45">
      <LotusScene :progress="bloomProgress" />
    </div>
  </div>
</template>
