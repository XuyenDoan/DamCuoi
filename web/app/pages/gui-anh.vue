<script setup lang="ts">
definePageMeta({ middleware: 'page-visibility' })
useHead({ title: 'Gửi Ảnh — Album Cưới' })

const MAX_FILE_SIZE = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILES = 20

interface QueuedFile {
  file: File
  status: 'ready' | 'uploading' | 'success' | 'error'
  message?: string
}

const name = ref('')
const queue = ref<QueuedFile[]>([])
const isDragOver = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const successCount = ref(0)
const fileInputRef = ref<HTMLInputElement | null>(null)

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

function addFiles(fileList: FileList | null) {
  if (!fileList) return
  submitError.value = ''

  const remainingSlots = MAX_FILES - queue.value.length
  if (remainingSlots <= 0) {
    submitError.value = `Chỉ được chọn tối đa ${MAX_FILES} ảnh mỗi lần gửi.`
    return
  }

  const incoming = Array.from(fileList).slice(0, remainingSlots)
  for (const file of incoming) {
    if (!ALLOWED_TYPES.has(file.type)) {
      queue.value.push({
        file,
        status: 'error',
        message: 'Định dạng không hỗ trợ (chỉ nhận JPG, PNG, WEBP)'
      })
      continue
    }
    if (file.size > MAX_FILE_SIZE) {
      queue.value.push({
        file,
        status: 'error',
        message: `Ảnh vượt quá 15MB (hiện ${formatSize(file.size)}), vui lòng chọn ảnh nhỏ hơn`
      })
      continue
    }
    queue.value.push({ file, status: 'ready' })
  }
}

function removeFile(index: number) {
  queue.value.splice(index, 1)
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  addFiles(e.dataTransfer?.files ?? null)
}

function onFileInputChange(e: Event) {
  addFiles((e.target as HTMLInputElement).files)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const readyFiles = computed(() => queue.value.filter((q) => q.status === 'ready'))
const canSubmit = computed(() => readyFiles.value.length > 0 && !isSubmitting.value)

async function submitUpload() {
  if (!canSubmit.value) return
  isSubmitting.value = true
  submitError.value = ''

  const toUpload = queue.value.filter((q) => q.status === 'ready')
  toUpload.forEach((q) => (q.status = 'uploading'))

  const formData = new FormData()
  formData.append('name', name.value)
  for (const q of toUpload) formData.append('files', q.file)

  try {
    const res = await $fetch<{ results: Array<{ originalName: string; status: string; message?: string }> }>(
      '/api/upload',
      { method: 'POST', body: formData }
    )

    let succeeded = 0
    for (const q of toUpload) {
      const result = res.results.find((r) => r.originalName === q.file.name)
      if (result?.status === 'success') {
        q.status = 'success'
        succeeded++
      } else {
        q.status = 'error'
        q.message = result?.message || 'Gửi thất bại, vui lòng thử lại'
      }
    }
    successCount.value += succeeded
  } catch {
    toUpload.forEach((q) => {
      q.status = 'error'
      q.message = 'Không kết nối được máy chủ, vui lòng thử lại'
    })
    submitError.value = 'Có lỗi khi gửi ảnh. Vui lòng kiểm tra kết nối mạng và thử lại.'
  } finally {
    isSubmitting.value = false
    queue.value = queue.value.filter((q) => q.status !== 'success')
  }
}
</script>

<template>
  <div class="relative overflow-hidden">
    <section class="relative overflow-hidden px-6 pb-8 pt-32 text-center sm:pt-40">
      <h1 v-reveal="0" class="font-heading text-4xl text-text sm:text-5xl">Gửi Ảnh Cho Cô Dâu Chú Rể</h1>
      <p v-reveal="80" class="mx-auto mt-3 max-w-xl text-text-muted">
        Bạn có ảnh đẹp chụp cùng tại tiệc cưới? Gửi ngay để chúng tôi lưu giữ nhé! Ảnh sẽ hiển thị
        công khai sau khi được duyệt.
      </p>
    </section>

    <section class="mx-auto max-w-xl px-6 pb-24">
      <div v-if="successCount > 0" class="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
        Đã gửi thành công {{ successCount }} ảnh — cảm ơn bạn! Ảnh sẽ xuất hiện trong Album sau khi được duyệt.
      </div>

      <form @submit.prevent="submitUpload">
        <label class="mb-2 block text-sm font-medium text-text" for="uploader-name">
          Tên của bạn (không bắt buộc)
        </label>
        <input
          id="uploader-name"
          v-model="name"
          type="text"
          placeholder="VD: Gia đình cô Lan"
          class="mb-6 w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-base text-text placeholder:text-text-muted/60 transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          style="min-height: 44px"
        />

        <div
          class="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors"
          :class="isDragOver ? 'border-primary bg-surface' : 'border-secondary-light/60'"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="onDrop"
        >
          <LotusMotif class="h-10 w-10 text-secondary-light" />
          <p class="text-sm text-text-muted">Kéo-thả ảnh vào đây, hoặc</p>
          <button type="button" class="btn-outline" @click="fileInputRef?.click()">
            Chọn ảnh từ thiết bị
          </button>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            class="sr-only"
            aria-label="Chọn ảnh để gửi"
            @change="onFileInputChange"
          />
          <p class="text-xs text-text-muted/70">Mỗi ảnh tối đa 15MB — định dạng JPG, PNG hoặc WEBP</p>
        </div>

        <ul v-if="queue.length > 0" class="mt-6 flex flex-col gap-2">
          <li
            v-for="(item, i) in queue"
            :key="`${item.file.name}-${i}`"
            class="flex items-center justify-between gap-3 rounded-lg border border-secondary-light/40 px-4 py-3"
          >
            <div class="min-w-0">
              <p class="truncate text-sm text-text">{{ item.file.name }}</p>
              <p
                class="text-xs"
                :class="{
                  'text-text-muted': item.status === 'ready',
                  'text-secondary': item.status === 'uploading',
                  'text-success': item.status === 'success',
                  'text-error': item.status === 'error'
                }"
              >
                <template v-if="item.status === 'ready'">Sẵn sàng gửi ({{ formatSize(item.file.size) }})</template>
                <template v-else-if="item.status === 'uploading'">Đang tải lên...</template>
                <template v-else-if="item.status === 'success'">Đã gửi thành công</template>
                <template v-else-if="item.status === 'error'">{{ item.message }}</template>
              </p>
            </div>
            <button
              v-if="item.status === 'ready' || item.status === 'error'"
              type="button"
              class="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors duration-200 hover:bg-error/10 hover:text-error"
              aria-label="Bỏ ảnh này"
              @click="removeFile(i)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-5 w-5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </li>
        </ul>

        <p v-if="submitError" role="alert" class="mt-4 text-sm text-error">{{ submitError }}</p>

        <button type="submit" class="btn-primary mt-6 w-full" :disabled="!canSubmit">
          <template v-if="isSubmitting">Đang gửi...</template>
          <template v-else-if="readyFiles.length > 0">Gửi {{ readyFiles.length }} Ảnh</template>
          <template v-else>Gửi Ảnh</template>
        </button>
      </form>
    </section>
  </div>
</template>
