<script setup lang="ts">
/**
 * Khối giới thiệu cô dâu + chú rể, đặt ngay trước "Câu Chuyện Của Chúng Tôi"
 * (spec.md mục 38, bố cục "cối xay gió" tại mục 38.11) — 2 ảnh chân dung
 * giao chéo (cô dâu trên-trái, chú rể dưới-phải — đúng ưu tiên "cô dâu
 * trước"), tên đặt vào đúng 2 GÓC TRỐNG đối diện chéo với từng ảnh (tên cô
 * dâu ở góc trên-phải, tên chú rể ở góc dưới-trái) — ảnh và chữ luân phiên
 * theo 4 góc, tham khảo bố cục lưới 2×2 bất đối xứng phổ biến ở các trang
 * portfolio/tạp chí cao cấp (Behance, Awwwards, biên tập tạp chí cưới).
 *
 * Khi CHỈ 1 trong 2 người có ảnh — bỏ hẳn bố cục cối xay gió (không có ảnh
 * còn lại để tạo góc chéo cùng), hiện đúng 1 ảnh cỡ lớn + tên bên dưới, căn
 * giữa bình thường.
 *
 * Dùng CHUNG 1 component cho cả 6 theme — hình dạng khung ảnh (bo góc/viền/
 * đổ bóng riêng theo theme) vẫn tái dùng NGUYÊN `.couple-intro-portrait-wrap`
 * đã có (mục 36.3/38.3), chỉ thêm class định vị mới (`.couple-duo-*`) —
 * không viết lại CSS khung ảnh theo từng theme.
 */
const { data: settings } = useSiteSettings()
const brideImage = computed(() => settings.value?.siteImages?.bridePortrait ?? null)
const groomImage = computed(() => settings.value?.siteImages?.groomPortrait ?? null)
const showSection = computed(() => !!brideImage.value || !!groomImage.value)
const bothImages = computed(() => !!brideImage.value && !!groomImage.value)
</script>

<template>
  <section v-if="showSection" class="couple-intro-section mx-auto max-w-4xl px-6 py-20 sm:py-28">
    <div v-if="bothImages" class="couple-duo-frame">
      <div v-reveal="0" class="couple-intro-portrait-wrap couple-duo-photo-bride">
        <img :src="`/uploads/${brideImage}`" alt="" class="couple-intro-portrait" />
      </div>

      <div v-reveal="60" class="couple-duo-name couple-duo-name-bride">
        <p class="font-accent text-sm italic tracking-[0.2em] text-primary">Cô Dâu</p>
        <h3 class="mt-2 font-heading text-lg text-text sm:text-2xl md:text-3xl">{{ settings?.coupleNames.bride }}</h3>
        <div class="couple-intro-divider mt-3" />
      </div>

      <div v-reveal="120" class="couple-intro-portrait-wrap couple-duo-photo-groom">
        <img :src="`/uploads/${groomImage}`" alt="" class="couple-intro-portrait" />
      </div>

      <div v-reveal="180" class="couple-duo-name couple-duo-name-groom">
        <p class="font-accent text-sm italic tracking-[0.2em] text-primary">Chú Rể</p>
        <h3 class="mt-2 font-heading text-lg text-text sm:text-2xl md:text-3xl">{{ settings?.coupleNames.groom }}</h3>
        <div class="couple-intro-divider mt-3" />
      </div>
    </div>

    <div v-else class="flex flex-col items-center gap-6 text-center">
      <div v-if="brideImage" v-reveal="0" class="couple-intro-portrait-wrap couple-duo-photo-solo">
        <img :src="`/uploads/${brideImage}`" alt="" class="couple-intro-portrait" />
      </div>
      <div v-if="groomImage" v-reveal="0" class="couple-intro-portrait-wrap couple-duo-photo-solo">
        <img :src="`/uploads/${groomImage}`" alt="" class="couple-intro-portrait" />
      </div>
      <div v-reveal="60" class="couple-intro-name-block">
        <p class="font-accent text-sm italic tracking-[0.2em] text-primary">{{ brideImage ? 'Cô Dâu' : 'Chú Rể' }}</p>
        <h3 class="mt-2 font-heading text-2xl text-text sm:text-3xl">
          {{ brideImage ? settings?.coupleNames.bride : settings?.coupleNames.groom }}
        </h3>
        <div class="couple-intro-divider mx-auto mt-3" />
      </div>
    </div>
  </section>
</template>
