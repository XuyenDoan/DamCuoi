<script setup lang="ts">
/**
 * Ảnh chữ nhật cô dâu chú rể phủ hết chiều rộng trang, đặt ĐẦU TIÊN trên
 * trang chủ (spec.md mục 38 + 38.8/38.9). Dùng CHUNG 1 component cho cả 6
 * theme, chỉ đổi hình dạng/hiệu ứng qua CSS hook `.hero-portrait-wrap` —
 * đúng kiến trúc token-driven đã lập từ mục 36.3. Không hiển thị gì nếu
 * admin chưa tải ảnh lên (không có placeholder ở trang công khai).
 *
 * mục 38.9: hiện tên cô dâu chú rể NGAY TRÊN ảnh (tham khảo kiểu "title
 * card" của các trang cưới AAA: The Knot, Zola, Squarespace wedding
 * templates — chữ lớn nổi trên khối "tấm bảng" (plate) mờ đục theo màu
 * `--color-bg`/`--color-text` CỦA CHÍNH THEME, không phải trắng/đen cứng).
 * Lý do dùng tấm bảng gần như đục (94%) thay vì chữ trắng + đổ bóng đơn
 * thuần: đã tính bằng công thức tương phản WCAG — với theme NỀN TỐI (chữ
 * sáng trên nền tối, VD Cinematic), nếu ảnh nền admin tải lên tình cờ rất
 * sáng (gần trắng), lớp phủ chỉ ~88% đục vẫn có thể tụt dưới 7:1 (đã tính
 * ra ~5:1 ở kịch bản xấu nhất). Ở 94% đục, MỌI theme (dù sáng hay tối) đều
 * giữ tương phản ≥10:1 kể cả khi ảnh nền là thuần trắng/thuần đen — vì tấm
 * bảng thực chất kế thừa ĐÚNG cặp `--color-bg`/`--color-text` đã tự kiểm AAA
 * ở mục 36.4/37.4, ảnh chỉ còn thấp thoáng rất nhẹ phía sau qua lớp blur.
 */
const { data: settings } = useSiteSettings()
const heroImage = computed(() => settings.value?.siteImages?.hero ?? null)
</script>

<template>
  <div v-if="heroImage" v-reveal="0" class="hero-portrait-wrap">
    <img :src="`/uploads/${heroImage}`" alt="" class="hero-portrait" />
    <div class="hero-portrait-names">
      <p class="hero-portrait-names-plate font-heading">
        {{ settings?.coupleNames.bride }} <span class="text-primary">&amp;</span> {{ settings?.coupleNames.groom }}
      </p>
    </div>
  </div>
</template>
