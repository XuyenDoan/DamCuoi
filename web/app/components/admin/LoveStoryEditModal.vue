<script setup lang="ts">
import type { LightboxPhoto, LoveStoryMilestone } from '../../../server/utils/types'

/**
 * Popup sửa 1 mốc "Câu chuyện tình yêu" — gộp 2 nâng cấp làm cùng 1 bước:
 * thu gọn form dài (mục 5.3) + cho phép nhiều ảnh/mốc với preview + xoá từng
 * ảnh (mục 6). `milestone` là tham chiếu trực tiếp tới phần tử trong mảng
 * `form.loveStory` của trang cha — sửa trực tiếp trên object này để phản ánh
 * ngay vào form ngoài (đúng cách các trường year/title/content đã làm trước
 * khi tách modal), commit thật sự xuống server vẫn qua nút "Lưu thay đổi".
 */
const props = defineProps<{ open: boolean; milestone: LoveStoryMilestone | null }>()
const emit = defineEmits<{ close: [] }>()

const fileInputRef = ref<HTMLInputElement | null>(null)

const uploading = ref(false)
const error = ref('')

function triggerUpload() {
  fileInputRef.value?.click()
}

async function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length === 0 || !props.milestone) return
  error.value = ''
  uploading.value = true

  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))

  try {
    const res = await $fetch<{ photos: LightboxPhoto[] }>('/api/admin/love-story-photo', {
      method: 'POST',
      body: formData
    })
    props.milestone.photos.push(...res.photos)
  } catch (err: unknown) {
    error.value =
      (err as { data?: { statusMessage?: string } })?.data?.statusMessage ||
      'Tải ảnh thất bại, vui lòng thử lại.'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

async function removePhoto(photoId: string) {
  const idx = props.milestone?.photos.findIndex((p) => p.id === photoId) ?? -1
  if (idx === -1) return
  props.milestone?.photos.splice(idx, 1)
  await $fetch(`/api/admin/love-story-photo/${photoId}`, { method: 'DELETE' }).catch(() => {})
}
</script>

<template>
  <AppModal :open="open" aria-label="Chỉnh sửa mốc thời gian" max-width="lg" @close="emit('close')">
    <template #header>
      <p class="font-heading text-lg text-text">Chỉnh sửa mốc thời gian</p>
    </template>

    <div v-if="milestone" class="flex flex-col gap-3">
      <input
        v-model="milestone.year"
        type="text"
        placeholder="Năm (VD: 2020)"
        class="w-32 rounded-lg border border-secondary-light/60 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
      />
      <input
        v-model="milestone.title"
        type="text"
        placeholder="Tiêu đề mốc"
        class="w-full rounded-lg border border-secondary-light/60 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
      />
      <textarea
        v-model="milestone.content"
        rows="3"
        placeholder="Nội dung"
        class="w-full resize-none rounded-lg border border-secondary-light/60 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
      />

      <div class="mt-2 border-t border-secondary-light/30 pt-4">
        <p class="mb-2 text-sm font-medium text-text">Ảnh minh hoạ</p>
        <p v-if="error" role="alert" class="mb-2 text-xs text-error">{{ error }}</p>

        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="photo in milestone.photos"
            :key="photo.id"
            class="group relative aspect-square overflow-hidden rounded-md border border-secondary-light/40"
          >
            <img :src="`/uploads/${photo.filename}`" alt="" class="h-full w-full object-cover" />
            <button
              type="button"
              class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Xoá ảnh này"
              @click="removePhoto(photo.id)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-3.5 w-3.5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            class="flex aspect-square items-center justify-center rounded-md border border-dashed border-secondary-light/60 text-text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            :disabled="uploading"
            @click="triggerUpload"
          >
            <svg v-if="!uploading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-6 w-6">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span v-else class="text-xs">...</span>
          </button>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          class="sr-only"
          aria-label="Chọn ảnh minh hoạ cho mốc này"
          @change="onFilesSelected"
        />
      </div>
    </div>
  </AppModal>
</template>
