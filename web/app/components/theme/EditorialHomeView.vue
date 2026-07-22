<script setup lang="ts">
import EditorialLoveStory from './EditorialLoveStory.vue'

/**
 * Trang chủ — theme "Biên Tập Sang Trọng" (spec.md mục 36, Phương án 01).
 * Lưới bất đối xứng, typography lớn làm chủ đạo, không hoạ tiết trang trí.
 * Cùng nguồn dữ liệu với theme mặc định (useSiteSettings) — chỉ đổi trình
 * bày.
 */
const { data: settings } = useSiteSettings()

const hasAnyEventInfo = computed(
  () => hasEventContent(settings.value?.eventInfo.groom) || hasEventContent(settings.value?.eventInfo.bride)
)

const heroImage = computed(() => settings.value?.pageBackgrounds?.home ?? null)

const monogram = computed(() => {
  const s = settings.value
  if (!s) return ''
  const g = s.coupleNames.groom?.trim().charAt(0) ?? ''
  const b = s.coupleNames.bride?.trim().charAt(0) ?? ''
  return `${g}${b}`.toUpperCase()
})
</script>

<template>
  <div>
    <section class="mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-14 sm:pt-20 lg:grid-cols-12 lg:gap-0 lg:pt-28">
      <div class="flex flex-col justify-center gap-6 lg:col-span-5 lg:pr-14">
        <p v-if="settings?.heroTagline" v-reveal="0" class="text-hover font-accent text-base italic text-text-muted">
          {{ settings.heroTagline }}
        </p>

        <h1 v-reveal="100" class="font-heading text-5xl leading-[1.02] text-text sm:text-6xl">
          {{ settings?.coupleNames.groom }}
          <em class="not-italic text-secondary">&amp;</em><br />
          {{ settings?.coupleNames.bride }}
        </h1>

        <div v-reveal="180" class="h-px w-16 bg-text/25" />

        <p v-if="settings?.welcomeMessage" v-reveal="240" class="max-w-md text-[15px] leading-relaxed text-text-muted">
          {{ settings.welcomeMessage }}
        </p>

        <NuxtLink to="/album" v-reveal="320" class="btn-primary mt-2 self-start">Xem Album Ảnh</NuxtLink>
      </div>

      <div class="relative lg:col-span-7">
        <img
          v-if="heroImage"
          :src="`/uploads/${heroImage}`"
          alt=""
          class="h-[52vh] w-full object-cover lg:h-[78vh]"
        />
        <div
          v-else
          class="flex h-[42vh] w-full items-center justify-center border border-text/15 bg-primary lg:h-[78vh]"
        >
          <span class="font-heading text-[9rem] leading-none text-bg/90 sm:text-[12rem]">{{ monogram }}</span>
        </div>
      </div>
    </section>

    <p class="mx-auto -mt-10 mb-24 max-w-6xl px-6 text-center">
      <a
        href="#cau-chuyen"
        class="focus-ring text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted transition-colors duration-200 hover:text-secondary"
      >Cuộn xuống ↓</a>
    </p>

    <section v-if="hasAnyEventInfo" class="mx-auto max-w-3xl px-6 pb-24">
      <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Trân trọng kính mời</p>
      <h2 v-reveal class="mb-10 font-heading text-3xl text-text">Giờ Lễ &amp; Địa Điểm</h2>
      <div class="grid gap-x-10 gap-y-8 border-t border-text/10 sm:grid-cols-2">
        <div v-if="hasEventContent(settings?.eventInfo.groom)" v-reveal="80" class="border-b border-text/10 py-6 sm:border-b-0">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Nhà Trai</p>
          <p class="text-hover mt-3 font-heading text-lg text-text">
            {{ settings?.eventInfo.groom.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.groom.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.groom.venueName" class="text-hover mt-1 text-sm text-text-muted">
            {{ settings.eventInfo.groom.venueName }}
          </p>
        </div>
        <div v-if="hasEventContent(settings?.eventInfo.bride)" v-reveal="140" class="py-6">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">Nhà Gái</p>
          <p class="text-hover mt-3 font-heading text-lg text-text">
            {{ settings?.eventInfo.bride.ceremonyTime ? formatVietnameseDateTime(settings.eventInfo.bride.ceremonyTime) : 'Đang cập nhật' }}
          </p>
          <p v-if="settings?.eventInfo.bride.venueName" class="text-hover mt-1 text-sm text-text-muted">
            {{ settings.eventInfo.bride.venueName }}
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

    <div id="cau-chuyen">
      <EditorialLoveStory />
    </div>
  </div>
</template>
