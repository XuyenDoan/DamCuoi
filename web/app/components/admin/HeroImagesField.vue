<script setup lang="ts">
/**
 * Quản lý NHIỀU ảnh carousel đầu trang chủ (spec.md mục 40) — thay cho ô 1
 * ảnh cố định trước đây (`SiteImageField.vue`, vẫn dùng nguyên cho 2 ảnh
 * chân dung cô dâu/chú rể). Cùng ngôn ngữ UI lưới ảnh + nút xoá góc của
 * `LoveStoryEditModal.vue` (ảnh minh hoạ mốc thời gian), bổ sung 2 nút
 * lên/xuống trên mỗi ảnh để sắp thứ tự hiển thị trong carousel — dự án chưa
 * có thư viện kéo-thả, dùng đúng mẫu nút lên/xuống đã có sẵn ở
 * `moveMilestone()` cho nhất quán thay vì thêm phụ thuộc mới.
 */
const props = defineProps<{
  images: string[]
  uploading: boolean
  error: string
}>()

const emit = defineEmits<{
  upload: [files: File[]]
  remove: [index: number]
  move: [index: number, direction: -1 | 1]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerUpload() {
  fileInputRef.value?.click()
}
function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length > 0) emit('upload', files)
  input.value = ''
}
</script>

<template>
  <div>
    <p v-if="error" role="alert" class="mb-2 text-xs text-error">{{ error }}</p>

    <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
      <div
        v-for="(image, i) in images"
        :key="image"
        class="group relative aspect-[4/3] overflow-hidden rounded-md border border-secondary-light/40"
      >
        <img :src="`/uploads/${image}`" alt="" class="h-full w-full object-cover" />

        <span
          class="absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white"
        >
          {{ i + 1 }}
        </span>

        <button
          type="button"
          class="focus-ring-dark absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-all duration-200 hover:bg-black/80 group-hover:opacity-100 focus-visible:opacity-100"
          aria-label="Xoá ảnh này"
          @click="emit('remove', i)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-3.5 w-3.5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div class="absolute bottom-1 right-1 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            class="focus-ring-dark flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-200 hover:bg-black/80 disabled:pointer-events-none disabled:opacity-40"
            :disabled="i === 0"
            aria-label="Đưa ảnh này lên trước"
            @click="emit('move', i, -1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
              <path d="M6 15l6-6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            class="focus-ring-dark flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-200 hover:bg-black/80 disabled:pointer-events-none disabled:opacity-40"
            :disabled="i === images.length - 1"
            aria-label="Đưa ảnh này xuống sau"
            @click="emit('move', i, 1)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      <button
        type="button"
        class="focus-ring flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-secondary-light/60 text-text-muted transition-colors duration-200 hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        :disabled="uploading"
        @click="triggerUpload"
      >
        <svg v-if="!uploading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-6 w-6">
          <path d="M12 5v14M5 12h14" />
        </svg>
        <span class="text-xs">{{ uploading ? 'Đang tải...' : 'Thêm ảnh' }}</span>
      </button>
    </div>
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp"
      class="sr-only"
      aria-label="Chọn ảnh cho carousel đầu trang chủ"
      @change="onFilesSelected"
    />
  </div>
</template>
