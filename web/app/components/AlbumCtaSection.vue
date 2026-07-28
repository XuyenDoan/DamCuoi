<script setup lang="ts">
/**
 * Nút "Xem Album Ảnh" đóng vai trò lời mời gọi cuối trang chủ (spec.md mục
 * 38.12) — trước đây nằm trong khối hero đầu trang, nay dời hẳn xuống CUỐI
 * CÙNG (sau "Giờ Lễ & Địa Điểm") theo yêu cầu chủ dự án. Dùng CHUNG 1
 * component cho cả 6 theme (không nhân bản) — chỉ cần `.btn-primary` đã có
 * sẵn CSS riêng theo từng theme, không cần thêm hook CSS mới.
 */
</script>

<template>
  <section class="album-cta-section mx-auto max-w-xl px-6 pb-24 pt-4 text-center sm:pb-32">
    <p v-reveal="0" class="mb-4 text-sm text-text-muted">
      Cùng xem lại những khoảnh khắc đáng nhớ của chúng tôi
    </p>
    <NuxtLink to="/album" v-reveal="80" class="btn-primary">Xem Album Ảnh</NuxtLink>
  </section>
</template>
