<script setup lang="ts">
import EditorialLoveStory from './EditorialLoveStory.vue'

/**
 * Trang chủ — theme "Biên Tập Sang Trọng" (spec.md mục 36, Phương án 01).
 * Lưới bất đối xứng, typography lớn làm chủ đạo, không hoạ tiết trang trí.
 * Cùng nguồn dữ liệu với theme mặc định (useSiteSettings) — chỉ đổi trình
 * bày.
 *
 * spec.md mục 38.12: tagline + tên cô dâu chú rể chuyển hẳn lên ảnh hero
 * (`HeroCoupleImage.vue`) — cột trái giờ chỉ còn `welcomeMessage` (bỏ tagline,
 * H1, đường kẻ trang trí gắn với H1). Ảnh/monogram lớn cột phải (từ
 * `pageBackgrounds.home`, tính năng khác — ảnh nền riêng từng trang, không
 * liên quan ảnh hero mới) giữ nguyên. CTA "Xem Album Ảnh" dời xuống cuối
 * trang qua `<AlbumCtaSection />`.
 */
const { data: settings } = useSiteSettings()

const hasAnyEventInfo = computed(
  () => hasEventContent(settings.value?.eventInfo.groom) || hasEventContent(settings.value?.eventInfo.bride)
)

const heroImage = computed(() => settings.value?.pageBackgrounds?.home ?? null)

const monogram = computed(() => {
  const s = settings.value
  if (!s) return ''
  const b = s.coupleNames.bride?.trim().charAt(0) ?? ''
  const g = s.coupleNames.groom?.trim().charAt(0) ?? ''
  return `${b}${g}`.toUpperCase()
})
</script>

<template>
  <div>
    <HeroCoupleImage />

    <section class="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:py-20 lg:grid-cols-12 lg:gap-0">
      <div v-if="settings?.welcomeMessage" class="flex flex-col justify-center gap-6 lg:col-span-5 lg:pr-14">
        <p v-reveal="0" class="max-w-md text-[15px] leading-relaxed text-text-muted">
          {{ settings.welcomeMessage }}
        </p>
      </div>

      <div class="relative lg:col-span-7">
        <img
          v-if="heroImage"
          :src="`/uploads/${heroImage}`"
          alt=""
          class="h-[52vh] w-full object-cover lg:h-[68vh]"
        />
        <div
          v-else
          class="flex h-[42vh] w-full items-center justify-center border border-text/15 bg-primary lg:h-[68vh]"
        >
          <span class="font-heading text-[9rem] leading-none text-bg/90 sm:text-[12rem]">{{ monogram }}</span>
        </div>
      </div>
    </section>

    <CoupleIntroSection />

    <EditorialLoveStory />

    <section v-if="hasAnyEventInfo" class="mx-auto max-w-3xl px-6 pb-24">
      <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Trân trọng kính mời</p>
      <h2 v-reveal class="mb-10 font-heading text-3xl text-text">Giờ Lễ &amp; Địa Điểm</h2>
      <div class="grid gap-x-10 gap-y-8 border-t border-text/10 sm:grid-cols-2">
        <div v-if="hasEventContent(settings?.eventInfo.bride)" v-reveal="80" class="border-b border-text/10 py-6 sm:border-b-0">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Lễ Vu Quy</p>
          <p class="text-hover mt-3 font-heading text-lg text-text">
            {{ settings?.eventInfo.bride.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.bride.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.bride.venueName" class="text-hover mt-1 text-sm text-text-muted">
            {{ settings.eventInfo.bride.venueName }}
          </p>
        </div>
        <div v-if="hasEventContent(settings?.eventInfo.groom)" v-reveal="140" class="py-6">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Lễ Thành Hôn</p>
          <p class="text-hover mt-3 font-heading text-lg text-text">
            {{ settings?.eventInfo.groom.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.groom.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.groom.venueName" class="text-hover mt-1 text-sm text-text-muted">
            {{ settings.eventInfo.groom.venueName }}
          </p>
        </div>
      </div>
      <NuxtLink
        to="/thong-tin"
        v-reveal="200"
        class="focus-ring mt-8 inline-flex items-center gap-1 text-sm font-semibold text-secondary underline-offset-4 transition-colors duration-200 hover:underline"
      >
        Xem đầy đủ thông tin lễ cưới →
      </NuxtLink>
    </section>

    <AlbumCtaSection />
  </div>
</template>
