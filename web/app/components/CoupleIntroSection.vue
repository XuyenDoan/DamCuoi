<script setup lang="ts">
/**
 * Khối giới thiệu cô dâu + chú rể, đặt ngay trước "Câu Chuyện Của Chúng Tôi"
 * (spec.md mục 38, bố cục xen phủ tại mục 38.9) — tham khảo mẫu "duo
 * portrait" xếp chồng lệch, xoay nhẹ, phổ biến ở các trang cưới/portfolio
 * AAA (Zola, The Knot, các mẫu Squarespace cao cấp): 2 ảnh chân dung XEN
 * PHỦ NHAU một chút thay vì tách hẳn 2 khối như bản đầu — cảm giác "nghệ",
 * có chủ đích, không phải xếp lệch tình cờ. Cô dâu LUÔN ở ảnh TRÁI (đè lên
 * trên tại mép giao — đúng ưu tiên "cô dâu trước" áp dụng nhất quán toàn
 * site), chú rể ở ảnh PHẢI.
 *
 * Khi CHỈ 1 trong 2 người có ảnh (thiếu ảnh còn lại) — bỏ hiệu ứng xen phủ,
 * hiện đúng 1 ảnh cỡ lớn hơn, căn giữa bình thường (không có gì để "xen"
 * cùng). `bothImages` quyết định bật/tắt toàn bộ hiệu ứng overlap qua class.
 *
 * Dùng CHUNG 1 component cho cả 6 theme — hình dạng khung ảnh (bo góc/viền/
 * đổ bóng riêng theo theme) vẫn tái dùng NGUYÊN `.couple-intro-portrait-wrap`
 * đã có (mục 36.3/38.3), chỉ thêm class định vị/xoay/xen phủ mới
 * (`.couple-duo-*`) — không viết lại CSS khung ảnh theo từng theme.
 */
const { data: settings } = useSiteSettings()
const brideImage = computed(() => settings.value?.siteImages?.bridePortrait ?? null)
const groomImage = computed(() => settings.value?.siteImages?.groomPortrait ?? null)
const showSection = computed(() => !!brideImage.value || !!groomImage.value)
const bothImages = computed(() => !!brideImage.value && !!groomImage.value)
</script>

<template>
  <section v-if="showSection" class="couple-intro-section mx-auto max-w-4xl px-6 py-20 sm:py-28">
    <div class="couple-duo-frame">
      <div
        v-if="brideImage"
        v-reveal="0"
        class="couple-intro-portrait-wrap couple-duo-photo"
        :class="bothImages ? 'couple-duo-photo-bride' : 'couple-duo-photo-solo'"
      >
        <img :src="`/uploads/${brideImage}`" alt="" class="couple-intro-portrait" />
      </div>
      <div
        v-if="groomImage"
        v-reveal="120"
        class="couple-intro-portrait-wrap couple-duo-photo"
        :class="bothImages ? 'couple-duo-photo-groom' : 'couple-duo-photo-solo'"
      >
        <img :src="`/uploads/${groomImage}`" alt="" class="couple-intro-portrait" />
      </div>
    </div>

    <div class="couple-duo-names">
      <div v-if="brideImage" v-reveal="60" class="couple-intro-name-block">
        <p class="font-accent text-sm italic tracking-[0.2em] text-primary">Cô Dâu</p>
        <h3 class="mt-2 font-heading text-2xl text-text sm:text-3xl">{{ settings?.coupleNames.bride }}</h3>
        <div class="couple-intro-divider mx-auto mt-3" />
      </div>
      <div v-if="groomImage" v-reveal="180" class="couple-intro-name-block">
        <p class="font-accent text-sm italic tracking-[0.2em] text-primary">Chú Rể</p>
        <h3 class="mt-2 font-heading text-2xl text-text sm:text-3xl">{{ settings?.coupleNames.groom }}</h3>
        <div class="couple-intro-divider mx-auto mt-3" />
      </div>
    </div>
  </section>
</template>
