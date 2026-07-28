<script setup lang="ts">
import BentoLoveStory from './BentoLoveStory.vue'

/**
 * Trang chủ — theme "Lưới Chuyển Động" (spec.md mục 37, Phương án 04).
 * Khối mở đầu là 1 lưới bento tóm tắt (tên, đếm ngược, câu chuyện, album,
 * lời chúc) — nghiêng nhẹ theo chuột (`v-tilt`), bay vào theo nhịp. Toàn bộ
 * dữ liệu câu chuyện tình yêu ĐẦY ĐỦ vẫn hiển thị bên dưới qua
 * `BentoLoveStory` — lưới chỉ là bản tóm tắt, không thay thế nội dung đầy đủ.
 *
 * spec.md mục 38: "Giờ Lễ & Địa Điểm" TÁCH khỏi lưới, chuyển xuống cuối
 * trang (đúng yêu cầu chung cho cả 6 theme) — trước đây 2 ô "Nhà Trai"/"Nhà
 * Gái" nằm NGAY TRONG lưới (row-span-2), nay lưới chỉ còn 4 ô số liệu +
 * ô tên/CTA, xếp gọn 2x2 bên cạnh ô tên thay vì để trống.
 */
const { data: settings } = useSiteSettings()
const { data: photos } = usePublishedPhotos()
const { data: wishes } = useWishes()

const hasAnyEventInfo = computed(
  () => hasEventContent(settings.value?.eventInfo.groom) || hasEventContent(settings.value?.eventInfo.bride)
)

/**
 * Số ngày tới lễ cưới — lấy mốc SỚM NHẤT trong 2 nhà còn ở tương lai. Tính
 * 1 lần khi component dựng (không setInterval tự tăng) — đủ mịn cho hiển
 * thị dạng số nguyên "còn N ngày", tránh rủi ro hydration mismatch (đã ghi
 * chú kỹ trong PR): lệch vài giây/mili-giây giữa SSR và client không thể
 * làm lệch kết quả `Math.ceil` ở đơn vị NGÀY.
 */
const daysUntil = computed(() => {
  const times = [settings.value?.eventInfo.groom.ceremonyTime, settings.value?.eventInfo.bride.ceremonyTime]
    .filter((t): t is string => !!t)
    .map((t) => new Date(t).getTime())
    .filter((t) => !Number.isNaN(t) && t > Date.now())
  if (times.length === 0) return null
  const soonest = Math.min(...times)
  return Math.max(0, Math.ceil((soonest - Date.now()) / 86400000))
})

const monogram = computed(() => {
  const s = settings.value
  if (!s) return ''
  return `${s.coupleNames.bride?.trim().charAt(0) ?? ''}${s.coupleNames.groom?.trim().charAt(0) ?? ''}`.toUpperCase()
})
</script>

<template>
  <div>
    <section class="tilt-grid mx-auto max-w-6xl px-6 pb-20 pt-28 sm:pt-36">
      <HeroCoupleImage />

      <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div v-reveal="0" v-tilt class="col-span-2 row-span-2 flex flex-col justify-center gap-2 rounded-[28px] p-7" style="background: var(--bento-cell-1)">
          <span class="text-xs font-bold uppercase tracking-[0.14em] text-text opacity-70">{{ monogram }}</span>
          <h1 class="font-heading text-3xl font-extrabold leading-[1.05] text-text sm:text-4xl">
            {{ settings?.coupleNames.bride }}<br />&amp; {{ settings?.coupleNames.groom }}
          </h1>
          <p v-if="settings?.heroTagline" class="mt-1 text-sm text-text opacity-75">{{ settings.heroTagline }}</p>
          <NuxtLink to="/album" class="btn-primary mt-3 self-start">Xem Album Ảnh</NuxtLink>
        </div>

        <div v-if="daysUntil !== null" v-reveal="60" v-tilt class="flex flex-col justify-end rounded-[28px] p-5" style="background: var(--bento-cell-3)">
          <span class="font-heading text-4xl font-extrabold text-text">{{ daysUntil }}</span>
          <span class="text-[11px] font-bold uppercase tracking-wide text-text opacity-70">Ngày nữa</span>
        </div>

        <div v-reveal="120" v-tilt class="flex flex-col justify-end rounded-[28px] p-5" style="background: var(--bento-cell-4)">
          <span class="font-heading text-4xl font-extrabold text-text">{{ (settings?.loveStory ?? []).length }}</span>
          <span class="text-[11px] font-bold uppercase tracking-wide text-text opacity-70">Mốc yêu thương</span>
        </div>

        <NuxtLink v-reveal="180" v-tilt to="/album" class="flex flex-col justify-end rounded-[28px] bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
          <span class="font-heading text-3xl font-extrabold text-text">{{ (photos ?? []).length }}</span>
          <span class="text-[11px] font-bold uppercase tracking-wide text-text-muted">Ảnh trong Album</span>
        </NuxtLink>

        <NuxtLink v-reveal="240" v-tilt to="/loi-chuc" class="flex flex-col justify-end rounded-[28px] p-5" style="background: var(--bento-cell-2)">
          <span class="font-heading text-3xl font-extrabold text-text">{{ (wishes ?? []).length }}</span>
          <span class="text-[11px] font-bold uppercase tracking-wide text-text opacity-70">Lời Chúc</span>
        </NuxtLink>
      </div>
    </section>

    <CoupleIntroSection />

    <BentoLoveStory />

    <section v-if="hasAnyEventInfo" class="mx-auto max-w-4xl px-6 pb-24">
      <h2 v-reveal class="mb-2 text-center font-heading text-3xl font-extrabold text-text">Giờ Lễ &amp; Địa Điểm</h2>
      <p v-reveal="60" class="mb-10 text-center text-sm text-text-muted">
        Rất mong được đón tiếp bạn trong ngày trọng đại của chúng tôi.
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
        <div
          v-if="hasEventContent(settings?.eventInfo.bride)"
          v-reveal="100"
          v-tilt
          class="event-info-card rounded-[28px] p-6"
          style="background: var(--bento-cell-3)"
        >
          <p class="text-[11px] font-bold uppercase tracking-wide text-text opacity-70">Lễ Vu Quy</p>
          <p class="mt-2 font-heading text-lg font-bold text-text">
            {{ settings?.eventInfo.bride.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.bride.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.bride.venueName" class="mt-1 text-sm text-text opacity-75">{{ settings.eventInfo.bride.venueName }}</p>
        </div>
        <div
          v-if="hasEventContent(settings?.eventInfo.groom)"
          v-reveal="160"
          v-tilt
          class="event-info-card rounded-[28px] p-6"
          style="background: var(--bento-cell-1)"
        >
          <p class="text-[11px] font-bold uppercase tracking-wide text-text opacity-70">Lễ Thành Hôn</p>
          <p class="mt-2 font-heading text-lg font-bold text-text">
            {{ settings?.eventInfo.groom.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.groom.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.groom.venueName" class="mt-1 text-sm text-text opacity-75">{{ settings.eventInfo.groom.venueName }}</p>
        </div>
      </div>
      <p class="mt-6 text-center">
        <NuxtLink to="/thong-tin" class="focus-ring text-sm font-bold text-[var(--color-primary-vivid)] underline-offset-4 hover:underline">
          Xem đầy đủ thông tin lễ cưới →
        </NuxtLink>
      </p>
    </section>
  </div>
</template>
