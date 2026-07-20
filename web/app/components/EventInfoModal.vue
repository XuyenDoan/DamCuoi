<script setup lang="ts">
import type { EventInfoBlock } from '../../server/utils/types'

/**
 * Popup hiển thị đầy đủ thông tin lễ cưới 1 nhà — mở khi bấm vào khu vực
 * đếm ngược "Nhà Trai"/"Nhà Gái" ở trang chủ (index.vue). Tái sử dụng
 * `EventInfoCard` (đúng nội dung/logic đã dùng ở trang "Thông tin lễ cưới")
 * để không lặp lại markup — sửa nội dung ở 1 nơi duy nhất.
 */
defineProps<{ open: boolean; label: string; info: EventInfoBlock | undefined }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <AppModal :open="open" :aria-label="`Thông tin lễ cưới — ${label}`" max-width="lg" @close="emit('close')">
    <template #header>
      <h2 class="font-heading text-lg text-text">Thông Tin Lễ Cưới</h2>
    </template>

    <EventInfoCard :label="label" :info="info" />
  </AppModal>
</template>
