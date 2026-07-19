<script setup lang="ts">
/**
 * Chim bay line-art — vẽ lại lần 3 theo đúng ảnh tham khảo chủ dự án gửi
 * (chim bồ câu 3D dễ thương): ĐẦU TO gần bằng thân (không phải đầu nhỏ như
 * bản trước), mắt to tròn, mỏ nhỏ nhọn, CÁNH XOÈ NHIỀU LỚP LÔNG (2 dải
 * lông so le, mép lượn sóng — không phải 1 khối cong trơn như bản trước),
 * ĐUÔI XOÈ NHIỀU SỢI LÔNG,
 * QUAN TRỌNG (chỉnh lại lần 6 — "vị trí chân/cánh chưa cân đối"):
 * 1. Cánh trên/dưới trước đây neo ở 2 ĐIỂM KHÁC NHAU (52,42) và (54,38) —
 *    nhìn như 2 cánh mọc lệch nhau thay vì cùng 1 vai. Giờ NEO CHUNG 1
 *    điểm vai (55,40), chỉ khác góc xoay ban đầu — đúng giải phẫu chim
 *    thật (1 vai, 1 cánh gập/mở theo góc, không phải 2 cánh rời nhau).
 * 2. Chân trước lệch về phía đuôi (x quanh 41-49, lệch trái so với tâm
 *    bụng 48) — giờ dời về ĐÚNG GIỮA BỤNG, dáng gập gối rõ (đùi ngắn ẩn
 *    trong lông bụng, ống chân gập ra sau), thêm 3 ngón chân nhỏ ở cuối
 *    mỗi chân cho đúng dáng chân chim thật.
 * Vẫn giữ 1 màu currentColor + độ trong mờ (opacity) để tạo lớp, đúng
 * phong cách line-art thanh lịch của trang.
 */
const props = defineProps<{ landed?: boolean }>()
</script>

<template>
  <svg
    viewBox="-15 -15 130 100"
    class="lotus-bird"
    :class="{ 'is-landed': props.landed }"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Đuôi — xoè nhiều sợi lông -->
    <g fill="currentColor" fill-opacity="0.35">
      <path d="M28,44 L6,36 L14,43 L5,47 L15,50 L7,57 L28,48 Z" />
    </g>

    <!-- Cánh dưới — neo CHUNG 1 vai với cánh trên -->
    <g transform="translate(55,40) rotate(18) scale(1.1)">
      <g class="lotus-bird-wing lotus-bird-wing--lower">
        <path
          d="M0,0 C-8,7 -20,10 -34,8 C-28,5.5 -24,7 -19,4.5 C-15,7 -10,4.8 -6,6.6 C-3,3.6 -1.5,2 0,0 Z"
          fill="currentColor"
          fill-opacity="0.28"
        />
        <path
          d="M0,0 C-6,4.5 -14,6.5 -23,5.5 C-18,3.6 -15,4.6 -11.5,3 C-8,4.4 -5,3 0,0 Z"
          fill="currentColor"
          fill-opacity="0.4"
        />
      </g>
    </g>

    <!-- Cánh trên — cùng vai với cánh dưới, chỉ khác góc mở -->
    <g transform="translate(55,40) rotate(-8) scale(1.1)">
      <g class="lotus-bird-wing lotus-bird-wing--upper">
        <path
          d="M0,0 C-10,-10 -24,-16 -40,-15 C-33,-11 -28,-12.5 -22,-9 C-17,-12.5 -12,-9.5 -7,-11.5 C-4,-7.5 -2,-4 0,0 Z"
          fill="currentColor"
          fill-opacity="0.32"
        />
        <path
          d="M0,0 C-7,-7 -17,-11.5 -28,-11 C-23,-7.8 -19.5,-9 -15,-6.3 C-11.5,-8.7 -8,-6.5 0,0 Z"
          fill="currentColor"
          fill-opacity="0.46"
        />
      </g>
    </g>

    <!-- Chân — dời về đúng giữa bụng, gập gối rõ + 3 ngón chân nhỏ -->
    <g stroke="currentColor" stroke-opacity="0.5" stroke-width="1" stroke-linecap="round" fill="none">
      <path d="M45,57 Q44,62 46,66" />
      <path d="M46,66 L43,69 M46,66 L46.5,69.4 M46,66 L49,68.6" />
      <path d="M51,57 Q52,62 50,66" />
      <path d="M50,66 L47,68.6 M50,66 L50.5,69.4 M50,66 L53.5,69" />
    </g>

    <!-- Thân — thon lại (trước mập tròn rx=20, giờ rx=13) -->
    <ellipse cx="48" cy="46" rx="13" ry="16" fill="currentColor" fill-opacity="0.4" />

    <!-- Đầu — khớp bán kính thân (r=13, trước to hơn hẳn thân gây lệch tỉ lệ) -->
    <circle cx="66" cy="24" r="13" fill="currentColor" fill-opacity="0.45" />

    <!-- Mỏ nhỏ nhọn -->
    <path d="M74.4,21.7 L82.8,23.6 L74.4,26.3 Z" fill="currentColor" fill-opacity="0.65" />

    <!-- Mắt to tròn -->
    <circle cx="68.3" cy="20.2" r="3.5" fill="currentColor" fill-opacity="0.92" />
    <circle cx="69.3" cy="19" r="1" fill="currentColor" fill-opacity="0" stroke="currentColor" stroke-opacity="0.9" stroke-width="0.8" />
  </svg>
</template>

<style scoped>
.lotus-bird-wing {
  transform-origin: 0 0;
  animation: bird-flap 0.55s ease-in-out infinite;
}
.lotus-bird-wing--lower {
  animation-name: bird-flap-lower;
}
.lotus-bird-wing--upper {
  animation-name: bird-flap-upper;
}

/* Kết hợp rotate (quét lên/xuống quanh vai) + scaleY co lại ở đỉnh nhịp
   đập -> mô phỏng cánh xoay nghiêng dần trong không gian. Thêm điểm dừng
   trung gian (25%/75%) thay vì chỉ 0-50-100 -> đường chuyển động cong mượt
   hơn (gần giống sóng sin thật) thay vì cảm giác "giật" qua 1 điểm giữa. */
@keyframes bird-flap-upper {
  0%,
  100% {
    transform: rotate(0deg) scaleY(1);
  }
  25% {
    transform: rotate(-14deg) scaleY(0.92);
  }
  50% {
    transform: rotate(-32deg) scaleY(0.72);
  }
  75% {
    transform: rotate(-14deg) scaleY(0.92);
  }
}
@keyframes bird-flap-lower {
  0%,
  100% {
    transform: rotate(0deg) scaleY(1);
  }
  25% {
    transform: rotate(14deg) scaleY(0.92);
  }
  50% {
    transform: rotate(32deg) scaleY(0.72);
  }
  75% {
    transform: rotate(14deg) scaleY(0.92);
  }
}

.lotus-bird.is-landed .lotus-bird-wing {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .lotus-bird-wing {
    animation: none;
  }
}
</style>
