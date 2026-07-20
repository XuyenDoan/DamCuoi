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

/**
 * Khối tóm tắt "Giờ Lễ & Địa Điểm" nối trang chủ -> trang Thông tin lễ cưới
 * (rà soát UI phát hiện trang chủ hơi mỏng, chỉ có Hero + Câu chuyện tình
 * yêu trước khi phải tự bấm sang trang khác). Chỉ hiện tóm tắt (giờ + tên
 * địa điểm), không lặp lại toàn bộ nội dung EventInfoCard (địa chỉ đầy đủ,
 * bản đồ) — tránh trùng lặp với trang /thong-tin, chỉ đóng vai trò dẫn dắt.
 */
const hasAnyEventInfo = computed(
  () => hasEventContent(settings.value?.eventInfo.groom) || hasEventContent(settings.value?.eventInfo.bride)
)

/** Scroll indicator ở đáy Hero — mờ dần rồi ẩn khi cuộn qua khỏi hero */
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

        <p v-if="formattedDate" v-reveal="180" class="text-hover text-sm uppercase tracking-[0.3em] text-text-muted">
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
          class="text-hover max-w-xl text-base leading-relaxed text-text-muted"
        >
          {{ settings.welcomeMessage }}
        </p>

        <NuxtLink to="/album" v-reveal="420" class="btn-primary mt-2">Xem Album Ảnh</NuxtLink>
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

    <LoveStorySection />

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
          <p class="mt-2 text-sm text-text">
            {{ settings?.eventInfo.groom.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.groom.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.groom.venueName" class="text-sm text-text-muted">
            {{ settings.eventInfo.groom.venueName }}
          </p>
        </div>
        <div
          v-if="hasEventContent(settings?.eventInfo.bride)"
          v-reveal="160"
          class="flex-1 rounded-xl border border-secondary-light/40 bg-surface p-5 text-left"
        >
          <p class="font-accent text-base italic text-primary">Nhà Gái</p>
          <p class="mt-2 text-sm text-text">
            {{ settings?.eventInfo.bride.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.bride.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.bride.venueName" class="text-sm text-text-muted">
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

    <EventInfoModal
      :open="openFamily !== null"
      :label="openFamilyLabel"
      :info="openFamilyInfo"
      @close="openFamily = null"
    />
  </div>
</template>
