<script setup lang="ts">
import GlassLoveStory from './GlassLoveStory.vue'

/**
 * Trang chủ — theme "Kính Mờ Ánh Sáng" (spec.md mục 37, Phương án 03).
 * Nền aurora trôi chậm xuyên suốt + nội dung đặt trong khối kính mờ nổi.
 * Cùng nguồn dữ liệu với các theme khác — chỉ đổi trình bày.
 */
const { data: settings } = useSiteSettings()

const hasAnyEventInfo = computed(
  () => hasEventContent(settings.value?.eventInfo.groom) || hasEventContent(settings.value?.eventInfo.bride)
)

const heroRef = ref<HTMLElement | null>(null)
function onHeroMove(e: MouseEvent) {
  const el = heroRef.value
  if (!el) return
  const r = el.getBoundingClientRect()
  el.style.setProperty('--gx', `${e.clientX - r.left}px`)
  el.style.setProperty('--gy', `${e.clientY - r.top}px`)
}
</script>

<template>
  <div>
    <section ref="heroRef" class="aurora-hero relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-32" @mousemove="onHeroMove">
      <div class="aurora-blob b1" aria-hidden="true" />
      <div class="aurora-blob b2" aria-hidden="true" />
      <div class="aurora-blob b3" aria-hidden="true" />
      <div class="aurora-blob b4" aria-hidden="true" />
      <div class="cursor-glow" aria-hidden="true" />

      <div class="glass-hero-card relative z-10 flex w-full max-w-lg flex-col items-center gap-5 rounded-[32px] px-8 py-12 text-center sm:px-12">
        <p v-if="settings?.heroTagline" v-reveal="0" class="text-hover font-accent text-lg italic text-text-muted">
          {{ settings.heroTagline }}
        </p>

        <h1 v-reveal="100" class="font-heading text-5xl leading-tight text-text sm:text-6xl">
          {{ settings?.coupleNames.groom }} <em class="text-[var(--color-primary-vivid)] not-italic">&amp;</em><br />
          {{ settings?.coupleNames.bride }}
        </h1>

        <p v-if="settings?.welcomeMessage" v-reveal="220" class="max-w-sm text-[15px] leading-relaxed text-text-muted">
          {{ settings.welcomeMessage }}
        </p>

        <NuxtLink to="/album" v-reveal="320" class="btn-primary mt-2">Xem Album Ảnh</NuxtLink>
      </div>
    </section>

    <section v-if="hasAnyEventInfo" class="relative px-6 pb-28">
      <div class="mx-auto max-w-3xl text-center">
        <span class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary-vivid)]">Trân trọng kính mời</span>
        <h2 v-reveal class="mt-2 font-heading text-3xl text-text">Giờ Lễ &amp; Địa Điểm</h2>

        <div class="mt-10 flex flex-col gap-5 sm:flex-row">
          <div v-if="hasEventContent(settings?.eventInfo.groom)" v-reveal="100" class="event-info-card flex-1 rounded-[26px] p-6 text-left">
            <p class="font-accent text-base italic text-[var(--color-primary-vivid)]">Nhà Trai</p>
            <p class="text-hover mt-2 text-lg text-text">
              {{ settings?.eventInfo.groom.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.groom.ceremonyTime) : 'Đang cập nhật' }}
            </p>
            <p v-if="settings?.eventInfo.groom.venueName" class="text-hover text-sm text-text-muted">{{ settings.eventInfo.groom.venueName }}</p>
          </div>
          <div v-if="hasEventContent(settings?.eventInfo.bride)" v-reveal="160" class="event-info-card flex-1 rounded-[26px] p-6 text-left">
            <p class="font-accent text-base italic text-[var(--color-primary-vivid)]">Nhà Gái</p>
            <p class="text-hover mt-2 text-lg text-text">
              {{ settings?.eventInfo.bride.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.bride.ceremonyTime) : 'Đang cập nhật' }}
            </p>
            <p v-if="settings?.eventInfo.bride.venueName" class="text-hover text-sm text-text-muted">{{ settings.eventInfo.bride.venueName }}</p>
          </div>
        </div>

        <NuxtLink
          to="/thong-tin"
          v-reveal="220"
          class="focus-ring mt-8 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary-vivid)] underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Xem đầy đủ thông tin lễ cưới →
        </NuxtLink>
      </div>
    </section>

    <GlassLoveStory />
  </div>
</template>

<style scoped>
.aurora-hero {
  background: var(--color-bg);
}
.aurora-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.5;
  will-change: transform;
  pointer-events: none;
}
.aurora-blob.b1 {
  width: 38vw;
  height: 38vw;
  max-width: 480px;
  max-height: 480px;
  left: -6%;
  top: 8%;
  background: color-mix(in srgb, var(--color-primary-vivid) 70%, transparent);
  animation: aurora-a 16s ease-in-out infinite;
}
.aurora-blob.b2 {
  width: 34vw;
  height: 34vw;
  max-width: 420px;
  max-height: 420px;
  right: -4%;
  top: -2%;
  background: color-mix(in srgb, var(--color-secondary-vivid) 65%, transparent);
  animation: aurora-b 20s ease-in-out infinite;
}
.aurora-blob.b3 {
  width: 30vw;
  height: 30vw;
  max-width: 380px;
  max-height: 380px;
  left: 22%;
  bottom: -8%;
  background: color-mix(in srgb, var(--color-gold) 55%, transparent);
  animation: aurora-c 18s ease-in-out infinite;
}
.aurora-blob.b4 {
  width: 30vw;
  height: 30vw;
  max-width: 380px;
  max-height: 380px;
  right: 12%;
  bottom: -10%;
  background: color-mix(in srgb, var(--color-secondary) 45%, transparent);
  animation: aurora-a 22s ease-in-out infinite reverse;
}
@keyframes aurora-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(4%, 3%) scale(1.1); }
}
@keyframes aurora-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-4%, 4%) scale(0.92); }
}
@keyframes aurora-c {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(3%, -3%) scale(1.08); }
}

.cursor-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(260px circle at var(--gx, 50%) var(--gy, 50%), color-mix(in srgb, var(--color-surface) 65%, transparent), transparent 70%);
  transition: opacity 300ms;
}
@media (hover: hover) and (pointer: fine) {
  .aurora-hero:hover .cursor-glow {
    opacity: 1;
  }
}

.glass-hero-card {
  background-color: color-mix(in srgb, var(--color-surface) 55%, transparent);
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid color-mix(in srgb, var(--color-surface) 65%, transparent);
  box-shadow: 0 24px 70px color-mix(in srgb, var(--color-text) 12%, transparent);
  animation: glass-breathe 7s ease-in-out infinite;
}
@keyframes glass-breathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
</style>
