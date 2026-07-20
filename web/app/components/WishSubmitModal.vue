<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; submitted: [] }>()

const name = ref('')
const message = ref('')
const photoFile = ref<File | null>(null)
const photoInputRef = ref<HTMLInputElement | null>(null)
const isSubmitting = ref(false)
const submitError = ref('')

const MAX_FILE_SIZE = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function onPhotoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  submitError.value = ''
  if (!file) {
    photoFile.value = null
    return
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    submitError.value = 'Ảnh đính kèm không đúng định dạng (chỉ nhận JPG, PNG, WEBP)'
    if (photoInputRef.value) photoInputRef.value.value = ''
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    submitError.value = 'Ảnh đính kèm vượt quá 15MB, vui lòng chọn ảnh nhỏ hơn'
    if (photoInputRef.value) photoInputRef.value.value = ''
    return
  }
  photoFile.value = file
}

function removePhoto() {
  photoFile.value = null
  if (photoInputRef.value) photoInputRef.value.value = ''
}

function resetForm() {
  name.value = ''
  message.value = ''
  removePhoto()
  submitError.value = ''
}

const canSubmit = computed(
  () => name.value.trim().length > 0 && message.value.trim().length > 0 && !isSubmitting.value
)

async function submitWish() {
  if (!canSubmit.value) return
  isSubmitting.value = true
  submitError.value = ''

  const formData = new FormData()
  formData.append('name', name.value.trim())
  formData.append('message', message.value.trim())
  if (photoFile.value) formData.append('photo', photoFile.value)

  try {
    await $fetch('/api/wishes', { method: 'POST', body: formData })
    resetForm()
    emit('submitted')
  } catch (err: unknown) {
    const statusMessage = (err as { data?: { statusMessage?: string } })?.data?.statusMessage
    submitError.value = statusMessage || 'Không gửi được lời chúc, vui lòng thử lại.'
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  if (isSubmitting.value) return
  emit('close')
}
</script>

<template>
  <AppModal :open="open" aria-label="Gửi lời chúc" @close="handleClose">
    <template #header>
      <h2 class="font-heading text-lg text-text">Gửi Lời Chúc</h2>
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="submitWish">
      <div>
        <label for="wish-name" class="mb-2 block text-sm font-medium text-text">Tên của bạn</label>
        <input
          id="wish-name"
          v-model="name"
          type="text"
          required
          placeholder="VD: Minh & Lan"
          class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-base text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          style="min-height: 44px"
        />
      </div>

      <div>
        <label for="wish-message" class="mb-2 block text-sm font-medium text-text">Lời chúc</label>
        <textarea
          id="wish-message"
          v-model="message"
          required
          rows="4"
          maxlength="1000"
          placeholder="Gửi lời chúc phúc đến cô dâu chú rể..."
          class="w-full resize-none rounded-lg border border-secondary-light/60 px-4 py-3 text-base text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium text-text">Ảnh đính kèm (không bắt buộc)</label>
        <div v-if="!photoFile" class="flex items-center gap-3">
          <button type="button" class="btn-outline" @click="photoInputRef?.click()">
            Chọn ảnh
          </button>
          <input
            ref="photoInputRef"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="sr-only"
            aria-label="Chọn ảnh đính kèm cho lời chúc"
            @change="onPhotoChange"
          />
        </div>
        <div v-else class="flex items-center justify-between gap-3 rounded-lg border border-secondary-light/40 px-4 py-3">
          <p class="truncate text-sm text-text">{{ photoFile.name }}</p>
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center text-text-muted hover:text-error"
            aria-label="Bỏ ảnh đính kèm"
            @click="removePhoto"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <p v-if="submitError" role="alert" class="text-sm text-error">{{ submitError }}</p>

      <button type="submit" class="btn-primary" :disabled="!canSubmit">
        {{ isSubmitting ? 'Đang gửi...' : 'Gửi Lời Chúc' }}
      </button>
    </form>
  </AppModal>
</template>
