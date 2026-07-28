<script setup lang="ts">
/**
 * Khối giới thiệu cô dâu + chú rể, đặt ngay trước "Câu Chuyện Của Chúng Tôi"
 * (spec.md mục 38) — tham khảo mẫu "Meet the couple" phổ biến ở các trang
 * cưới AAA (The Knot, Zola...): ảnh chân dung lớn xen kẽ 2 bên trái/phải,
 * tên lớn kèm nhãn "CÔ DÂU"/"CHÚ RỂ". Cô dâu LUÔN đặt ở khối TRÊN, chú rể ở
 * khối DƯỚI (đúng yêu cầu "cô dâu trước chú rể" áp dụng nhất quán toàn site).
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
      </div>
    </div>

    <div
      v-if="groomImage"
      v-reveal="80"
      class="couple-intro-block mt-14 grid items-center gap-8 sm:mt-20 sm:grid-cols-2 sm:gap-14"
    >
      <div class="order-1 text-center sm:order-2 sm:text-right">
        <p class="font-accent text-sm italic tracking-[0.2em] text-primary">Chú Rể</p>
        <h3 class="mt-2 font-heading text-3xl text-text sm:text-4xl">{{ settings?.coupleNames.groom }}</h3>
      </div>
      <div class="couple-intro-portrait-wrap order-2 sm:order-1">
        <img :src="`/uploads/${groomImage}`" alt="" class="couple-intro-portrait" />
      </div>
    </div>
  </section>
</template>
