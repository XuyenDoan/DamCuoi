<script setup lang="ts">
/**
 * Trang chủ — theme "Hoa Sen" (mặc định). Nội dung/markup CHUYỂN NGUYÊN VẸN
 * từ pages/index.vue khi tách kiến trúc đa theme (spec.md mục 36) — không
 * đổi hành vi/hiệu ứng gì so với trước.
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
    <section class="relative flex min-h-screen items-center justify-center px-6 py-32 text-center">
      <div class="relative flex max-w-2xl flex-col items-center gap-6">
        <p
          v-if="settings?.heroTagline"
          v-reveal="0"
          class="text-hover font-accent text-lg italic tracking-wide text-text-muted"
        >
          {{ settings.heroTagline }}
        </p>

        <h1 v-reveal="100" class="font-heading text-5xl leading-tight text-text sm:text-6xl md:text-7xl">
          <span class="text-hover">{{ settings?.coupleNames.groom }}</span>
          <span class="mx-3 text-primary">&amp;</span>
          <span class="text-hover">{{ settings?.coupleNames.bride }}</span>
        </h1>

        <p
          v-if="settings?.welcomeMessage"
          v-reveal="260"
          class="text-hover max-w-xl text-base leading-relaxed text-text-muted"
        >
          {{ settings.welcomeMessage }}
        </p>

        <NuxtLink to="/album" v-reveal="340" class="btn-primary mt-2">Xem Album Ảnh</NuxtLink>
      </div>

      <button
        v-if="scrollHintOpacity > 0.02"
        type="button"
        class="focus-ring absolute inset-x-0 bottom-8 mx-auto flex flex-col items-center gap-1 rounded-md text-text-muted transition-colors duration-200 hover:text-primary"
        :style="{ opacity: scrollHintOpacity }"
        aria-label="Cuộn xuống xem thêm"
        @click="scrollPastHero"
      >
        <span class="text-xs uppercase tracking-[0.3em]">Cuộn xuống</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="scroll-hint-icon h-5 w-5"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </button>
    </section>

    <section v-if="hasAnyEventInfo" class="mx-auto max-w-2xl px-6 pb-24 text-center">
      <h2 v-reveal class="mb-2 font-heading text-2xl text-text">Giờ Lễ &amp; Địa Điểm</h2>
      <p v-reveal="60" class="mb-8 text-sm text-text-muted">
        Rất mong được đón tiếp bạn trong ngày trọng đại của chúng tôi.
      </p>
      <div class="flex flex-col gap-4 sm:flex-row">
        <div
          v-if="hasEventContent(settings?.eventInfo.groom)"
          v-reveal="100"
          class="flex-1 rounded-xl border border-secondary-light/40 bg-surface p-5 text-left"
        >
          <p class="font-accent text-base italic text-primary">Nhà Trai</p>
          <p class="text-hover mt-2 text-sm text-text">
            {{ settings?.eventInfo.groom.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.groom.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.groom.venueName" class="text-hover text-sm text-text-muted">
            {{ settings.eventInfo.groom.venueName }}
          </p>
        </div>
        <div
          v-if="hasEventContent(settings?.eventInfo.bride)"
          v-reveal="160"
          class="flex-1 rounded-xl border border-secondary-light/40 bg-surface p-5 text-left"
        >
          <p class="font-accent text-base italic text-primary">Nhà Gái</p>
          <p class="text-hover mt-2 text-sm text-text">
            {{ settings?.eventInfo.bride.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.bride.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.bride.venueName" class="text-hover text-sm text-text-muted">
            {{ settings.eventInfo.bride.venueName }}
          </p>
        </div>
      </div>
      <NuxtLink
        to="/thong-tin"
        v-reveal="220"
        class="focus-ring mt-6 inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 transition-colors duration-200 hover:text-primary/80 hover:underline"
      >
        Xem đầy đủ thông tin lễ cưới
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </NuxtLink>
    </section>

    <LoveStorySection />
  </div>
</template>
