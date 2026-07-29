<script setup lang="ts">
import type { LightboxPhoto } from '../../server/utils/types'

/**
 * Section "Câu Chuyện Của Chúng Tôi" (chỉ dùng ở theme mặc định + "Sen Màu
 * Nước" — 2 theme tái dùng chung `DefaultHomeView.vue`, spec.md mục 41).
 *
 * Dựng lại timeline (đợt sửa sau mục 40 — bản trước "hiển thị đơn giản
 * quá"): kết hợp ảnh mẫu chủ dự án gửi (ảnh + ngày + nội dung nằm CẠNH
 * NHAU, đường nối giữa các mốc) với cách trình bày mốc thời gian ở các
 * trang wedding/portfolio AAA — ảnh mốc giờ là ẢNH LỚN dẫn dắt mỗi mốc
 * (không còn dải thumbnail 64×64 nhỏ như bản cũ), đổi bên trái/phải xen kẽ
 * theo từng mốc ở màn hình rộng (nhịp điệu biên tập, tránh đơn điệu 1 phía
 * xuyên suốt cả timeline dài), giữ nguyên bên trái/phải như ảnh mẫu ở
 * mobile (đủ chỗ vì ảnh+chữ chỉ chiếm 1 hàng, không xếp chồng).
 *
 * Ảnh đầu tiên của mốc (`photos[0]`) làm ảnh dẫn — bấm vào mở
 * `PhotoLightbox` dùng chung ĐÚNG mảng `photos` đầy đủ của mốc đó (không chỉ
 * 1 ảnh), người xem tự bấm mũi tên trong lightbox để xem hết — thay cho dải
 * thumbnail nhỏ trước đây (gọn hơn, ảnh vẫn xem được đủ). Còn ảnh thì hiện
 * thêm 1 nhãn nhỏ "+N ảnh" ở góc để biết còn ảnh khác chưa xem.
 */
const { data: settings } = useSiteSettings()
const loveStory = computed(() => settings.value?.loveStory ?? [])

const lightboxPhotos = ref<LightboxPhoto[]>([])
const lightboxIndex = ref<number | null>(null)

function openMilestonePhoto(photos: LightboxPhoto[]) {
  lightboxPhotos.value = photos
  lightboxIndex.value = 0
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
  <section class="mx-auto max-w-3xl px-6 pb-24">
    <h2 class="mb-10 text-center font-heading text-3xl text-text sm:mb-14">Câu Chuyện Của Chúng Tôi</h2>

    <div v-if="loveStory.length === 0" class="py-10 text-center">
      <LotusMotif class="mx-auto h-14 w-14 text-secondary-light" />
      <p class="mt-6 text-text-muted">Câu chuyện tình yêu sẽ sớm được cập nhật.</p>
    </div>

    <ol v-else class="flex flex-col">
      <li
        v-for="(milestone, i) in loveStory"
        :key="milestone.id"
        v-reveal="i * 60"
        class="flex gap-5 sm:gap-7"
      >
        <div class="relative flex shrink-0 flex-col items-center">
          <span
            v-if="i < loveStory.length - 1"
            aria-hidden="true"
            class="love-story-rail absolute left-1/2 top-12 bottom-0 -translate-x-1/2 sm:top-14"
          />
          <span
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm text-primary ring-1 ring-primary/15 transition-all duration-200 hover:bg-primary/20 hover:shadow-[0_0_16px_rgba(219,39,119,0.35)] sm:h-14 sm:w-14 sm:text-base"
          >
            {{ milestone.year }}
          </span>
          <LotusMotif v-if="i < loveStory.length - 1" class="my-2.5 h-6 w-6 shrink-0 text-secondary-light" />
        </div>

        <div class="min-w-0 flex-1 pb-14 sm:pb-20">
          <div
            class="flex flex-row items-center gap-3 sm:gap-6"
            :class="i % 2 === 1 ? 'flex-row-reverse' : ''"
          >
            <button
              v-if="milestone.photos?.length"
              type="button"
              class="focus-ring group relative w-[38%] shrink-0 overflow-hidden rounded-2xl bg-surface shadow-sm transition-shadow duration-300 hover:shadow-md sm:w-[42%]"
              style="aspect-ratio: 4 / 3"
              @click="openMilestonePhoto(milestone.photos)"
            >
              <img
                :src="`/uploads/${milestone.photos[0]!.filename}`"
                :alt="milestone.photos[0]!.caption || milestone.title"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              />
              <span
                v-if="milestone.photos.length > 1"
                class="absolute bottom-2 right-2 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm"
              >
                +{{ milestone.photos.length - 1 }} ảnh
              </span>
            </button>

            <div class="min-w-0 flex-1">
              <h3 class="text-hover font-heading text-xl text-text sm:text-2xl">{{ milestone.title }}</h3>
              <p class="text-hover mt-2 leading-relaxed text-text-muted">{{ milestone.content }}</p>
            </div>
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
/* Đường nối đứt nét giữa các mốc (tham khảo ảnh mẫu + timeline các trang
   AAA) — thay cho đường liền mảnh trước đây, tạo cảm giác "hành trình" mềm
   mại hơn. Dùng `repeating-linear-gradient` vì `border-style: dashed` không
   áp dụng được cho phần tử không có border thật (khối này chỉ có bề rộng
   2px, không phải viền). */
.love-story-rail {
  width: 2px;
  background-image: repeating-linear-gradient(
    to bottom,
    var(--color-secondary-light) 0,
    var(--color-secondary-light) 5px,
    transparent 5px,
    transparent 12px
  );
  opacity: 0.65;
}
</style>
