<script setup lang="ts">
import type { Wish } from '../../server/utils/types'

const props = defineProps<{ wish: Wish | null }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <AppModal
    :open="wish !== null"
    :aria-label="wish ? `Lời chúc từ ${wish.name}` : 'Lời chúc'"
    @close="emit('close')"
  >
    <template #header>
      <p class="font-heading text-lg text-text">{{ wish?.name }}</p>
      <p class="text-xs text-text-muted">{{ wish ? formatShortDate(wish.createdAt) : '' }}</p>
    </template>

    <!-- Lỗi thật đã gặp (rà soát theo yêu cầu chủ dự án): `object-cover` ở
         đây cắt mất 1 phần ảnh đính kèm khi xem popup đầy đủ, trong khi thẻ
         lời chúc ngoài danh sách (`WishCard.vue`) đã sửa đúng giữ tỉ lệ gốc
         từ trước — không nhất quán. Đổi giống hệt `WishCard.vue`: `h-auto
         w-full` (không ép object-fit) + `width`/`height` gốc để tránh giật
         layout. Panel `AppModal` đã tự cuộn (`max-h-[85vh] overflow-y-auto`)
         nên ảnh dọc dài không phá layout, chỉ cuộn thêm. -->
    <img
      v-if="wish?.photo"
      :src="`/uploads/${wish.photo}`"
      :width="wish.width ?? undefined"
      :height="wish.height ?? undefined"
      alt="Ảnh đính kèm lời chúc"
      class="mb-4 h-auto w-full rounded-lg"
    />

    <p class="whitespace-pre-line break-words text-text-muted">{{ wish?.message }}</p>
  </AppModal>
</template>
