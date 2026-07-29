<script setup lang="ts">
/**
 * Nút bật/tắt nhạc nền nổi ở góc màn hình (spec.md mục 41) — chỉ hiện khi
 * admin đã chọn nhạc (`settings.backgroundMusic`), ẩn hoàn toàn nếu chưa có
 * (không có placeholder/nút vô nghĩa trên trang công khai).
 *
 * QUAN TRỌNG (chính sách tự phát âm thanh của trình duyệt): mọi trình duyệt
 * hiện đại đều CHẶN tự phát media có tiếng khi trang vừa tải, chỉ cho phép
 * sau khi có 1 thao tác thật của người dùng (click/tap) — nên nút luôn khởi
 * đầu ở trạng thái TẠM DỪNG, không có cách nào "tự phát nhạc nền ngay khi
 * vào trang" hợp lệ. Bấm nút lần đầu vừa là thao tác cho phép trình duyệt
 * phát tiếng, vừa là hành động bật nhạc — không tách 2 bước.
 *
 * Đặt ở `app.vue` (NGOÀI `<NuxtLayout>`, xem app.vue) để phần tử `<audio>`
 * KHÔNG bị huỷ/tạo lại khi chuyển trang trong SPA (nếu đặt trong layout,
 * Vue vẫn coi layout là "còn sống" giữa các trang nên thực ra không bắt
 * buộc phải đặt ở app.vue để giữ trạng thái phát nhạc — nhưng đặt ở app.vue
 * để chắc chắn không phụ thuộc vào việc 7 theme dùng layout khác nhau đều
 * giữ nguyên cùng 1 gốc cây component).
 */
const { data: settings } = useSiteSettings()
const route = useRoute()

const musicSrc = computed(() => settings.value?.backgroundMusic ?? null)
const showPlayer = computed(() => !route.path.startsWith('/admin') && !!musicSrc.value)

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const hasError = ref(false)

async function toggle() {
  const el = audioRef.value
  if (!el) return
  hasError.value = false
  if (isPlaying.value) {
    el.pause()
    isPlaying.value = false
    return
  }
  try {
    await el.play()
    isPlaying.value = true
  } catch {
    hasError.value = true
  }
}

// Đổi bài nhạc khác trong lúc đang phát (admin đổi file) -> tự dừng, tránh
// phát tiếp bài cũ đã không còn tồn tại/không khớp UI nữa.
watch(musicSrc, () => {
  isPlaying.value = false
})
</script>

<template>
  <button
    v-if="showPlayer"
    type="button"
    class="background-music-btn focus-ring"
    :class="{ 'background-music-btn--playing': isPlaying }"
    :aria-label="isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'"
    :aria-pressed="isPlaying"
    @click="toggle"
  >
    <audio ref="audioRef" :src="musicSrc ? `/uploads/${musicSrc}` : undefined" loop preload="none" @ended="isPlaying = false" />

    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
    <span class="background-music-bars" aria-hidden="true">
      <span /><span /><span />
    </span>
  </button>
</template>

<style scoped>
.background-music-btn {
  position: fixed;
  right: 1.1rem;
  bottom: 1.1rem;
  z-index: 40;
  display: flex;
  height: 2.75rem;
  width: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid color-mix(in srgb, var(--color-text) 12%, transparent);
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.background-music-btn:hover {
  transform: scale(1.06);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
}
.background-music-btn:active {
  transform: scale(0.95);
}

/* 3 vạch nhỏ "sóng âm" nhảy lên xuống khi đang phát — chỉ hiện khi playing,
   đứng yên khi tạm dừng (không gợi ý nhầm là đang phát). Đặt góc dưới-phải
   nút, không che icon đàn. */
.background-music-bars {
  position: absolute;
  right: -0.15rem;
  bottom: -0.15rem;
  display: none;
  height: 0.9rem;
  width: 0.9rem;
  align-items: flex-end;
  gap: 1.5px;
  border-radius: 9999px;
  background: var(--color-surface);
  padding: 0.15rem;
}
.background-music-btn--playing .background-music-bars {
  display: flex;
}
.background-music-bars span {
  width: 2px;
  background: var(--color-primary);
  border-radius: 1px;
  animation: background-music-bar 900ms ease-in-out infinite;
}
.background-music-bars span:nth-child(1) {
  height: 40%;
  animation-delay: -600ms;
}
.background-music-bars span:nth-child(2) {
  height: 90%;
  animation-delay: -300ms;
}
.background-music-bars span:nth-child(3) {
  height: 60%;
}
@keyframes background-music-bar {
  0%, 100% {
    transform: scaleY(0.4);
  }
  50% {
    transform: scaleY(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .background-music-bars span {
    animation: none;
    transform: scaleY(0.7);
  }
}
</style>
