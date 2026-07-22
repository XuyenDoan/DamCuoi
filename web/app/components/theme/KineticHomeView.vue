<script setup lang="ts">
import KineticLoveStory from './KineticLoveStory.vue'

/**
 * Trang chủ — theme "Chữ Cuộn Kịch Tính" (spec.md mục 37, Phương án 05).
 * Hero chữ lớn tương phản cao + nút CTA "nam châm" (`v-magnetic`), câu
 * chuyện tình yêu kể bằng chữ cuộn kịch tính (`KineticLoveStory`). Cùng
 * nguồn dữ liệu với các theme khác — chỉ đổi trình bày.
 */
const { data: settings } = useSiteSettings()

const hasAnyEventInfo = computed(
  () => hasEventContent(settings.value?.eventInfo.groom) || hasEventContent(settings.value?.eventInfo.bride)
)

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
    <section class="relative flex min-h-screen flex-col items-center justify-center px-6 py-32 text-center">
      <p v-if="settings?.heroTagline" v-reveal="0" class="text-hover font-body text-sm font-bold uppercase tracking-[0.14em] text-primary">
        {{ settings.heroTagline }}
      </p>

      <h1 v-reveal="100" class="mt-5 font-heading text-6xl font-extrabold uppercase leading-[1.05] text-text sm:text-8xl">
        {{ settings?.coupleNames.groom }}<br />
        <span class="align-middle text-[0.5em] text-primary">&amp;</span>
        {{ settings?.coupleNames.bride }}
      </h1>

      <p v-if="settings?.welcomeMessage" v-reveal="240" class="mt-7 max-w-lg text-base leading-relaxed text-text-muted">
        {{ settings.welcomeMessage }}
      </p>

      <NuxtLink to="/album" v-reveal="320" v-magnetic class="btn-primary mt-8 inline-block">Xem Album Ảnh</NuxtLink>

      <button
        v-if="scrollHintOpacity > 0.02"
        type="button"
        class="focus-ring absolute inset-x-0 bottom-8 mx-auto flex flex-col items-center gap-1 text-text-muted transition-colors duration-200 hover:text-primary"
        :style="{ opacity: scrollHintOpacity }"
        aria-label="Cuộn xuống xem thêm"
        @click="scrollPastHero"
      >
        <span class="text-xs font-bold uppercase tracking-[0.3em]">Cuộn xuống</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="scroll-hint-icon h-5 w-5">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </button>
    </section>

    <section v-if="hasAnyEventInfo" class="border-t-2 border-text px-6 py-24">
      <div class="mx-auto max-w-3xl text-center">
        <h2 v-reveal class="font-heading text-3xl font-extrabold uppercase text-text">Giờ Lễ &amp; Địa Điểm</h2>
        <div class="mt-10 grid gap-10 sm:grid-cols-2">
          <div v-if="hasEventContent(settings?.eventInfo.groom)" v-reveal="80">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-primary">Nhà Trai</p>
            <p class="text-hover mt-3 font-heading text-2xl font-extrabold text-text">
              {{ settings?.eventInfo.groom.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.groom.ceremonyTime) : 'Đang cập nhật' }}
            </p>
            <p v-if="settings?.eventInfo.groom.venueName" class="text-hover mt-1 text-sm text-text-muted">{{ settings.eventInfo.groom.venueName }}</p>
          </div>
          <div v-if="hasEventContent(settings?.eventInfo.bride)" v-reveal="140">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-primary">Nhà Gái</p>
            <p class="text-hover mt-3 font-heading text-2xl font-extrabold text-text">
              {{ settings?.eventInfo.bride.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.bride.ceremonyTime) : 'Đang cập nhật' }}
            </p>
            <p v-if="settings?.eventInfo.bride.venueName" class="text-hover mt-1 text-sm text-text-muted">{{ settings.eventInfo.bride.venueName }}</p>
          </div>
        </div>
        <NuxtLink
          to="/thong-tin"
          v-reveal="200"
          class="focus-ring mt-8 inline-flex items-center gap-1 text-sm font-bold text-primary underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Xem đầy đủ thông tin lễ cưới →
        </NuxtLink>
      </div>
    </section>

    <KineticLoveStory />
  </div>
</template>
