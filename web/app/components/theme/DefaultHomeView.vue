<script setup lang="ts">
/**
 * Trang chủ — theme "Hoa Sen" (mặc định). Nội dung/markup CHUYỂN NGUYÊN VẸN
 * từ pages/index.vue khi tách kiến trúc đa theme (spec.md mục 36) — không
 * đổi hành vi/hiệu ứng gì so với trước.
 *
 * spec.md mục 38.12: tagline + tên cô dâu chú rể chuyển hẳn lên ảnh hero
 * (`HeroCoupleImage.vue`) — khối dưới ảnh giờ chỉ còn `welcomeMessage`, bỏ
 * `min-h-screen` (không còn lý do chiếm trọn màn hình khi nội dung chỉ còn
 * 1 đoạn ngắn) và bỏ luôn nút "cuộn xuống" (thiết kế cho khối cao hết màn
 * hình, không còn hợp khi khối đã thu gọn). CTA "Xem Album Ảnh" dời xuống
 * cuối trang qua `<AlbumCtaSection />`.
 */
const { data: settings } = useSiteSettings()

const hasAnyEventInfo = computed(
  () => hasEventContent(settings.value?.eventInfo.groom) || hasEventContent(settings.value?.eventInfo.bride)
)
</script>

<template>
  <div>
    <HeroCoupleImage />

    <section v-if="settings?.welcomeMessage" class="px-6 py-16 text-center sm:py-20">
      <p v-reveal="0" class="text-hover mx-auto max-w-xl text-base leading-relaxed text-text-muted">
        {{ settings.welcomeMessage }}
      </p>
    </section>

    <CoupleIntroSection />

    <LoveStorySection />

    <section v-if="hasAnyEventInfo" class="mx-auto max-w-2xl px-6 pb-24 text-center">
      <h2 v-reveal class="mb-2 font-heading text-2xl text-text">Giờ Lễ &amp; Địa Điểm</h2>
      <p v-reveal="60" class="mb-8 text-sm text-text-muted">
        Rất mong được đón tiếp bạn trong ngày trọng đại của chúng tôi.
      </p>
      <div class="flex flex-col gap-4 sm:flex-row">
        <div
          v-if="hasEventContent(settings?.eventInfo.bride)"
          v-reveal="100"
          class="flex-1 rounded-xl border border-secondary-light/40 bg-surface p-5 text-left"
        >
          <p class="font-accent text-base italic text-primary">Lễ Vu Quy</p>
          <p class="text-hover mt-2 text-sm text-text">
            {{ settings?.eventInfo.bride.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.bride.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.bride.venueName" class="text-hover text-sm text-text-muted">
            {{ settings.eventInfo.bride.venueName }}
          </p>
        </div>
        <div
          v-if="hasEventContent(settings?.eventInfo.groom)"
          v-reveal="160"
          class="flex-1 rounded-xl border border-secondary-light/40 bg-surface p-5 text-left"
        >
          <p class="font-accent text-base italic text-primary">Lễ Thành Hôn</p>
          <p class="text-hover mt-2 text-sm text-text">
            {{ settings?.eventInfo.groom.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.groom.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.groom.venueName" class="text-hover text-sm text-text-muted">
            {{ settings.eventInfo.groom.venueName }}
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

    <AlbumCtaSection />
  </div>
</template>
