<script setup lang="ts">
import type { EventInfoBlock } from '../../server/utils/types'

/**
 * Khối hiển thị thông tin lễ cưới 1 nhà (giờ + địa điểm + bản đồ) — trích
 * xuất từ `thong-tin.vue` thành component dùng chung, để popup "Thông tin lễ
 * cưới" mở từ đếm ngược ở trang chủ (index.vue) tái sử dụng ĐÚNG 1 nguồn nội
 * dung/logic này thay vì lặp lại markup — sửa 1 nơi, đồng bộ ở mọi chỗ hiển
 * thị (single source of truth). Chỉ chứa phần NỘI DUNG — khung thẻ/viền bao
 * quanh do nơi gọi tự quyết định (thong-tin.vue dùng card viền surface,
 * popup dùng khung AppModal) vì 2 ngữ cảnh cần khung khác nhau.
 */
const props = defineProps<{ label: string; info: EventInfoBlock | undefined }>()

const formattedTime = computed(() =>
  props.info?.ceremonyTime ? formatVietnameseDateTime(props.info.ceremonyTime) : ''
)

const mapsSearchUrl = computed(() => {
  if (!props.info?.venueAddress) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.info.venueAddress)}`
})
</script>

<template>
  <div>
    <p class="mb-5 text-center font-accent text-lg italic text-primary">{{ label }}</p>

    <div class="flex flex-col gap-5">
      <div class="flex items-start gap-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mt-0.5 h-6 w-6 shrink-0 text-primary">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" stroke-linecap="round" />
        </svg>
        <div>
          <p class="text-sm font-medium text-text-muted">Thời gian</p>
          <p class="text-hover text-lg text-text">{{ formattedTime || 'Đang cập nhật' }}</p>
        </div>
      </div>

      <div class="flex items-start gap-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mt-0.5 h-6 w-6 shrink-0 text-primary">
          <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        <div>
          <p class="text-sm font-medium text-text-muted">Địa điểm</p>
          <p class="text-hover text-lg text-text">{{ info?.venueName || 'Đang cập nhật' }}</p>
          <p v-if="info?.venueAddress" class="text-hover text-text-muted">
            {{ info.venueAddress }}
          </p>
          <a
            v-if="mapsSearchUrl"
            :href="mapsSearchUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="focus-ring mt-1 inline-block rounded-sm text-sm text-secondary underline underline-offset-2 transition-colors duration-200 hover:text-secondary/80"
          >
            Xem trên Google Maps
          </a>
        </div>
      </div>
    </div>

    <div v-if="info?.mapEmbedUrl" class="mt-6 overflow-hidden rounded-lg">
      <iframe
        :src="info.mapEmbedUrl"
        title="Bản đồ địa điểm tổ chức"
        loading="lazy"
        class="h-64 w-full border-0"
        referrerpolicy="no-referrer-when-downgrade"
      />
    </div>
  </div>
</template>
