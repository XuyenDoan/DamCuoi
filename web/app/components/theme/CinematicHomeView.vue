<script setup lang="ts">
import CinematicLoveStory from './CinematicLoveStory.vue'

/**
 * Trang chủ — theme "Điện Ảnh Cuộn" (spec.md mục 36, Phương án 02). Hero
 * full-bleed như 1 cảnh phim mở đầu, Ken Burns rất chậm, chữ neo đáy khung
 * kiểu phụ đề. Cùng nguồn dữ liệu với theme mặc định — chỉ đổi trình bày.
 *
 * spec.md mục 38.12: tagline + tên cô dâu chú rể chuyển hẳn lên ảnh hero
 * (`HeroCoupleImage.vue`) — cảnh phim Ken Burns dưới đây (ảnh khác, từ
 * `pageBackgrounds.home`) giờ chỉ còn nhãn "Cảnh 01" + `welcomeMessage`.
 * Vẫn giữ `min-h-screen` cho khối này (khác các theme không có ảnh nền
 * riêng) vì bản thân ẢNH NỀN full-bleed + Ken Burns đã đủ ấn tượng để lấp
 * đầy màn hình dù chữ đã rút gọn — không giống các theme nền phẳng (rút gọn
 * chiều cao vì không còn gì lấp khoảng trống). Bỏ nút "cuộn xuống" (JS
 * `scrollHintOpacity`) do không còn khối text cao để dẫn dắt cuộn qua. CTA
 * "Xem Album Ảnh" dời xuống cuối trang qua `<AlbumCtaSection />`.
 */
const { data: settings } = useSiteSettings()

const hasAnyEventInfo = computed(
  () => hasEventContent(settings.value?.eventInfo.groom) || hasEventContent(settings.value?.eventInfo.bride)
)

const heroImage = computed(() => settings.value?.pageBackgrounds?.home ?? null)
</script>

<template>
  <div>
    <HeroCoupleImage />

    <section class="relative flex min-h-screen items-end overflow-hidden px-6 pb-24 pt-32 sm:px-10">
      <div class="absolute inset-0" aria-hidden="true">
        <img
          v-if="heroImage"
          :src="`/uploads/${heroImage}`"
          alt=""
          class="ken-burns h-full w-full object-cover opacity-70"
        />
        <div v-else class="ken-burns h-full w-full" style="background: radial-gradient(circle at 60% 30%, color-mix(in srgb, var(--color-primary) 22%, var(--color-bg)), var(--color-bg) 72%)" />
        <div class="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />
      </div>

      <div class="relative max-w-2xl">
        <span v-reveal="0" class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Cảnh 01 · Mở đầu</span>

        <p v-if="settings?.welcomeMessage" v-reveal="120" class="mt-4 max-w-md text-sm leading-relaxed text-text-muted">
          {{ settings.welcomeMessage }}
        </p>
      </div>
    </section>

    <CoupleIntroSection />

    <CinematicLoveStory />

    <section v-if="hasAnyEventInfo" class="relative px-6 py-24">
      <div class="mx-auto max-w-3xl text-center">
        <span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Cảnh 02 · Trân trọng kính mời</span>
        <h2 v-reveal class="mt-3 font-heading text-3xl text-text">Giờ Lễ &amp; Địa Điểm</h2>

        <div class="mt-12 grid gap-10 sm:grid-cols-2 sm:divide-x sm:divide-text/10">
          <div v-if="hasEventContent(settings?.eventInfo.bride)" v-reveal="80">
            <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Lễ Vu Quy</p>
            <p class="text-hover-dark mt-4 font-heading text-2xl italic text-text">
              {{ settings?.eventInfo.bride.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.bride.ceremonyTime) : 'Đang cập nhật' }}
            </p>
            <p v-if="settings?.eventInfo.bride.venueName" class="text-hover-dark mt-2 text-sm text-text-muted">
              {{ settings.eventInfo.bride.venueName }}
            </p>
          </div>
          <div v-if="hasEventContent(settings?.eventInfo.groom)" v-reveal="140">
            <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Lễ Thành Hôn</p>
            <p class="text-hover-dark mt-4 font-heading text-2xl italic text-text">
              {{ settings?.eventInfo.groom.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.groom.ceremonyTime) : 'Đang cập nhật' }}
            </p>
            <p v-if="settings?.eventInfo.groom.venueName" class="text-hover-dark mt-2 text-sm text-text-muted">
              {{ settings.eventInfo.groom.venueName }}
            </p>
          </div>
        </div>

        <NuxtLink
          to="/thong-tin"
          v-reveal="200"
          class="focus-ring-dark mt-10 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 transition-colors duration-200 hover:underline"
        >
          Xem đầy đủ thông tin lễ cưới →
        </NuxtLink>
      </div>
    </section>

    <AlbumCtaSection />
  </div>
</template>
