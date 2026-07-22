<script setup lang="ts">
import type { LightboxPhoto } from '../../../server/utils/types'

/**
 * "Câu Chuyện Của Chúng Tôi" — trình bày dạng mục lục tạp chí (số thứ tự +
 * tiêu đề + trích đoạn, đường kẻ mảnh phân cách) thay cho đường ống trang
 * trí của theme mặc định (spec.md mục 36, Phương án 01). Cùng dữ liệu
 * `loveStory`, tái dùng nguyên `PhotoLightbox` (không viết lại logic
 * lightbox riêng).
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

function ordinal(i: number): string {
  return String(i + 1).padStart(2, '0')
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-6 pb-28 pt-8">
    <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Mục lục</p>
    <h2 class="mb-12 font-heading text-3xl text-text">Câu Chuyện Của Chúng Tôi</h2>

    <div v-if="loveStory.length === 0" class="border-t border-text/10 py-10 text-center">
      <p class="mt-6 text-text-muted">Câu chuyện tình yêu sẽ sớm được cập nhật.</p>
    </div>

    <ol v-else class="flex flex-col">
      <li
        v-for="(milestone, i) in loveStory"
        :key="milestone.id"
        v-reveal="i * 60"
        class="grid grid-cols-[3.5rem_1fr] gap-6 border-t border-text/10 py-8 first:border-t-0 sm:grid-cols-[5rem_1fr]"
      >
        <span class="font-heading text-3xl leading-none text-secondary">{{ ordinal(i) }}</span>
        <div class="min-w-0">
          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 class="text-hover font-heading text-xl text-text">{{ milestone.title }}</h3>
            <span class="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">{{ milestone.year }}</span>
          </div>
          <p class="text-hover mt-2 max-w-xl text-[15px] leading-relaxed text-text-muted">{{ milestone.content }}</p>

          <div v-if="milestone.photos?.length" class="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="(photo, pi) in milestone.photos"
              :key="photo.id"
              type="button"
              class="focus-ring group h-16 w-16 shrink-0 overflow-hidden"
              @click="openMilestonePhoto(milestone.photos, pi)"
            >
              <img
                :src="`/uploads/${photo.filename}`"
                :alt="photo.caption || milestone.title"
                loading="lazy"
                class="h-full w-full object-cover grayscale transition-all duration-300 ease-out group-hover:grayscale-0"
              />
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
