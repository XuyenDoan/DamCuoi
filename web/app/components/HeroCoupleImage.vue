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
 *
 * Lỗi thật đã gặp (phản hồi chủ dự án, kèm ảnh chụp): dùng `object-fit:
 * cover` trên khung `.hero-portrait-wrap` tỉ lệ cố định luôn CẮT MẤT một
 * phần ảnh thật (đáy ảnh ngang, hoặc phần thân ảnh dọc) tuỳ bố cục từng tấm
 * — không có 1 quy tắc `object-position` chung nào đúng cho mọi ảnh khách
 * đưa lên. Đổi hẳn sang không crop: mỗi slide có 2 lớp ảnh chồng nhau —
 * `.hero-portrait-backdrop` (ảnh y hệt, phóng to + làm mờ, lấp đầy khung)
 * làm nền, `.hero-portrait` (ảnh THẬT, `object-fit: contain`) nổi trên nhìn
 * đủ trọn vẹn không mất chi tiết nào — đúng nguyên tắc "không cắt/méo ảnh cá
 * nhân" đã chốt từ đầu dự án (spec.md mục 17.4).
 *
 * Lỗi thật đã gặp đợt sau (phản hồi chủ dự án: "hiển thị đúng tỉ lệ ảnh đầu
 * vào luôn"): khung `.hero-portrait-wrap` vẫn cố định 4:3/3:2 nên dù không
 * crop, ảnh vẫn bị viền mờ 2 bên/trên-dưới thường trực thay vì khớp khít
 * khung. Đo kích thước THẬT của ảnh đang hiện (`naturalWidth`/`naturalHeight`
 * lúc tải xong — không đoán qua đuôi file) rồi gán thẳng `aspect-ratio` của
 * khung theo đúng ảnh đó qua inline style — khung sẽ khớp khít ảnh trong
 * PHẦN LỚN trường hợp (đặc biệt ảnh ngang, phổ biến nhất). CSS `max-height`ở
 * dưới vẫn giữ lại làm lưới an toàn cho ảnh dọc quá khổ (nếu không, khung
 * cao theo đúng tỉ lệ ảnh dọc trên màn hình rộng sẽ cao vô lý, gần hết trang)
 * — khi đó khung buộc lệch tỉ lệ thật, 2 lớp ảnh nền mờ/ảnh thật lại phát
 * huy tác dụng che khoảng trống, không còn crop dù không khớp 100% tỉ lệ.
 *
 * Lỗi thật đã gặp đợt sau nữa (phản hồi chủ dự án: trên điện thoại chiều cao
 * khung đổi loạn xạ giữa các ảnh — ảnh ngang cao A, qua ảnh dọc lại nhảy
 * sang cao B, "kỳ quá"). Đã tham khảo cách các carousel/slider chuyên nghiệp
 * làm (Bootstrap Carousel, Swiper.js...): khung slideshow LUÔN cố định 1
 * chiều cao cho mọi slide, từng ảnh co giãn/lấp đầy BÊN TRONG khung đó chứ
 * khung không đổi kích thước theo ảnh — người xem cuộn trang mà nội dung bên
 * dưới cứ nhảy lên xuống theo nhịp tự động chuyển ảnh (6s/lần) là trải
 * nghiệm tệ, đặc biệt trên màn hình nhỏ. Chỉ bật `aspect-ratio` khớp ảnh thật
 * ở MÀN HÌNH TỪ `sm` (≥640px) TRỞ LÊN — đúng nơi yêu cầu "đúng tỉ lệ ảnh đầu
 * vào" ban đầu nhắm tới (desktop/laptop). Điện thoại giữ nguyên khung 4:3 cố
 * định xuyên suốt carousel (như mọi carousel chuẩn), 2 lớp ảnh nền mờ/ảnh
 * thật đã có sẵn đảm nhiệm việc không cắt ảnh dù không khớp 100% tỉ lệ.
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

const naturalRatios = ref<Record<string, number>>({})
function onImageLoad(e: Event, image: string) {
  const img = e.target as HTMLImageElement
  if (img.naturalWidth && img.naturalHeight) {
    naturalRatios.value[image] = img.naturalWidth / img.naturalHeight
  }
}

// Chỉ khớp `aspect-ratio` theo ảnh thật từ `sm` trở lên — xem chú thích lớn
// ở đầu file (bug "chiều cao khung nhảy loạn xạ giữa các slide trên điện
// thoại"). Khớp đúng CSS breakpoint `sm` (640px) đang dùng ở main.css.
const isDesktopViewport = ref(false)
let desktopMql: MediaQueryList | undefined
function onDesktopViewportChange(e: MediaQueryList | MediaQueryListEvent) {
  isDesktopViewport.value = e.matches
}
function onDesktopViewportResize() {
  if (desktopMql) isDesktopViewport.value = desktopMql.matches
}

const activeAspectRatio = computed(() => {
  if (!isDesktopViewport.value) return undefined
  const activeImage = images.value[activeIndex.value]
  const ratio = activeImage ? naturalRatios.value[activeImage] : undefined
  return ratio ? String(ratio) : undefined
})

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

  desktopMql = window.matchMedia('(min-width: 640px)')
  isDesktopViewport.value = desktopMql.matches
  desktopMql.addEventListener('change', onDesktopViewportChange)
  // Bù thêm `resize` (không chỉ dựa vào sự kiện `change` của MediaQueryList)
  // — 1 số trình duyệt/devtools mô phỏng đổi kích thước viewport (xoay máy,
  // thanh công cụ responsive) không luôn bắn đúng sự kiện `change` gắn vào
  // MediaQueryList đã tạo trước đó, dù `matches` đọc lại NGAY LÚC ĐÓ đã
  // đúng — nghe thêm `resize` để tự đồng bộ lại làm lưới an toàn.
  window.addEventListener('resize', onDesktopViewportResize)
})
onBeforeUnmount(() => {
  stopAutoplay()
  if (resumeTimer) clearTimeout(resumeTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  desktopMql?.removeEventListener('change', onDesktopViewportChange)
  window.removeEventListener('resize', onDesktopViewportResize)
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
    :style="activeAspectRatio ? { aspectRatio: activeAspectRatio } : undefined"
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
        <img :src="`/uploads/${image}`" alt="" class="hero-portrait-backdrop" aria-hidden="true" />
        <img :src="`/uploads/${image}`" alt="" class="hero-portrait" @load="onImageLoad($event, image)" />
      </div>
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
