<script setup lang="ts">
/**
 * 1 ô upload/xoá cho 1 ảnh cố định của trang chủ (`shared/siteImages.ts`) —
 * dùng lặp lại 3 lần trong `admin/noi-dung.vue` thay vì lặp markup. Cùng mẫu
 * UI với `PageBackgroundEditModal.vue` nhưng đặt TRỰC TIẾP trong trang (không
 * cần mở popup) vì chỉ có 2 hành động (tải lên/xoá), không có tuỳ chọn ẩn/
 * hiện như ảnh nền từng trang.
 */
const props = defineProps<{
  label: string
  description: string
  image: string | null
  uploading: boolean
  error: string
}>()

const emit = defineEmits<{ upload: [file: File]; remove: [] }>()

const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerUpload() {
  fileInputRef.value?.click()
}
function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('upload', file)
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="rounded-lg border border-secondary-light/30 bg-surface p-3">
    <div class="flex items-center gap-3">
      <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-secondary-light/40 bg-bg">
        <img v-if="image" :src="`/uploads/${image}`" alt="" class="h-full w-full object-cover" />
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-6 w-6 text-secondary-light">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10" r="1.5" />
          <path d="M21 16l-5-5-4 4-3-3-5 5" />
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-text">{{ label }}</p>
        <p class="text-xs text-text-muted">{{ description }}</p>
      </div>
    </div>

    <p v-if="error" role="alert" class="mt-2 text-xs text-error">{{ error }}</p>

    <div class="mt-3 flex gap-2">
      <button type="button" class="btn-outline flex-1 px-4 py-2 text-sm" :disabled="uploading" @click="triggerUpload">
        {{ uploading ? 'Đang tải...' : image ? 'Đổi ảnh' : 'Tải ảnh lên' }}
      </button>
      <button
        v-if="image"
        type="button"
        class="focus-ring rounded-full border border-error px-4 py-2 text-sm font-medium text-error transition-colors duration-200 hover:bg-error hover:text-white disabled:pointer-events-none disabled:opacity-50"
        :disabled="uploading"
        @click="emit('remove')"
      >
        Xoá
      </button>
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="sr-only"
        :aria-label="`Chọn ${label}`"
        @change="onFileSelected"
      />
    </div>
  </div>
</template>
