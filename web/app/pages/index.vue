<script setup lang="ts">
useHead({
  title: 'Album Cưới',
  meta: [
    {
      name: 'description',
      content: 'Album ảnh cưới — lưu giữ những khoảnh khắc đáng nhớ trong ngày trọng đại.'
    }
  ]
})

const { data: settings } = useSiteSettings()

const formattedDate = computed(() => {
  if (!settings.value?.weddingDate) return ''
  return formatVietnameseDate(settings.value.weddingDate)
})

const countdownLabel = computed(() => {
  if (!settings.value?.weddingDate) return ''
  const days = daysBetweenYmd(todayYmdInVietnam(), settings.value.weddingDate)
  if (days > 1) return `Còn ${days} ngày nữa`
  if (days === 1) return 'Còn 1 ngày nữa'
  if (days === 0) return 'Hôm nay là ngày trọng đại!'
  return ''
})
</script>

<template>
  <section class="relative flex min-h-screen items-center justify-center px-6 py-32 text-center">
    <div class="relative flex max-w-2xl flex-col items-center gap-6">
      <p
        v-if="settings?.heroTagline"
        class="font-accent text-lg italic tracking-wide text-text-muted"
      >
        {{ settings.heroTagline }}
      </p>

      <h1 class="font-heading text-5xl leading-tight text-text sm:text-6xl md:text-7xl">
        <span>{{ settings?.coupleNames.groom }}</span>
        <span class="mx-3 text-primary">&amp;</span>
        <span>{{ settings?.coupleNames.bride }}</span>
      </h1>

      <p v-if="formattedDate" class="text-sm uppercase tracking-[0.3em] text-text-muted">
        {{ formattedDate }}
      </p>

      <p
        v-if="countdownLabel"
        class="rounded-full border border-secondary px-5 py-2 text-sm text-secondary"
      >
        {{ countdownLabel }}
      </p>

      <p v-if="settings?.welcomeMessage" class="max-w-xl text-base leading-relaxed text-text-muted">
        {{ settings.welcomeMessage }}
      </p>

      <NuxtLink to="/album" class="btn-primary mt-2">Xem Album Ảnh</NuxtLink>
    </div>
  </section>

  <LoveStorySection />
</template>
