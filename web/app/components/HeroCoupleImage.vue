<script setup lang="ts">
/**
 * Ảnh chữ nhật cô dâu chú rể phủ hết chiều rộng trang, đặt ĐẦU TIÊN trên
 * trang chủ (spec.md mục 38 + 38.8/38.9/38.10). Dùng CHUNG 1 component cho
 * cả 6 theme, chỉ đổi hình dạng/hiệu ứng qua CSS hook `.hero-portrait-wrap`
 * — đúng kiến trúc token-driven đã lập từ mục 36.3. Không hiển thị gì nếu
 * admin chưa tải ảnh lên (không có placeholder ở trang công khai).
 *
 * mục 38.10: chủ dự án phản hồi bản đầu (mục 38.9) có "tấm bảng" nền mờ
 * phía sau chữ trông thừa — CHỈ CẦN CHỮ, không cần khối nền đè lên ảnh. Đổi
 * sang kỹ thuật thuần typography (không nền/không blur) tham khảo cách các
 * trang tạp chí/điện ảnh xử lý chữ nổi trên ảnh khi KHÔNG dùng scrim: chữ
 * trắng + `text-shadow` nhiều lớp chồng (1 lớp sát viền để "khắc nét" cạnh
 * chữ + 1 lớp toả rộng mềm để tạo độ sâu/nổi khối) — kỹ thuật tiêu chuẩn cho
 * chữ đặt trên ảnh bất kỳ (phim, poster, hero banner) khi không muốn che ảnh
 * bằng khối nền. Đánh đổi đã biết trước: KHÔNG còn đảm bảo toán học AAA
 * (7:1) tuyệt đối với mọi ảnh bất kỳ như tấm bảng ở mục 38.9 — chấp nhận
 * theo đúng yêu cầu thẩm mỹ của chủ dự án, đã bù bằng shadow đủ dày để đọc
 * tốt trên phần lớn ảnh cưới thực tế (nền có dải tông màu tự nhiên, không
 * phải test case cực đoan trắng/đen tuyệt đối).
 *
 * mục 38.12: đưa `heroTagline` (VD "Chúng tôi sắp về chung một nhà") lên
 * làm dòng overline nhỏ phía TRÊN tên, cùng khối chữ nổi trên ảnh — gộp
 * chung 1 nơi duy nhất thay vì lặp lại y hệt ở khối text bên dưới ảnh (khối
 * đó đã bỏ hẳn tagline + tên, chỉ còn lời ngỏ `welcomeMessage`, xem các
 * `*HomeView.vue`).
 */
const { data: settings } = useSiteSettings()
const heroImage = computed(() => settings.value?.siteImages?.hero ?? null)
</script>

<template>
  <div v-if="heroImage" v-reveal="0" class="hero-portrait-wrap">
    <img :src="`/uploads/${heroImage}`" alt="" class="hero-portrait" />
    <div class="hero-portrait-names">
      <p v-if="settings?.heroTagline" class="hero-portrait-tagline font-accent">
        {{ settings.heroTagline }}
      </p>
      <p class="hero-portrait-names-text font-heading">
        {{ settings?.coupleNames.bride }} <span class="text-primary">&amp;</span> {{ settings?.coupleNames.groom }}
      </p>
    </div>
  </div>
</template>
