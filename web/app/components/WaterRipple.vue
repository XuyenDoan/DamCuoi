<script setup lang="ts">
/**
 * Hiệu ứng mặt nước — nhiều lớp gợn sóng ngang mảnh, trôi ngang RẤT CHẬM và
 * liên tục (không giật khi lặp lại): mỗi lớp là 1 đường SVG hình sin lặp lại
 * 2 LẦN cạnh nhau (tổng chiều rộng = 2 x viewBox gốc), animate `translateX`
 * từ 0 → -50% tổng chiều rộng (đúng bằng 1 chu kỳ) rồi lặp lại — vì nửa sau
 * hệt nửa đầu nên mắt không nhận ra chỗ nối.
 *
 * QUAN TRỌNG (bổ sung lần 3 — yêu cầu "vài gợn sóng rõ" + "lá hoa rơi lõm
 * tõm"): tăng độ đậm (stroke-opacity) toàn bộ lớp gợn sóng cho rõ hơn hẳn
 * bản trước (vẫn giữ nét mảnh, không dày cộm); bỏ `overflow-hidden` ở gốc
 * để vài cánh hoa/lá rơi (`FallingPetal`) có thể RƠI TỪ PHÍA TRÊN dải nước
 * xuống mà không bị cắt cụt phần đầu — container ông/bà (LotusScene +
 * PageBackdrop) đã có `overflow-hidden` riêng nên không phát sinh cuộn
 * ngang/dọc ngoài ý muốn.
 */
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh]" aria-hidden="true">
    <!-- Lớp phủ màu nước — gradient nhạt dần từ đáy lên, tạo cảm giác "vùng nước" thay vì chỉ đường viền -->
    <div class="absolute inset-0 overflow-hidden bg-gradient-to-t from-secondary-light/[0.10] via-secondary-light/[0.04] to-transparent" />

    <svg
      class="water-ripple-layer water-ripple-layer--0 absolute bottom-[34%] left-0 h-9 w-[200%] text-secondary-light"
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
    >
      <path
        d="M0,13 Q22,7 44,13 T88,13 T132,13 T176,13 T220,13 T264,13 T308,13 T352,13 T396,13 T440,13"
        fill="none"
        stroke="currentColor"
        stroke-opacity="0.24"
        stroke-width="1.2"
        stroke-linecap="round"
      />
    </svg>
    <svg
      class="water-ripple-layer water-ripple-layer--1 absolute bottom-[22%] left-0 h-10 w-[200%] text-secondary-light"
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
    >
      <path
        d="M0,12 Q25,4 50,12 T100,12 T150,12 T200,12 T250,12 T300,12 T350,12 T400,12"
        fill="none"
        stroke="currentColor"
        stroke-opacity="0.46"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
    <svg
      class="water-ripple-layer water-ripple-layer--2 absolute bottom-[13%] left-0 h-8 w-[200%] text-secondary"
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
    >
      <path
        d="M0,14 Q20,20 40,14 T80,14 T120,14 T160,14 T200,14 T240,14 T280,14 T320,14 T360,14 T400,14"
        fill="none"
        stroke="currentColor"
        stroke-opacity="0.32"
        stroke-width="1.1"
        stroke-linecap="round"
      />
    </svg>
    <svg
      class="water-ripple-layer water-ripple-layer--3 absolute bottom-[4%] left-0 h-12 w-[200%] text-primary-light"
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
    >
      <path
        d="M0,10 Q30,18 60,10 T120,10 T180,10 T240,10 T300,10 T360,10 T400,10"
        fill="none"
        stroke="currentColor"
        stroke-opacity="0.26"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </svg>
    <svg
      class="water-ripple-layer water-ripple-layer--4 absolute bottom-0 left-0 h-7 w-[200%] text-secondary"
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
    >
      <path
        d="M0,12 Q18,6 36,12 T72,12 T108,12 T144,12 T180,12 T216,12 T252,12 T288,12 T324,12 T360,12 T396,12 T432,12"
        fill="none"
        stroke="currentColor"
        stroke-opacity="0.4"
        stroke-width="1.1"
        stroke-linecap="round"
      />
    </svg>

    <!-- Cánh hoa/lá rơi xuống mặt nước, tạo gợn sóng lõm tõm ngay chỗ rơi trúng -->
    <FallingPetal
      left="8%"
      land-top="28%"
      :size="0.85"
      fall-distance="-30vh"
      duration="9s"
      delay="0s"
      tone="text-secondary-light"
    />
    <FallingPetal
      left="27%"
      land-top="55%"
      :size="0.65"
      fall-distance="-38vh"
      duration="11.5s"
      delay="-4s"
      tone="text-secondary"
    />
    <FallingPetal
      left="61%"
      land-top="20%"
      :size="0.75"
      fall-distance="-24vh"
      duration="10s"
      delay="-7.5s"
      tone="text-primary-light"
    />
    <FallingPetal
      left="83%"
      land-top="48%"
      :size="0.7"
      fall-distance="-34vh"
      duration="13s"
      delay="-2.2s"
      tone="text-secondary-light"
    />
    <FallingPetal
      left="17%"
      land-top="38%"
      :size="0.55"
      fall-distance="-26vh"
      duration="12s"
      delay="-9s"
      tone="text-secondary"
    />
    <FallingPetal
      left="45%"
      land-top="15%"
      :size="0.7"
      fall-distance="-22vh"
      duration="10.5s"
      delay="-5.5s"
      tone="text-primary-light"
    />
    <FallingPetal
      left="95%"
      land-top="32%"
      :size="0.6"
      fall-distance="-30vh"
      duration="13.5s"
      delay="-1s"
      tone="text-secondary-light"
    />
  </div>
</template>

<style scoped>
.water-ripple-layer {
  animation: water-drift linear infinite;
}
.water-ripple-layer--0 {
  animation-duration: 52s;
}
.water-ripple-layer--1 {
  animation-duration: 34s;
}
.water-ripple-layer--2 {
  animation-duration: 46s;
  animation-direction: reverse;
}
.water-ripple-layer--3 {
  animation-duration: 60s;
}
.water-ripple-layer--4 {
  animation-duration: 40s;
  animation-direction: reverse;
}

@keyframes water-drift {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .water-ripple-layer {
    animation: none;
  }
}
</style>
