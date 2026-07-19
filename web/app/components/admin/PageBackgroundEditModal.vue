<script setup lang="ts">
import type { ManagedPage } from '../../../shared/pages'

const props = defineProps<{
  page: ManagedPage
  background: string | null
  uploading: boolean
  error: string
  hidden: boolean
}>()

const emit = defineEmits<{
  upload: [file: File]
  remove: []
  'update:hidden': [value: boolean]
  close: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const isOpen = ref(true)
useFocusTrap(isOpen, dialogRef, closeButtonRef, { onEscape: () => emit('close') })

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
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="emit('close')">
      <div
        ref="dialogRef"
        role="dialog"
        aria-modal="true"
        :aria-label="`Chỉnh sửa ${page.label}`"
        class="w-full max-w-md rounded-xl border border-secondary-light/40 bg-bg p-6 shadow-lg"
      >
        <div class="mb-4 flex items-center justify-between">
          <p class="font-heading text-lg text-text">{{ page.label }}</p>
          <button
            ref="closeButtonRef"
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text"
            aria-label="Đóng"
            @click="emit('close')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div class="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-secondary-light/40 bg-surface">
          <img v-if="background" :src="`/uploads/${background}`" alt="" class="h-full w-full object-cover" />
          <LotusMotif v-else class="h-12 w-12 text-primary-light" />
        </div>
        <p class="mt-2 text-xs text-text-muted">
          {{ background ? 'Đang dùng ảnh riêng' : 'Đang hiện hoạ tiết hoa sen thay cho ảnh' }}
        </p>
        <p v-if="error" role="alert" class="mt-1 text-xs text-error">{{ error }}</p>

        <div class="mt-4 flex gap-2">
          <button type="button" class="btn-outline flex-1 px-4 py-2 text-sm" :disabled="uploading" @click="triggerUpload">
            {{ uploading ? 'Đang tải...' : background ? 'Đổi ảnh' : 'Tải ảnh lên' }}
          </button>
          <button
            v-if="background"
            type="button"
            class="rounded-full border border-error px-4 py-2 text-sm font-medium text-error disabled:opacity-50"
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
            :aria-label="`Chọn ảnh nền cho ${page.label}`"
            @change="onFileSelected"
          />
        </div>

        <div v-if="page.key !== 'home'" class="mt-6 flex items-center justify-between border-t border-secondary-light/30 pt-4">
          <div>
            <p class="text-sm font-medium text-text">Hiển thị trang này trên website</p>
            <p class="text-xs text-text-muted">Tắt sẽ ẩn khỏi menu và chặn truy cập trực tiếp</p>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="!hidden"
            class="relative h-7 w-12 shrink-0 rounded-full transition-colors"
            :class="hidden ? 'bg-secondary-light/40' : 'bg-primary'"
            @click="emit('update:hidden', !hidden)"
          >
            <span
              class="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform"
              :class="hidden ? 'translate-x-0.5' : 'translate-x-5'"
            />
          </button>
        </div>
        <p v-else class="mt-6 border-t border-secondary-light/30 pt-4 text-xs text-text-muted">
          Trang chủ luôn hiển thị.
        </p>
      </div>
    </div>
  </Teleport>
</template>
