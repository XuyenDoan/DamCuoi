<script setup lang="ts">
import type { Photo } from '../../../server/utils/types'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Quản Lý Ảnh — Quản Trị' })

const { data: albums } = await useAlbums()
// useRequestFetch() bắt buộc dùng ở đây: useAsyncData chạy trong SSR, còn $fetch
// trơn không tự chuyển cookie phiên đăng nhập của request gốc sang API nội bộ.
const requestFetch = useRequestFetch()
const { data: allPhotos, refresh: refreshPhotos } = await useAsyncData<Photo[]>('admin-photos', () =>
  requestFetch('/api/admin/photos')
)

const pendingPhotos = computed(() => (allPhotos.value ?? []).filter((p) => p.status === 'pending'))
const publishedPhotos = computed(() =>
  (allPhotos.value ?? []).filter((p) => p.status === 'published')
)

const filterAlbum = ref('all')
const visiblePublished = computed(() => {
  if (filterAlbum.value === 'all') return publishedPhotos.value
  return publishedPhotos.value.filter((p) => p.albumId === filterAlbum.value)
})

function albumName(id: string) {
  return albums.value?.find((a) => a.id === id)?.name ?? id
}

// ---- Upload trực tiếp (admin) ----
const uploadAlbumId = ref(albums.value?.[0]?.id ?? '')
const uploadFiles = ref<File[]>([])
const uploadInputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadMessage = ref('')

function onUploadFilesChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  uploadFiles.value = files ? Array.from(files) : []
}

