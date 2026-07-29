<script setup lang="ts">
/**
 * Banner carousel đầu trang chủ (spec.md mục 40 — nâng cấp từ 1 ảnh cố định
 * lên NHIỀU ảnh tự chuyển). Dùng CHUNG 1 component cho cả 7 theme, chỉ đổi
 * hình dạng/hiệu ứng qua CSS hook `.hero-portrait-wrap` — đúng kiến trúc
 * token-driven đã lập từ mục 36.3. Không hiển thị gì nếu admin chưa tải ảnh
 * nào (không có placeholder ở trang công khai).
 *
 * Đúng 1 ảnh: giữ NGUYÊN hành vi tĩnh như trước (không nút bấm/chấm/hiệu
 * ứng zoom) — tránh thêm UI thừa khi không có gì để "chuyển qua".
 * Từ 2 ảnh trở lên: tự động chuyển sau mỗi 6s (tham khảo nhịp độ phổ biến ở
 * các trang cưới/sự kiện AAA — đủ chậm để đọc trọn khoảnh khắc, đủ nhanh để
 * không gây sốt ruột), crossfade + Ken Burns (phóng nhẹ 1 → 1.06 trong suốt
 * thời gian hiện) thay vì trượt ngang — khớp motion guide đã chốt từ đầu dự
 * án (spec.md mục 8: "Fade + scale nhẹ", tham khảo pic-time.com). Có 2 nút
 * tròn bấm tay + chấm tròn báo vị trí (tái dùng đúng icon mũi tên đã dùng ở
 * `PhotoLightbox.vue` cho nhất quán).
 *
 * Tôn trọng `prefers-reduced-motion`: KHÔNG chỉ dựa vào rule
 * `transition-duration: 0.01ms !important` chung của site (chỉ làm hiệu ứng
 * "tức thời" chứ không tắt hẳn) — tự chủ động KHÔNG chạy hẹn giờ tự động
 * chuyển ảnh (giữ nguyên ảnh đầu, vẫn bấm tay được) — đúng tinh thần WCAG
 * 2.2.2 (nội dung tự chuyển động không được ép người dùng nhạy cảm phải xem).
 * Dừng hẹn giờ khi tab ẩn (`visibilitychange`) hoặc khi rê chuột vào/focus
 * vào carousel — tự chạy lại sau 1 khoảng nghỉ nếu người dùng bấm tay.
 */
const { data: settings } = useSiteSettings()
const images = computed(() => settings.value?.heroImages ?? [])
const isCarousel = computed(() => images.value.length > 1)

const AUTOPLAY_MS = 6000
const RESUME_DELAY_MS = 8000

const activeIndex = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | undefined
let resumeTimer: ReturnType<typeof setTimeout> | undefined
let prefersReducedMotion = false

function clampIndex(i: number): number {
  const n = images.value.length
  return n === 0 ? 0 : ((i % n) + n) % n
}
function goTo(i: number) {
  activeIndex.value = clampIndex(i)
}

function stopAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer)
  autoplayTimer = undefined
}
function startAutoplay() {
  stopAutoplay()
  if (prefersReducedMotion || !isCarousel.value) return
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
  autoplayTimer = setInterval(() => goTo(activeIndex.value + 1), AUTOPLAY_MS)
}

function manualNav(i: number) {
  goTo(i)
  stopAutoplay()
  if (resumeTimer) clearTimeout(resumeTimer)
  resumeTimer = setTimeout(startAutoplay, RESUME_DELAY_MS)
}
function goPrev() {
  manualNav(activeIndex.value - 1)
}
function goNext() {
  manualNav(activeIndex.value + 1)
}

function onVisibilityChange() {
  if (document.visibilityState === 'hidden') stopAutoplay()
  else startAutoplay()
}

onMounted(() => {
  prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  startAutoplay()
  document.addEventListener('visibilitychange', onVisibilityChange)
})
onBeforeUnmount(() => {
  stopAutoplay()
  if (resumeTimer) clearTimeout(resumeTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

watch(images, (imgs) => {
  if (activeIndex.value >= imgs.length) activeIndex.value = 0
  startAutoplay()
})
</script>

<template>
  <div
    v-if="images.length > 0"
    v-reveal="0"
    class="hero-portrait-wrap"
    :class="{ 'hero-portrait-wrap--carousel': isCarousel }"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div class="hero-portrait-slides">
      <div
        v-for="(image, i) in images"
        :key="image"
        class="hero-portrait-slide"
        :class="{ 'hero-portrait-slide--active': i === activeIndex }"
      >
        <img :src="`/uploads/${image}`" alt="" class="hero-portrait" />
      </div>
    </div>

    <div class="hero-portrait-names">
      <p v-if="settings?.heroTagline" class="hero-portrait-tagline font-accent">
        {{ settings.heroTagline }}
      </p>
      <p class="hero-portrait-names-text">
        {{ settings?.coupleNames.bride }} <span class="text-primary">&amp;</span> {{ settings?.coupleNames.groom }}
      </p>
    </div>

    <template v-if="isCarousel">
      <button type="button" class="hero-carousel-btn hero-carousel-btn--prev focus-ring-dark" aria-label="Ảnh trước" @click="goPrev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button type="button" class="hero-carousel-btn hero-carousel-btn--next focus-ring-dark" aria-label="Ảnh sau" @click="goNext">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <div class="hero-carousel-dots" role="tablist" aria-label="Chọn ảnh hiển thị">
        <button
          v-for="(image, i) in images"
          :key="`dot-${image}`"
          type="button"
          class="hero-carousel-dot focus-ring-dark"
          :class="{ 'hero-carousel-dot--active': i === activeIndex }"
          role="tab"
          :aria-selected="i === activeIndex"
          :aria-label="`Ảnh ${i + 1}/${images.length}`"
          @click="manualNav(i)"
        />
      </div>
    </template>
  </div>
</template>
