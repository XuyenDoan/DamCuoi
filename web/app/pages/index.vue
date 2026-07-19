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

/**
 * Đếm ngược riêng cho từng nhà — trước đây chỉ có 1 đồng hồ đếm ngược dùng
 * chung `weddingDate` (1 field tổng quát, độc lập với giờ lễ từng nhà),
 * nên trên thực tế lệch ngày so với giờ lễ thật đã nhập ở mục "Thông tin
 * lễ cưới — Nhà trai/Nhà gái" (VD: `weddingDate` = 28/11 nhưng giờ lễ nhà
 * trai thật lại là 20/11). Giờ tính đếm ngược THẲNG từ `eventInfo.groom`/
 * `eventInfo.bride` (đúng nguồn dữ liệu admin đã nhập cho từng nhà), không
 * dùng `weddingDate` nữa cho phần đếm ngược (vẫn giữ `weddingDate` cho
 * dòng ngày tháng chung phía trên).
 */
function ceremonyYmd(iso: string | undefined): string {
  if (!iso) return ''
  return isoToVietnamLocalInput(iso).slice(0, 10)
}

function countdownFor(iso: string | undefined): string {
  const ymd = ceremonyYmd(iso)
  if (!ymd) return ''
  const days = daysBetweenYmd(todayYmdInVietnam(), ymd)
  if (days > 1) return `Còn ${days} ngày nữa`
  if (days === 1) return 'Còn 1 ngày nữa'
  if (days === 0) return 'Hôm nay là ngày trọng đại!'
  return ''
}

const groomCountdown = computed(() => countdownFor(settings.value?.eventInfo.groom.ceremonyTime))
const brideCountdown = computed(() => countdownFor(settings.value?.eventInfo.bride.ceremonyTime))
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

      <div v-if="groomCountdown || brideCountdown" class="flex flex-wrap items-center justify-center gap-3">
        <p
          v-if="groomCountdown"
          class="rounded-full border border-secondary px-5 py-2 text-sm text-secondary"
        >
          <span class="font-medium">Nhà Trai:</span> {{ groomCountdown }}
        </p>
        <p
          v-if="brideCountdown"
          class="rounded-full border border-secondary px-5 py-2 text-sm text-secondary"
        >
          <span class="font-medium">Nhà Gái:</span> {{ brideCountdown }}
        </p>
      </div>

      <p v-if="settings?.welcomeMessage" class="max-w-xl text-base leading-relaxed text-text-muted">
        {{ settings.welcomeMessage }}
      </p>

      <NuxtLink to="/album" class="btn-primary mt-2">Xem Album Ảnh</NuxtLink>
    </div>
  </section>

  <LoveStorySection />
</template>
