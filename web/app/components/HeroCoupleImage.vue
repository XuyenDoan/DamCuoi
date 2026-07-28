<script setup lang="ts">
/**
 * Ảnh chữ nhật cô dâu chú rể đặt phía trên tên/tagline ở đầu trang chủ
 * (spec.md mục 38, phương án "Khung ảnh nổi phía trên tên" — chủ dự án đã
 * chọn qua AskUserQuestion). Dùng CHUNG 1 component cho cả 6 theme, chỉ đổi
 * hình dạng khung qua CSS hook `.hero-portrait-wrap`/`.hero-portrait`
 * (`[data-theme="..."]` trong main.css) — đúng kiến trúc token-driven đã
 * lập từ mục 36.3, không tạo 6 component riêng. Không hiển thị gì nếu admin
 * chưa tải ảnh lên (không có placeholder ở trang công khai).
 */
const { data: settings } = useSiteSettings()
const heroImage = computed(() => settings.value?.siteImages?.hero ?? null)
</script>

<template>
  <div v-if="heroImage" v-reveal="0" class="hero-portrait-wrap">
    <img :src="`/uploads/${heroImage}`" alt="" class="hero-portrait" />
  </div>
</template>