async function submitUpload() {
  if (uploadFiles.value.length === 0 || !uploadAlbumId.value) return
  isUploading.value = true
  uploadMessage.value = ''
  const formData = new FormData()
  formData.append('albumId', uploadAlbumId.value)
  for (const f of uploadFiles.value) formData.append('files', f)

  try {
    const res = await $fetch<{ results: Array<{ status: string }> }>('/api/admin/photos', {
      method: 'POST',
      body: formData
    })
    const successCount = res.results.filter((r) => r.status === 'success').length
    uploadMessage.value = `Đã tải lên ${successCount}/${res.results.length} ảnh thành công.`
    uploadFiles.value = []
    if (uploadInputRef.value) uploadInputRef.value.value = ''
    await refreshPhotos()
  } catch (err: unknown) {
    uploadMessage.value =
      (err as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Tải ảnh lên thất bại.'
  } finally {
    isUploading.value = false
  }
}

// ---- Duyệt / Từ chối ảnh khách gửi ----
const processingId = ref<string | null>(null)

async function approvePhoto(photo: Photo) {
  processingId.value = photo.id
  try {
    await $fetch(`/api/admin/photos/${photo.id}/approve`, { method: 'POST' })
    await refreshPhotos()
  } finally {
    processingId.value = null
  }
}

async function rejectPhoto(photo: Photo) {
  if (!confirm('Từ chối và xoá ảnh này? Hành động không thể hoàn tác.')) return
  processingId.value = photo.id
  try {
    await $fetch(`/api/admin/photos/${photo.id}/reject`, { method: 'POST' })
    await refreshPhotos()
  } finally {
    processingId.value = null
  }
}

// ---- Sửa caption / album ----
const captionDrafts = ref<Record<string, string>>({})
function captionFor(photo: Photo) {
  return captionDrafts.value[photo.id] ?? photo.caption
}
async function saveCaption(photo: Photo) {
  const value = captionDrafts.value[photo.id]
  if (value === undefined || value === photo.caption) return
  await $fetch(`/api/admin/photos/${photo.id}`, { method: 'PATCH', body: { caption: value } })
  await refreshPhotos()
}
async function changeAlbum(photo: Photo, e: Event) {
  const albumId = (e.target as HTMLSelectElement).value
  await $fetch(`/api/admin/photos/${photo.id}`, { method: 'PATCH', body: { albumId } })
  await refreshPhotos()
}

// ---- Sắp xếp thứ tự (nút lên/xuống trong cùng album) ----
async function moveOrder(photo: Photo, direction: -1 | 1) {
  const siblings = publishedPhotos.value
    .filter((p) => p.albumId === photo.albumId)
    .sort((a, b) => a.order - b.order)
  const idx = siblings.findIndex((p) => p.id === photo.id)
  const targetIdx = idx + direction
  if (targetIdx < 0 || targetIdx >= siblings.length) return
  const target = siblings[targetIdx]
  if (!target) return

  await Promise.all([
    $fetch(`/api/admin/photos/${photo.id}`, { method: 'PATCH', body: { order: target.order } }),
    $fetch(`/api/admin/photos/${target.id}`, { method: 'PATCH', body: { order: photo.order } })
  ])
  await refreshPhotos()
}

// ---- Xoá ảnh ----
async function deletePhoto(photo: Photo) {
  if (!confirm('Xoá ảnh này vĩnh viễn? Hành động không thể hoàn tác.')) return
  await $fetch(`/api/admin/photos/${photo.id}`, { method: 'DELETE' })
  await refreshPhotos()
}
</script>

<template>
  <div>
    <AdminTopbar title="Quản lý ảnh" />

    <div class="mx-auto max-w-5xl px-6 py-10">
      <!-- Ảnh chờ duyệt -->
      <section v-if="pendingPhotos.length > 0" class="mb-12">
        <h2 class="mb-1 font-heading text-2xl text-text">Ảnh Chờ Duyệt</h2>
        <p class="mb-4 text-sm text-text-muted">
          Khách mời đã gửi {{ pendingPhotos.length }} ảnh — duyệt để hiển thị công khai trong Album.
        </p>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div
            v-for="photo in pendingPhotos"
            :key="photo.id"
            class="overflow-hidden rounded-lg border border-secondary-light/40"
          >
            <img
              :src="`/api/admin/photo-preview/${photo.id}`"
              :alt="`Ảnh chờ duyệt từ ${photo.uploadedBy}`"
              class="h-48 w-full object-cover"
            />
            <div class="p-3">
              <p class="mb-2 truncate text-sm text-text-muted">Gửi bởi: {{ photo.uploadedBy }}</p>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="focus-ring flex-1 rounded-lg bg-success px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-success/90 disabled:pointer-events-none disabled:opacity-50"
                  :disabled="processingId === photo.id"
                  @click="approvePhoto(photo)"
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  class="focus-ring flex-1 rounded-lg border border-error px-3 py-2 text-sm font-medium text-error transition-colors duration-200 hover:bg-error hover:text-white disabled:pointer-events-none disabled:opacity-50"
                  :disabled="processingId === photo.id"
                  @click="rejectPhoto(photo)"
                >
                  Từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Upload trực tiếp -->
      <section class="mb-12 rounded-xl border border-secondary-light/40 p-6">
        <h2 class="mb-4 font-heading text-xl text-text">Tải Ảnh Lên</h2>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div class="flex-1">
            <label for="upload-album" class="mb-2 block text-sm font-medium text-text">Album</label>
            <select
              id="upload-album"
              v-model="uploadAlbumId"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              style="min-height: 44px"
            >
              <option v-for="album in albums" :key="album.id" :value="album.id">
                {{ album.name }}
              </option>
            </select>
          </div>
          <div class="flex-1">
            <label for="upload-files" class="mb-2 block text-sm font-medium text-text">Chọn ảnh</label>
            <input
              id="upload-files"
              ref="uploadInputRef"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              class="w-full text-sm text-text"
              @change="onUploadFilesChange"
            />
          </div>
          <button
            type="button"
            class="btn-primary"
            :disabled="uploadFiles.length === 0 || isUploading"
            @click="submitUpload"
          >
            {{ isUploading ? 'Đang tải...' : `Tải lên (${uploadFiles.length})` }}
          </button>
        </div>
        <p v-if="uploadMessage" class="mt-3 text-sm text-text-muted">{{ uploadMessage }}</p>
      </section>

      <!-- Tất cả ảnh -->
      <section>
        <p class="mb-3 text-sm text-text-muted">
          Muốn đổi ảnh bìa trang chủ? Vào
          <NuxtLink
            to="/admin/noi-dung"
            class="focus-ring rounded-sm text-secondary underline underline-offset-2 transition-colors duration-200 hover:text-primary"
            >Nội dung trang</NuxtLink
          >
          → mục "Trang bìa".
        </p>
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="font-heading text-xl text-text">Tất Cả Ảnh ({{ publishedPhotos.length }})</h2>
          <select
            v-model="filterAlbum"
            class="rounded-lg border border-secondary-light/60 px-3 py-2 text-sm text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">Tất cả album</option>
            <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.name }}</option>
          </select>
        </div>

        <div v-if="visiblePublished.length === 0" class="py-10 text-center text-text-muted">
          Chưa có ảnh nào trong mục này.
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="photo in visiblePublished"
            :key="photo.id"
            class="overflow-hidden rounded-lg border border-secondary-light/40"
          >
            <div class="relative">
              <img :src="`/uploads/${photo.thumbnail}`" :alt="photo.caption || 'Ảnh cưới'" class="h-48 w-full object-cover" />
            </div>
            <div class="flex flex-col gap-2 p-3">
              <input
                :value="captionFor(photo)"
                type="text"
                placeholder="Chú thích ảnh..."
                class="w-full rounded-md border border-secondary-light/50 px-2 py-1.5 text-sm text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                @input="captionDrafts[photo.id] = ($event.target as HTMLInputElement).value"
                @blur="saveCaption(photo)"
              />
              <select
                :value="photo.albumId"
                class="w-full rounded-md border border-secondary-light/50 px-2 py-1.5 text-sm text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                @change="changeAlbum(photo, $event)"
              >
                <option v-for="album in albums" :key="album.id" :value="album.id">{{ album.name }}</option>
              </select>
              <div class="flex items-center justify-between gap-1">
                <div class="flex gap-1">
                  <button
                    type="button"
                    class="focus-ring flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors duration-200 hover:bg-surface"
                    aria-label="Đưa ảnh lên trước"
                    @click="moveOrder(photo, -1)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    type="button"
                    class="focus-ring flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors duration-200 hover:bg-surface"
                    aria-label="Đưa ảnh xuống sau"
                    @click="moveOrder(photo, 1)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                </div>
                <div class="flex gap-1">
                  <button
                    type="button"
                    class="focus-ring flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors duration-200 hover:bg-error/10 hover:text-error"
                    aria-label="Xoá ảnh"
                    @click="deletePhoto(photo)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
