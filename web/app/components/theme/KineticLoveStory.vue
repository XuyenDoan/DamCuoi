<script setup lang="ts">
import type { LightboxPhoto } from '../../../server/utils/types'

/**
 * "Câu Chuyện Của Chúng Tôi" — theme Chữ Cuộn Kịch Tính (spec.md mục 37).
 * Mỗi mốc kể bằng 2 dòng chữ lớn (`v-kinetic`): năm+tiêu đề, rồi nội dung —
 * đậm nét/đổi màu khi cuộn tới đúng dải giữa màn hình. Cùng dữ liệu
 * `loveStory` + `PhotoLightbox` chung — KHÔNG bớt nội dung nào, chỉ đổi
 * cách trình bày.
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
  <section class="px-6 pb-16 pt-8">
    <div class="mx-auto max-w-3xl text-center">
      <span class="text-xs font-bold uppercase tracking-[0.14em] text-primary">Câu chuyện</span>
    </div>

    <div v-if="loveStory.length === 0" class="mx-auto mt-8 max-w-md text-center">
      <p class="text-text-muted">Câu chuyện tình yêu sẽ sớm được cập nhật.</p>
    </div>

    <div v-else class="mx-auto flex max-w-4xl flex-col">
      <div v-for="milestone in loveStory" :key="milestone.id" class="flex flex-col items-center gap-8 py-24 text-center">
        <p v-kinetic class="m-0 font-heading text-4xl leading-none sm:text-5xl">
          {{ milestone.year }} — {{ milestone.title }}
        </p>
        <p v-kinetic class="m-0 max-w-2xl font-heading text-2xl leading-snug sm:text-3xl">
          {{ milestone.content }}
        </p>

        <div v-if="milestone.photos?.length" class="mt-2 flex gap-3">
          <button
            v-for="(photo, pi) in milestone.photos"
            :key="photo.id"
            type="button"
            class="focus-ring group h-20 w-20 shrink-0 overflow-hidden rounded-sm border-2 border-text"
            @click="openMilestonePhoto(milestone.photos, pi)"
          >
            <img
              :src="`/uploads/${photo.filename}`"
              :alt="photo.caption || milestone.title"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
            />
          </button>
        </div>
      </div>
    </div>

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
