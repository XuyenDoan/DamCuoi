<script setup lang="ts">
import type { ManagedPage } from '#shared/pages'

const props = defineProps<{
  open: boolean
  page: ManagedPage | null
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
  <AppModal
    :open="open"
    :aria-label="page ? `Chỉnh sửa ${page.label}` : 'Chỉnh sửa trang'"
    :scrollable="false"
    @close="emit('close')"
  >
    <template #header>
      <p class="font-heading text-lg text-text">{{ page?.label }}</p>
    </template>

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
        :aria-label="`Chọn ảnh nền cho ${page?.label}`"
        @change="onFileSelected"
      />
    </div>

    <!-- Hàng bật/tắt hiển thị — trước đây dùng `flex items-center justify-between`
         không có `gap`/`min-w-0`, khiến nút gạt luôn nằm SÁT mép popup chỉ ~1px
         (đúng ngay góc bo tròn của thẻ) trên mọi kích thước màn hình, trông như
         tràn ra ngoài và khó bấm chính xác (đo thực tế bằng getBoundingClientRect,
         xác nhận lỗi thật — phát hiện khi rà soát responsive). Khắc phục: thêm
         `gap-4` tường minh + `min-w-0` cho khối chữ để nó tự co đúng cách thay vì
         luôn đẩy nút gạt sát mép; đồng thời bọc nút gạt trong vùng chạm 44×44px
         (trước đây chỉ cao 28px, dưới chuẩn tối thiểu của dự án — checklist 17.3). -->
    <div v-if="page && page.key !== 'home'" class="mt-6 flex items-start justify-between gap-4 border-t border-secondary-light/30 pt-4">
      <div class="min-w-0">
        <p class="text-sm font-medium text-text">Hiển thị trang này trên website</p>
        <p class="mt-0.5 text-xs text-text-muted">Tắt sẽ ẩn khỏi menu và chặn truy cập trực tiếp</p>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="!hidden"
        :aria-label="hidden ? `Đang ẩn ${page.label} — bấm để hiện lại` : `Đang hiển thị ${page.label} — bấm để ẩn`"
        class="flex h-11 w-14 shrink-0 items-center justify-center"
        @click="emit('update:hidden', !hidden)"
      >
        <span
          class="relative h-7 w-12 rounded-full transition-colors"
          :class="hidden ? 'bg-secondary-light/40' : 'bg-primary'"
        >
          <span
            class="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform"
            :class="hidden ? 'translate-x-0.5' : 'translate-x-5'"
          />
        </span>
      </button>
    </div>
    <p v-else-if="page" class="mt-6 border-t border-secondary-light/30 pt-4 text-xs text-text-muted">
      Trang chủ luôn hiển thị.
    </p>
  </AppModal>
</template>
