<script setup lang="ts">
import type { LightboxPhoto } from '../../../server/utils/types'

/**
 * "Câu Chuyện Của Chúng Tôi" — theme Lưới Chuyển Động (spec.md mục 37).
 * Danh sách đầy đủ các mốc dạng lưới ô màu pastel xen kẽ, nghiêng nhẹ theo
 * chuột (`v-tilt`) — cùng dữ liệu `loveStory` + `PhotoLightbox` chung.
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

const cellBg = ['var(--bento-cell-1)', 'var(--bento-cell-2)', 'var(--bento-cell-3)', 'var(--bento-cell-4)']
</script>

<template>
  <section class="tilt-grid px-6 pb-32">
    <div class="mx-auto mb-10 max-w-6xl">
      <span class="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary-vivid)]">Câu chuyện</span>
      <h2 class="mt-1 font-heading text-3xl font-extrabold text-text">Câu Chuyện Của Chúng Tôi</h2>
    </div>

    <div v-if="loveStory.length === 0" class="mx-auto max-w-md text-center">
      <p class="text-text-muted">Câu chuyện tình yêu sẽ sớm được cập nhật.</p>
    </div>

    <ol v-else class="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="(milestone, i) in loveStory"
        :key="milestone.id"
        v-reveal="i * 60"
        v-tilt
        class="rounded-[24px] p-6"
        :style="{ background: cellBg[i % cellBg.length] }"
      >
        <span class="font-heading text-2xl font-extrabold text-text">{{ milestone.year }}</span>
        <h3 class="text-hover mt-1 font-heading text-lg font-bold text-text">{{ milestone.title }}</h3>
        <p class="text-hover mt-2 text-sm leading-relaxed text-text opacity-80">{{ milestone.content }}</p>

        <div v-if="milestone.photos?.length" class="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="(photo, pi) in milestone.photos"
            :key="photo.id"
            type="button"
            class="focus-ring group h-14 w-14 shrink-0 overflow-hidden rounded-xl"
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
