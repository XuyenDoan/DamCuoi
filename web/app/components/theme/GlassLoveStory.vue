<script setup lang="ts">
import type { LightboxPhoto } from '../../../server/utils/types'

/**
 * "Câu Chuyện Của Chúng Tôi" — theme Kính Mờ Ánh Sáng (spec.md mục 37).
 * Mỗi mốc là 1 khối kính mờ nổi riêng biệt, lệch trái/phải xen kẽ — tái
 * dùng đúng dữ liệu `loveStory` + `PhotoLightbox` chung.
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
  <section class="relative px-6 pb-32 pt-8">
    <div class="mx-auto mb-14 max-w-xl text-center">
      <span class="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary-vivid)]">Câu chuyện</span>
      <h2 class="mt-2 font-heading text-4xl text-text">Câu Chuyện Của Chúng Tôi</h2>
    </div>

    <div v-if="loveStory.length === 0" class="mx-auto max-w-md text-center">
      <p class="text-text-muted">Câu chuyện tình yêu sẽ sớm được cập nhật.</p>
    </div>

    <ol v-else class="mx-auto flex max-w-3xl flex-col gap-8">
      <li
        v-for="(milestone, i) in loveStory"
        :key="milestone.id"
        v-reveal="i * 80"
        class="glass-milestone rounded-[28px] p-7 sm:p-8"
        :class="i % 2 === 1 ? 'sm:ml-16' : 'sm:mr-16'"
      >
        <span class="font-heading text-2xl text-[var(--color-primary-vivid)]">{{ milestone.year }}</span>
        <h3 class="text-hover mt-1 font-heading text-xl text-text">{{ milestone.title }}</h3>
        <p class="text-hover mt-2 text-[15px] leading-relaxed text-text-muted">{{ milestone.content }}</p>

        <div v-if="milestone.photos?.length" class="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="(photo, pi) in milestone.photos"
            :key="photo.id"
            type="button"
            class="focus-ring group h-16 w-16 shrink-0 overflow-hidden rounded-2xl"
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

<style scoped>
.glass-milestone {
  background-color: color-mix(in srgb, var(--color-surface) 55%, transparent);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid color-mix(in srgb, var(--color-surface) 65%, transparent);
  box-shadow: 0 16px 40px color-mix(in srgb, var(--color-text) 8%, transparent);
  transition: box-shadow 250ms, transform 250ms;
}
.glass-milestone:hover {
  box-shadow: 0 20px 50px color-mix(in srgb, var(--color-primary-vivid) 20%, transparent);
  transform: translateY(-4px);
}
@media (prefers-reduced-motion: reduce) {
  .glass-milestone {
    transition: none;
  }
  .glass-milestone:hover {
    transform: none;
  }
}
</style>
