<script setup lang="ts">
/**
 * Tiêu đề "Our Story" dùng CHUNG cho mục Câu Chuyện Tình Yêu ở cả 7 theme
 * (yêu cầu chủ dự án: đổi sang tiếng Anh, phóng to, và chọn font/màu hợp với
 * từng phông nền). Dáng chung: chữ nhỏ "Our" phía trên + chữ to in hoa
 * "STORY" bên dưới (theo ảnh mẫu "Our LOVE STORY") — font/màu/cỡ từng theme
 * khai ở khối `.love-story-title` trong main.css (theo `[data-theme]`), không
 * viết lại markup ở từng theme.
 *
 * 1 thẻ `<h2>` duy nhất (2 `<span>` con) để outline trang chỉ có 1 tiêu đề;
 * `lang="en"` để trình đọc màn hình đọc đúng tiếng Anh giữa trang tiếng Việt.
 */
</script>

<template>
  <h2 lang="en" class="love-story-title" aria-label="Our Story">
    <span class="love-story-title__script" aria-hidden="true">Our</span>
    <span class="love-story-title__main" aria-hidden="true">Story</span>
  </h2>
</template>
