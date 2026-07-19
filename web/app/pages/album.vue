<script setup lang="ts">
definePageMeta({ middleware: 'page-visibility' })
useHead({ title: 'Album Ảnh — Album Cưới' })

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
const PAGE_SIZE = 24
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

const downloadAlbumUrl = computed(() => {
  if (activeAlbum.value === 'all') return null
  return `/api/albums/${activeAlbum.value}/download`
})
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
          class="min-h-11 rounded-full border px-5 text-sm font-medium transition-colors"
          :class="
            activeAlbum === 'all'
              ? 'border-primary bg-primary text-white'
              : 'border-secondary-light text-text hover:bg-surface'
          "
          @click="activeAlbum = 'all'"
        >
          Tất cả
        </button>
        <button
          v-for="album in albumsWithPhotos"
          :key="album.id"
          type="button"
          class="min-h-11 rounded-full border px-5 text-sm font-medium transition-colors"
          :class="
            activeAlbum === album.id
              ? 'border-primary bg-primary text-white'
              : 'border-secondary-light text-text hover:bg-surface'
          "
          @click="activeAlbum = album.id"
        >
          {{ album.name }}
        </button>
      </div>

      <div v-if="downloadAlbumUrl" class="mt-4 flex justify-center">
        <a :href="downloadAlbumUrl" class="btn-outline">Tải toàn bộ Album</a>
      </div>
    </section>

    <section class="px-4 pb-24 sm:px-6">
      <div v-if="filteredPhotos.length === 0" class="mx-auto max-w-md py-20 text-center">
        <LotusMotif class="mx-auto h-16 w-16 text-secondary-light" />
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
              class="group block w-full overflow-hidden rounded-lg transition-shadow duration-300 hover:shadow-xl"
              @click="openLightbox(pagedPhotos.indexOf(photo))"
            >
              <img
                :src="`/uploads/${photo.thumbnail}`"
                :width="photo.width"
                :height="photo.height"
                :alt="photo.caption || 'Ảnh cưới'"
                loading="lazy"
                class="h-auto w-full rounded-lg object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
            </button>
          </div>
        </div>
      </Transition>

      <PhotoPager v-model:page="page" :total-pages="totalPages" />
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
