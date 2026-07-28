<script setup lang="ts">
import KineticLoveStory from './KineticLoveStory.vue'

/**
 * Trang chủ — theme "Chữ Cuộn Kịch Tính" (spec.md mục 37, Phương án 05).
 * Hero chữ lớn tương phản cao + nút CTA "nam châm" (`v-magnetic`), câu
 * chuyện tình yêu kể bằng chữ cuộn kịch tính (`KineticLoveStory`). Cùng
 * nguồn dữ liệu với các theme khác — chỉ đổi trình bày.
 *
 * spec.md mục 38.12: tagline + tên cô dâu chú rể chuyển hẳn lên ảnh hero
 * (`HeroCoupleImage.vue`) — khối dưới ảnh giờ chỉ còn `welcomeMessage`, bỏ
 * `min-h-screen` + nút "cuộn xuống" (không còn khối chữ cao để dẫn dắt cuộn
 * qua). CTA "Xem Album Ảnh" (kèm `v-magnetic`) dời xuống cuối trang qua
 * `<AlbumCtaSection />`.
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
      <p v-reveal="0" class="text-hover mx-auto max-w-lg text-base leading-relaxed text-text-muted">
        {{ settings.welcomeMessage }}
      </p>
    </section>

    <CoupleIntroSection />

    <KineticLoveStory />

    <section v-if="hasAnyEventInfo" class="border-t-2 border-text px-6 py-24">
      <div class="mx-auto max-w-3xl text-center">
        <h2 v-reveal class="font-heading text-3xl font-extrabold uppercase text-text">Giờ Lễ &amp; Địa Điểm</h2>
        <div class="mt-10 grid gap-10 sm:grid-cols-2">
          <div v-if="hasEventContent(settings?.eventInfo.bride)" v-reveal="80">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-primary">Lễ Vu Quy</p>
            <p class="text-hover mt-3 font-heading text-2xl font-extrabold text-text">
              {{ settings?.eventInfo.bride.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.bride.ceremonyTime) : 'Đang cập nhật' }}
            </p>
            <p v-if="settings?.eventInfo.bride.venueName" class="text-hover mt-1 text-sm text-text-muted">{{ settings.eventInfo.bride.venueName }}</p>
          </div>
          <div v-if="hasEventContent(settings?.eventInfo.groom)" v-reveal="140">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-primary">Lễ Thành Hôn</p>
            <p class="text-hover mt-3 font-heading text-2xl font-extrabold text-text">
              {{ settings?.eventInfo.groom.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.groom.ceremonyTime) : 'Đang cập nhật' }}
            </p>
            <p v-if="settings?.eventInfo.groom.venueName" class="text-hover mt-1 text-sm text-text-muted">{{ settings.eventInfo.groom.venueName }}</p>
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

    <AlbumCtaSection />
  </div>
</template>
