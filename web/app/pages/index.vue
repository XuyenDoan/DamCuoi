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

/**
 * Bấm vào khu vực đếm ngược mở popup xem đầy đủ thông tin lễ (giờ/địa điểm/
 * bản đồ) của đúng nhà đó — tái sử dụng `EventInfoCard`/`EventInfoModal`
 * (cùng nội dung/logic với trang "Thông tin lễ cưới", không lặp lại).
 */
const openFamily = ref<'groom' | 'bride' | null>(null)
const openFamilyInfo = computed(() =>
  openFamily.value ? settings.value?.eventInfo[openFamily.value] : undefined
)
const openFamilyLabel = computed(() => (openFamily.value === 'groom' ? 'Nhà Trai' : 'Nhà Gái'))
</script>

<template>
  <div>
    <section class="relative flex min-h-screen items-center justify-center px-6 py-32 text-center">
      <div class="relative flex max-w-2xl flex-col items-center gap-6">
        <p
          v-if="settings?.heroTagline"
          v-reveal="0"
          class="font-accent text-lg italic tracking-wide text-text-muted"
        >
          {{ settings.heroTagline }}
        </p>

        <h1 v-reveal="100" class="font-heading text-5xl leading-tight text-text sm:text-6xl md:text-7xl">
          <span>{{ settings?.coupleNames.groom }}</span>
          <span class="mx-3 text-primary">&amp;</span>
          <span>{{ settings?.coupleNames.bride }}</span>
        </h1>

        <p v-if="formattedDate" v-reveal="180" class="text-sm uppercase tracking-[0.3em] text-text-muted">
          {{ formattedDate }}
        </p>

        <div
          v-if="groomCountdown || brideCountdown"
          v-reveal="260"
          class="flex flex-wrap items-center justify-center gap-3"
        >
          <button
            v-if="groomCountdown"
            type="button"
            class="focus-ring min-h-11 rounded-full border border-secondary px-5 py-2 text-sm text-secondary transition-all duration-200 hover:bg-secondary hover:text-white active:scale-[0.98]"
            @click="openFamily = 'groom'"
          >
            <span class="font-medium">Nhà Trai:</span> {{ groomCountdown }}
          </button>
          <button
            v-if="brideCountdown"
            type="button"
            class="focus-ring min-h-11 rounded-full border border-secondary px-5 py-2 text-sm text-secondary transition-all duration-200 hover:bg-secondary hover:text-white active:scale-[0.98]"
            @click="openFamily = 'bride'"
          >
            <span class="font-medium">Nhà Gái:</span> {{ brideCountdown }}
          </button>
        </div>

        <p
          v-if="settings?.welcomeMessage"
          v-reveal="340"
          class="max-w-xl text-base leading-relaxed text-text-muted"
        >
          {{ settings.welcomeMessage }}
        </p>

        <NuxtLink to="/album" v-reveal="420" class="btn-primary mt-2">Xem Album Ảnh</NuxtLink>
      </div>
    </section>

    <LoveStorySection />

    <EventInfoModal
      :open="openFamily !== null"
      :label="openFamilyLabel"
      :info="openFamilyInfo"
      @close="openFamily = null"
    />
  </div>
</template>
