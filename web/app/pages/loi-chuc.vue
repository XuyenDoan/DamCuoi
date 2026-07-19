<script setup lang="ts">
import type { Wish } from '../../server/utils/types'

definePageMeta({ middleware: 'page-visibility' })
useHead({ title: 'Lời Chúc — Album Cưới' })

const { data: wishes, refresh } = await useWishes()

const name = ref('')
const message = ref('')
const photoFile = ref<File | null>(null)
const photoInputRef = ref<HTMLInputElement | null>(null)
const isSubmitting = ref(false)
const submitError = ref('')
const justSubmitted = ref(false)

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
    name.value = ''
    message.value = ''
    removePhoto()
    justSubmitted.value = true
    await refresh()
  } catch (err: unknown) {
    const statusMessage =
      (err as { data?: { statusMessage?: string } })?.data?.statusMessage
    submitError.value = statusMessage || 'Không gửi được lời chúc, vui lòng thử lại.'
  } finally {
    isSubmitting.value = false
  }
}

const selectedWish = ref<Wish | null>(null)
</script>

<template>
  <div class="relative overflow-hidden">
    <section class="relative overflow-hidden px-6 pb-8 pt-32 text-center sm:pt-40">
      <h1 class="font-heading text-4xl text-text sm:text-5xl">Lời Chúc</h1>
      <p class="mx-auto mt-3 max-w-xl text-text-muted">
        Gửi lời chúc phúc đến cô dâu và chú rể — mỗi lời nhắn đều là món quà quý giá.
      </p>
    </section>

    <section class="mx-auto max-w-xl px-6 pb-16">
      <div
        v-if="justSubmitted"
        class="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
      >
        Cảm ơn bạn đã gửi lời chúc! Lời chúc của bạn đã được đăng.
      </div>

      <form
        class="flex flex-col gap-4 rounded-xl border border-secondary-light/40 bg-surface p-6"
        @submit.prevent="submitWish"
      >
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
    </section>

    <section class="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div v-if="!wishes || wishes.length === 0" class="py-16 text-center">
        <LotusMotif class="mx-auto h-16 w-16 text-secondary-light" />
        <p class="mt-6 text-text-muted">
          Chưa có lời chúc nào — hãy là người đầu tiên gửi lời chúc phúc!
        </p>
      </div>

      <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <button
          v-for="(wish, i) in wishes"
          :key="wish.id"
          v-reveal="(i % 12) * 40"
          type="button"
          class="flex flex-col overflow-hidden rounded-xl border border-secondary-light/40 bg-bg text-left transition-shadow hover:shadow-md"
          @click="selectedWish = wish"
        >
          <div class="flex aspect-square items-center justify-center overflow-hidden bg-surface">
            <img
              v-if="wish.photo"
              :src="`/uploads/${wish.photo}`"
              alt="Ảnh đính kèm lời chúc"
              loading="lazy"
              class="h-full w-full object-cover"
            />
            <LotusMotif v-else class="h-10 w-10 text-secondary-light" />
          </div>
          <div class="flex flex-1 flex-col gap-1 p-3">
            <p class="truncate font-heading text-sm text-text">{{ wish.name }}</p>
            <p class="line-clamp-3 text-xs text-text-muted">{{ wish.message }}</p>
          </div>
        </button>
      </div>
    </section>

    <WishModal :wish="selectedWish" @close="selectedWish = null" />
  </div>
</template>
