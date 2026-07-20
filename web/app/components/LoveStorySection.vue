<script setup lang="ts">
import type { LightboxPhoto } from '../../server/utils/types'

/**
 * Section "Câu Chuyện Của Chúng Tôi" — chuyển từ trang Thông Tin sang Trang
 * chủ (yêu cầu nâng cấp). Giữ nguyên nội dung/hiệu ứng gốc (`v-reveal`, badge
 * năm, `LotusMotif` phân cách), bổ sung dải ảnh thu nhỏ cho mỗi mốc (nếu có)
 * — bấm vào mở bằng `PhotoLightbox` dùng chung (tái sử dụng, không viết
 * lightbox riêng). Ảnh mốc không có endpoint tải riêng nên tắt nút tải
 * (`show-download="false"`).
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
  <section class="mx-auto max-w-2xl px-6 pb-24">
    <h2 class="mb-8 text-center font-heading text-3xl text-text">Câu Chuyện Của Chúng Tôi</h2>

    <div v-if="loveStory.length === 0" class="py-10 text-center">
      <LotusMotif class="mx-auto h-14 w-14 text-secondary-light" />
      <p class="mt-6 text-text-muted">Câu chuyện tình yêu sẽ sớm được cập nhật.</p>
    </div>

    <ol v-else class="flex flex-col">
      <li
        v-for="(milestone, i) in loveStory"
        :key="milestone.id"
        v-reveal="i * 60"
        class="flex gap-5"
      >
        <div class="flex flex-col items-center">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm text-primary shadow-none transition-all duration-200 hover:bg-primary/25 hover:shadow-[0_0_14px_rgba(219,39,119,0.35)]">
            {{ milestone.year }}
          </span>
          <LotusMotif v-if="i < loveStory.length - 1" class="my-2 h-6 w-6 shrink-0 text-secondary-light" />
        </div>
        <div class="pb-8">
          <h3 class="text-hover font-heading text-xl text-text">{{ milestone.title }}</h3>
          <p class="text-hover mt-1 text-text-muted">{{ milestone.content }}</p>

          <div v-if="milestone.photos?.length" class="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              v-for="(photo, pi) in milestone.photos"
              :key="photo.id"
              type="button"
              class="focus-ring group h-16 w-16 shrink-0 overflow-hidden rounded-md transition-shadow duration-200 hover:shadow-md"
              @click="openMilestonePhoto(milestone.photos, pi)"
            >
              <img
                :src="`/uploads/${photo.filename}`"
                :alt="photo.caption || milestone.title"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
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
