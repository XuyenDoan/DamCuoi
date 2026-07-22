<script setup lang="ts">
import type { LightboxPhoto } from '../../../server/utils/types'

/**
 * "Câu Chuyện Của Chúng Tôi" — trình bày dạng cuộn phim (mỗi mốc = 1 khung
 * hình), cuộn ngang trên desktop (`scroll-snap`), xếp dọc tự nhiên trên
 * mobile (spec.md mục 36, Phương án 02). Cùng dữ liệu `loveStory`, tái dùng
 * nguyên `PhotoLightbox`.
 */
const { data: settings } = useSiteSettings()
const loveStory = computed(() => settings.value?.loveStory ?? [])

const lightboxPhotos = ref<LightboxPhoto[]>([])
const lightboxIndex = ref<number | null>(null)

function openMilestonePhoto(photos: LightboxPhoto[], i: number) {
  lightboxPhotos.value = photos
  lightboxIndex.value = i
}
function closeLightbox() {
  lightboxIndex.value = null
}
function nextPhoto() {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value + 1) % lightboxPhotos.value.length
}
function prevPhoto() {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value - 1 + lightboxPhotos.value.length) % lightboxPhotos.value.length
}
</script>

<template>
  <section class="px-6 pb-28 pt-8">
    <div class="mx-auto max-w-6xl">
      <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Cuộn phim</span>
      <h2 class="mt-2 font-heading text-3xl text-text">Câu Chuyện Của Chúng Tôi</h2>
    </div>

    <div v-if="loveStory.length === 0" class="mx-auto mt-10 max-w-6xl text-center">
      <p class="text-text-muted">Câu chuyện tình yêu sẽ sớm được cập nhật.</p>
    </div>

    <ol
      v-else
      class="film-reel mx-auto mt-10 flex max-w-6xl flex-col gap-5 lg:flex-row lg:gap-4 lg:overflow-x-auto lg:pb-4"
    >
      <li
        v-for="(milestone, i) in loveStory"
        :key="milestone.id"
        v-reveal="i * 60"
        class="relative shrink-0 overflow-hidden rounded-sm border border-text/10 bg-surface lg:w-[320px]"
      >
        <button
          v-if="milestone.photos?.[0]"
          type="button"
          class="focus-ring-dark group relative block h-56 w-full overflow-hidden"
          @click="openMilestonePhoto(milestone.photos, 0)"
        >
          <img
            :src="`/uploads/${milestone.photos[0].filename}`"
            :alt="milestone.photos[0].caption || milestone.title"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <span class="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-80" />
          <span class="absolute bottom-3 left-3 font-heading text-sm text-primary">{{ milestone.year }}</span>
        </button>
        <div v-else class="flex h-56 w-full items-end bg-gradient-to-br from-surface to-bg p-3">
          <span class="font-heading text-sm text-primary">{{ milestone.year }}</span>
        </div>

        <div class="p-5">
          <h3 class="text-hover-dark font-heading text-lg italic text-text">{{ milestone.title }}</h3>
          <p class="text-hover-dark mt-2 text-sm leading-relaxed text-text-muted">{{ milestone.content }}</p>

          <div v-if="milestone.photos && milestone.photos.length > 1" class="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="(photo, pi) in milestone.photos.slice(1)"
              :key="photo.id"
              type="button"
              class="focus-ring-dark h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-text/10"
              @click="openMilestonePhoto(milestone.photos, pi + 1)"
            >
              <img :src="`/uploads/${photo.filename}`" :alt="photo.caption || milestone.title" loading="lazy" class="h-full w-full object-cover" />
            </button>
          </div>
        </div>
      </li>
    </ol>

    <PhotoLightbox
      :photos="lightboxPhotos"
      :index="lightboxIndex"
      :show-download="false"
      @close="closeLightbox"
      @next="nextPhoto"
      @prev="prevPhoto"
    />
  </section>
</template>

<style scoped>
@media (min-width: 1024px) {
  .film-reel {
    scroll-snap-type: x proximity;
  }
  .film-reel > li {
    scroll-snap-align: start;
  }
}
</style>
