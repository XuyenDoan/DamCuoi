<script setup lang="ts">
import CinematicLoveStory from './CinematicLoveStory.vue'

/**
 * Trang chủ — theme "Điện Ảnh Cuộn" (spec.md mục 36, Phương án 02). Hero
 * full-bleed như 1 cảnh phim mở đầu, Ken Burns rất chậm, chữ neo đáy khung
 * kiểu phụ đề. Cùng nguồn dữ liệu với theme mặc định — chỉ đổi trình bày.
 */
const { data: settings } = useSiteSettings()

const hasAnyEventInfo = computed(
  () => hasEventContent(settings.value?.eventInfo.groom) || hasEventContent(settings.value?.eventInfo.bride)
)

const heroImage = computed(() => settings.value?.pageBackgrounds?.home ?? null)

const scrollHintOpacity = ref(1)
let ticking = false
function updateScrollHintOpacity() {
  const fadeRange = window.innerHeight * 0.6
  scrollHintOpacity.value = Math.max(0, 1 - window.scrollY / fadeRange)
  ticking = false
}
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(updateScrollHintOpacity)
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
function scrollPastHero() {
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}
</script>

<template>
  <div>
    <section class="relative flex min-h-screen items-end overflow-hidden px-6 pb-24 pt-32 sm:px-10">
      <div class="absolute inset-0" aria-hidden="true">
        <img
          v-if="heroImage"
          :src="`/uploads/${heroImage}`"
          alt=""
          class="ken-burns h-full w-full object-cover opacity-70"
        />
        <div v-else class="ken-burns h-full w-full" style="background: radial-gradient(circle at 60% 30%, color-mix(in srgb, var(--color-primary) 22%, var(--color-bg)), var(--color-bg) 72%)" />
        <div class="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />
      </div>

      <div class="relative max-w-2xl">
        <span v-reveal="0" class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Cảnh 01 · Mở đầu</span>

        <h1 v-reveal="100" class="mt-4 font-heading text-5xl leading-[1.05] text-text sm:text-6xl md:text-7xl">
          {{ settings?.coupleNames.groom }} &amp;<br />
          <em>{{ settings?.coupleNames.bride }}</em>
        </h1>

        <p v-if="settings?.heroTagline" v-reveal="180" class="mt-5 max-w-md text-base text-text-muted">
          {{ settings.heroTagline }}
        </p>
        <p v-if="settings?.welcomeMessage" v-reveal="240" class="mt-3 max-w-md text-sm leading-relaxed text-text-muted">
          {{ settings.welcomeMessage }}
        </p>

        <NuxtLink to="/album" v-reveal="320" class="btn-primary mt-8">Xem Album Ảnh</NuxtLink>
      </div>

      <button
        v-if="scrollHintOpacity > 0.02"
        type="button"
        class="focus-ring-dark absolute inset-x-0 bottom-8 mx-auto flex flex-col items-center gap-1 text-text-muted transition-colors duration-200 hover:text-primary"
        :style="{ opacity: scrollHintOpacity }"
        aria-label="Cuộn xuống xem thêm"
        @click="scrollPastHero"
      >
        <span class="text-[10px] uppercase tracking-[0.3em]">Cuộn để tiếp tục</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="scroll-hint-icon h-5 w-5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </button>
    </section>

    <section v-if="hasAnyEventInfo" class="relative px-6 py-24">
      <div class="mx-auto max-w-3xl text-center">
        <span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Cảnh 02 · Trân trọng kính mời</span>
        <h2 v-reveal class="mt-3 font-heading text-3xl text-text">Giờ Lễ &amp; Địa Điểm</h2>

        <div class="mt-12 grid gap-10 sm:grid-cols-2 sm:divide-x sm:divide-text/10">
          <div v-if="hasEventContent(settings?.eventInfo.groom)" v-reveal="80">
            <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Nhà Trai</p>
            <p class="text-hover-dark mt-4 font-heading text-2xl italic text-text">
              {{ settings?.eventInfo.groom.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.groom.ceremonyTime) : 'Đang cập nhật' }}
            </p>
            <p v-if="settings?.eventInfo.groom.venueName" class="text-hover-dark mt-2 text-sm text-text-muted">
              {{ settings.eventInfo.groom.venueName }}
            </p>
          </div>
          <div v-if="hasEventContent(settings?.eventInfo.bride)" v-reveal="140">
            <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Nhà Gái</p>
            <p class="text-hover-dark mt-4 font-heading text-2xl italic text-text">
              {{ settings?.eventInfo.bride.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.bride.ceremonyTime) : 'Đang cập nhật' }}
            </p>
            <p v-if="settings?.eventInfo.bride.venueName" class="text-hover-dark mt-2 text-sm text-text-muted">
              {{ settings.eventInfo.bride.venueName }}
            </p>
          </div>
        </div>

        <NuxtLink
          to="/thong-tin"
          v-reveal="200"
          class="focus-ring-dark mt-10 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Xem đầy đủ thông tin lễ cưới →
        </NuxtLink>
      </div>
    </section>

    <CinematicLoveStory />
  </div>
</template>
