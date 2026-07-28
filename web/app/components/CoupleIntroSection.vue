<script setup lang="ts">
/**
 * Khối giới thiệu cô dâu + chú rể, đặt ngay trước "Câu Chuyện Của Chúng Tôi"
 * (spec.md mục 38) — tham khảo mẫu "Meet the couple" phổ biến ở các trang
 * cưới AAA (The Knot, Zola...): ảnh chân dung lớn xen kẽ 2 bên trái/phải,
 * tên lớn kèm nhãn "CÔ DÂU"/"CHÚ RỂ". Cô dâu LUÔN đặt ở khối TRÊN, chú rể ở
 * khối DƯỚI (đúng yêu cầu "cô dâu trước chú rể" áp dụng nhất quán toàn site).
 *
 * Bố cục xen kẽ đối xứng gương (mục 38 đợt sửa 2): cô dâu — ẢNH TRÁI/CHỮ
 * PHẢI; chú rể — ẢNH PHẢI/CHỮ TRÁI. Cả 2 khối giữ NGUYÊN thứ tự DOM [ảnh,
 * chữ] (khớp thứ tự xếp chồng tự nhiên trên mobile: ảnh trên, chữ dưới,
 * đồng nhất nhịp đọc giữa 2 khối) — chỉ đổi vị trí trực quan ở desktop qua
 * `sm:order-*` trên chính 2 phần tử đó, không đảo DOM (khác bản đầu: từng
 * đảo cả DOM lẫn `order` không khớp nhau nên chú rể lại hiện Y HỆT cô dâu
 * — ảnh trái/chữ phải — thay vì đối xứng gương như ý đồ ban đầu).
 *
 * Dùng CHUNG 1 component cho cả 6 theme (không nhân bản 6 component riêng)
 * — hình dạng khung ảnh đổi qua CSS hook `.couple-intro-portrait-wrap` ở
 * main.css, đúng kiến trúc token-driven đã lập từ mục 36.3. Mỗi khối chỉ
 * hiện khi CHÍNH người đó có ảnh (độc lập nhau); ẩn cả section nếu cả 2 đều
 * chưa có ảnh — không có placeholder ở trang công khai.
 */
const { data: settings } = useSiteSettings()
const brideImage = computed(() => settings.value?.siteImages?.bridePortrait ?? null)
const groomImage = computed(() => settings.value?.siteImages?.groomPortrait ?? null)
const showSection = computed(() => !!brideImage.value || !!groomImage.value)
</script>

<template>
  <section v-if="showSection" class="couple-intro-section mx-auto max-w-5xl px-6 py-20 sm:py-28">
    <div
      v-if="brideImage"
      v-reveal="0"
      class="couple-intro-block grid items-center gap-8 sm:grid-cols-2 sm:gap-14"
    >
      <div class="couple-intro-portrait-wrap">
        <img :src="`/uploads/${brideImage}`" alt="" class="couple-intro-portrait" />
      </div>
      <div class="text-center sm:text-left">
        <p class="font-accent text-sm italic tracking-[0.2em] text-primary">Cô Dâu</p>
        <h3 class="mt-2 font-heading text-3xl text-text sm:text-4xl">{{ settings?.coupleNames.bride }}</h3>
        <div class="couple-intro-divider mx-auto mt-4 sm:mx-0" />
      </div>
    </div>

    <div
      v-if="groomImage"
      v-reveal="80"
      class="couple-intro-block mt-14 grid items-center gap-8 sm:mt-20 sm:grid-cols-2 sm:gap-14"
    >
      <div class="couple-intro-portrait-wrap sm:order-2">
        <img :src="`/uploads/${groomImage}`" alt="" class="couple-intro-portrait" />
      </div>
      <div class="text-center sm:order-1 sm:text-right">
        <p class="font-accent text-sm italic tracking-[0.2em] text-primary">Chú Rể</p>
        <h3 class="mt-2 font-heading text-3xl text-text sm:text-4xl">{{ settings?.coupleNames.groom }}</h3>
        <div class="couple-intro-divider mx-auto mt-4 sm:ml-auto sm:mr-0" />
      </div>
    </div>
  </section>
</template>
