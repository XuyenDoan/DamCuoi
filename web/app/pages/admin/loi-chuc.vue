<script setup lang="ts">
import type { Wish } from '../../../server/utils/types'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Lời Chúc — Quản Trị' })

// useRequestFetch() bắt buộc dùng ở đây: useAsyncData chạy trong SSR, còn $fetch
// trơn không tự chuyển cookie phiên đăng nhập của request gốc sang API nội bộ.
const requestFetch = useRequestFetch()
const { data: wishes, refresh } = await useAsyncData<Wish[]>('admin-wishes', () =>
  requestFetch('/api/admin/wishes')
)

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(iso))
}

const pendingId = ref<string | null>(null)

async function toggleVisible(wish: Wish) {
  pendingId.value = wish.id
  try {
    await $fetch(`/api/admin/wishes/${wish.id}`, {
      method: 'PATCH',
      body: { visible: !wish.visible }
    })
    await refresh()
  } finally {
    pendingId.value = null
  }
}

async function deleteWish(wish: Wish) {
  if (!confirm(`Xoá lời chúc của "${wish.name}"? Hành động không thể hoàn tác.`)) return
  pendingId.value = wish.id
  try {
    await $fetch(`/api/admin/wishes/${wish.id}`, { method: 'DELETE' })
    await refresh()
  } finally {
    pendingId.value = null
  }
}
</script>

<template>
  <div>
    <AdminTopbar title="Lời chúc" />

    <div class="mx-auto max-w-3xl px-6 py-10">
      <h2 class="mb-1 font-heading text-2xl text-text">Lời Chúc Từ Khách Mời</h2>
      <p class="mb-6 text-sm text-text-muted">
        Ẩn hoặc xoá lời chúc không phù hợp trước khi hiển thị công khai.
      </p>

      <div v-if="!wishes || wishes.length === 0" class="py-16 text-center text-text-muted">
        Chưa có lời chúc nào.
      </div>

      <ul v-else class="flex flex-col gap-4">
        <li
          v-for="wish in wishes"
          :key="wish.id"
          class="rounded-xl border p-5"
          :class="wish.visible ? 'border-secondary-light/40' : 'border-error/30 bg-error/5'"
        >
          <div class="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-heading text-lg text-text">{{ wish.name }}</p>
              <p class="text-xs text-text-muted">{{ formatDate(wish.createdAt) }}</p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-medium"
              :class="wish.visible ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
            >
              {{ wish.visible ? 'Đang hiển thị' : 'Đã ẩn' }}
            </span>
          </div>

          <p class="whitespace-pre-line text-text-muted">{{ wish.message }}</p>

          <img
            v-if="wish.photo"
            :src="`/uploads/${wish.photo}`"
            alt="Ảnh đính kèm lời chúc"
            class="mt-3 max-h-48 rounded-lg object-cover"
          />

          <div class="mt-4 flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-secondary-light/60 px-4 py-2 text-sm font-medium text-text disabled:opacity-50"
              :disabled="pendingId === wish.id"
              @click="toggleVisible(wish)"
            >
              {{ wish.visible ? 'Ẩn lời chúc' : 'Hiện lại' }}
            </button>
            <button
              type="button"
              class="rounded-lg border border-error px-4 py-2 text-sm font-medium text-error disabled:opacity-50"
              :disabled="pendingId === wish.id"
              @click="deleteWish(wish)"
            >
              Xoá
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
