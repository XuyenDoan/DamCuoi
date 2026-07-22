<script setup lang="ts">
definePageMeta({ middleware: 'page-visibility' })
useHead({ title: 'Album Ảnh — Album Cưới' })

const theme = useWebsiteTheme()

const { data: albums } = useAlbums()
const { data: photos } = usePublishedPhotos()

const activeAlbum = ref('all')

const filteredPhotos = computed(() => {
  const list = photos.value ?? []
  if (activeAlbum.value === 'all') return list
  return list.filter((p) => p.albumId === activeAlbum.value)
})

// Phân trang phía client — toàn bộ ảnh đã published fetch 1 lần qua
// usePublishedPhotos() (metadata nhẹ, không phải file ảnh), quy mô ảnh cưới
// cá nhân không cần round-trip server mỗi lần đổi trang.
// PAGE_SIZE giảm từ 24 xuống 12 (phản hồi thật: "số lượng ảnh/trang nhiều
// quá, giảm cho giống chuẩn web AAA") — các trang giao ảnh cưới cao cấp
// (Pixieset, ShootProof...) thường hiện 1 lượng ảnh vừa đủ để xem kỹ từng
// tấm mỗi trang thay vì dồn quá nhiều gây rối mắt/cuộn dài. 12 cũng chia
// hết cho cả 3 mức cột (2/3/4 ở mobile/tablet/desktop — `useColumnCount`)
// nên hàng cuối luôn đều, không lệch cột.
const PAGE_SIZE = 12
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredPhotos.value.length / PAGE_SIZE)))
const pagedPhotos = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filteredPhotos.value.slice(start, start + PAGE_SIZE)
})

const columnCount = useColumnCount()
const masonryColumns = useMasonryColumns(pagedPhotos, columnCount)

// Chỉ hiện tab của những album thực sự có ảnh đã duyệt — tránh tab rỗng gây nhầm lẫn
const albumsWithPhotos = computed(() => {
  const list = albums.value ?? []
  const publishedAlbumIds = new Set((photos.value ?? []).map((p) => p.albumId))
  return list.filter((a) => publishedAlbumIds.has(a.id))
})

const lightboxIndex = ref<number | null>(null)
function openLightbox(i: number) {
  lightboxIndex.value = i
}
function closeLightbox() {
  lightboxIndex.value = null
}
function nextPhoto() {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value + 1) % pagedPhotos.value.length
}
function prevPhoto() {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value - 1 + pagedPhotos.value.length) % pagedPhotos.value.length
}

// Đóng lightbox + về trang 1 nếu đổi tab album khi đang mở (tránh lệch index)
watch(activeAlbum, () => {
  lightboxIndex.value = null
  page.value = 1
})

/**
 * Hình dạng tab lọc album + khung ảnh đổi theo theme (spec.md mục 36) —
 * DATA/logic lọc-phân trang-lightbox ở trên dùng CHUNG cho cả 3 theme,
 * chỉ lớp trình bày này khác (tránh nhân bản cả trang chỉ vì khác giao
 * diện). Editorial: gạch chân thay vì pill, không bo góc. Cinematic: pill
 * viền hổ phách kiểu vé xem phim, khung ảnh viền mảnh phát sáng khi hover.
 */
function tabClass(active: boolean): string {
  if (theme.value === 'editorial') {
    return active
      ? 'border-b-2 border-secondary px-1 pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-secondary'
      : 'border-b-2 border-transparent px-1 pb-1 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted hover:text-secondary'
  }
  if (theme.value === 'cinematic') {
    return active
      ? 'rounded-full border border-primary bg-primary/15 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-primary'
      : 'rounded-full border border-text-muted/30 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted hover:border-primary hover:text-primary'
  }
  return active
    ? 'rounded-full border border-primary bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90'
    : 'rounded-full border border-secondary-light px-5 text-sm font-medium text-text hover:bg-surface'
}

function tileClass(): string {
  if (theme.value === 'editorial') return 'overflow-hidden'
  if (theme.value === 'cinematic') return 'overflow-hidden rounded-sm border border-text/10 transition-colors duration-200 hover:border-primary/70'
  return 'overflow-hidden rounded-lg transition-shadow duration-200 hover:shadow-lg'
}

function imageClass(): string {
  if (theme.value === 'editorial') return 'h-auto w-full grayscale transition-all duration-300 ease-out group-hover:grayscale-0'
  if (theme.value === 'cinematic') return 'h-auto w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]'
  return 'h-auto w-full rounded-lg transition-transform duration-200 ease-out group-hover:scale-[1.03]'
}
</script>

<template>
  <div class="relative overflow-hidden">
    <section class="relative overflow-hidden px-6 pb-8 pt-32 text-center sm:pt-40">
      <h1 v-reveal="0" class="font-heading text-4xl text-text sm:text-5xl">Album Ảnh</h1>
      <p v-reveal="80" class="mx-auto mt-3 max-w-xl text-text-muted">
        Những khoảnh khắc đáng nhớ trong ngày trọng đại — chạm vào ảnh để xem lớn hơn.
      </p>
    </section>

    <section class="px-4 pb-4 sm:px-6">
      <div class="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          class="focus-ring min-h-11 transition-all duration-200 active:scale-[0.98]"
          :class="tabClass(activeAlbum === 'all')"
          @click="activeAlbum = 'all'"
        >
          Tất cả
        </button>
        <button
          v-for="album in albumsWithPhotos"
          :key="album.id"
          type="button"
          class="focus-ring min-h-11 transition-all duration-200 active:scale-[0.98]"
          :class="tabClass(activeAlbum === album.id)"
          @click="activeAlbum = album.id"
        >
          {{ album.name }}
        </button>
      </div>
    </section>

    <section class="px-4 pb-24 sm:px-6">
      <div v-if="filteredPhotos.length === 0" class="mx-auto max-w-md py-20 text-center">
        <LotusMotif v-if="theme === 'default'" class="mx-auto h-16 w-16 text-secondary-light" />
        <p class="mt-6 text-text-muted">
          Album đang được cập nhật, quay lại sau nhé! Ảnh cưới sẽ sớm xuất hiện ở đây.
        </p>
      </div>

      <Transition name="page-swap" mode="out-in">
        <div :key="page" class="mx-auto flex max-w-6xl gap-3 sm:gap-4">
          <div v-for="(column, ci) in masonryColumns" :key="ci" class="flex flex-1 flex-col gap-3 sm:gap-4">
            <button
              v-for="photo in column"
              :key="photo.id"
              v-reveal="(pagedPhotos.indexOf(photo) % 12) * 40"
              type="button"
              class="focus-ring group block w-full"
              :class="tileClass()"
              @click="openLightbox(pagedPhotos.indexOf(photo))"
            >
              <img
                :src="`/uploads/${photo.thumbnail}`"
                :width="photo.width"
                :height="photo.height"
                :alt="photo.caption || 'Ảnh cưới'"
                loading="lazy"
                :class="imageClass()"
              />
            </button>
          </div>
        </div>
      </Transition>

      <PhotoPager v-model:page="page" :total-pages="totalPages" aria-label="Phân trang album ảnh" />
    </section>

    <PhotoLightbox
      :photos="pagedPhotos"
      :index="lightboxIndex"
      @close="closeLightbox"
      @next="nextPhoto"
      @prev="prevPhoto"
    />
  </div>
</template>

<style scoped>
.page-swap-enter-active,
.page-swap-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}
.page-swap-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-swap-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (prefers-reduced-motion: reduce) {
  .page-swap-enter-active,
  .page-swap-leave-active {
    transition: none;
  }
}
</style>
