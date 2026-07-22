<script setup lang="ts">
import { pageKeyFromPath } from '#shared/pages'

/**
 * Ảnh nền riêng từng trang (admin chọn — cùng field `pageBackgrounds` dùng
 * chung với theme mặc định, xem `PageBackdrop.vue`) cho 2 theme Biên Tập
 * Sang Trọng / Điện Ảnh Cuộn — 2 theme này KHÔNG dùng hoạ tiết hoa sen
 * (`LotusScene`) nên tách thành component riêng, nhẹ hơn hẳn `PageBackdrop`
 * (không có logic nở hoa theo cuộn trang). Khi admin CHƯA chọn ảnh riêng,
 * không hiện gì thêm — nền trang tự đủ (giấy ngà/màn đêm) theo đúng tinh
 * thần "không hoạ tiết trang trí" của 2 theme này.
 */
const route = useRoute()
const { data: settings } = useSiteSettings()

const pageKey = computed(() => pageKeyFromPath(route.path))
const backgroundImage = computed(() => settings.value?.pageBackgrounds?.[pageKey.value] ?? null)
</script>

<template>
  <div v-if="backgroundImage" class="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
    <img :src="`/uploads/${backgroundImage}`" alt="" class="page-bg-image h-full w-full object-cover" />
  </div>
</template>
