<script setup lang="ts">
/**
 * Chuồn chuồn line-art — vẽ lại lần 5 theo đúng ảnh tham khảo chủ dự án
 * gửi (chuồn chuồn đậu cành, thân sọc đốt rõ, mắt kép to, cánh có vân
 * lưới, 6 chân rõ):
 * - BỤNG dày hơn hẳn (trước chỉ là 1 nét gạch mảnh) — giờ là 1 khối thon
 *   dài có viền, bên trong có các vạch ngang mô phỏng đốt/sọc rõ như ảnh.
 * - ĐẦU + MẮT to hơn, 2 mắt kép gần chạm đỉnh đầu.
 * - CÁNH có thêm 2 đường vân bên trong mỗi cánh (mô phỏng vân lưới cánh
 *   chuồn chuồn thật, trước chỉ là khối đặc không có chi tiết). Lần này
 *   phóng to cánh thêm ×1.4 (giữ nguyên hình dạng, chỉ `scale()` quanh
 *   điểm gắn cánh) + nới `viewBox` rộng hơn hẳn để cánh to không bị cắt.
 * - Bổ sung đủ 3 đôi CHÂN nhỏ co dưới ngực (trước chỉ có 2 nét chân đơn).
 * Vẫn giữ 1 màu currentColor (không tô vàng-đen như ảnh gốc — đã thống
 * nhất với chủ dự án để hợp tông line-art thanh lịch chung của trang).
 */
const props = defineProps<{ landed?: boolean }>()
</script>

<template>
  <svg
    viewBox="-15 -25 165 90"
    class="lotus-dragonfly"
    :class="{ 'is-landed': props.landed }"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Cánh sau — ngắn hơn, xoè rộng hơn về phía đuôi, có vân -->
    <g transform="translate(72,20) rotate(52) scale(1.4)">
      <g class="lotus-dragonfly-wing lotus-dragonfly-wing--back">
        <path d="M0,0 Q14,-5 28,0 Q14,5 0,0 Z" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-opacity="0.32" stroke-width="0.5" />
        <path d="M2,0 Q13,-2.6 24,-0.4 M2,0 Q13,2.6 24,0.4" fill="none" stroke="currentColor" stroke-opacity="0.28" stroke-width="0.35" />
      </g>
    </g>
    <g transform="translate(72,20) rotate(-52) scale(1,-1) scale(1.4)">
      <g class="lotus-dragonfly-wing lotus-dragonfly-wing--back">
        <path d="M0,0 Q14,-5 28,0 Q14,5 0,0 Z" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-opacity="0.32" stroke-width="0.5" />
        <path d="M2,0 Q13,-2.6 24,-0.4 M2,0 Q13,2.6 24,0.4" fill="none" stroke="currentColor" stroke-opacity="0.28" stroke-width="0.35" />
      </g>
    </g>

    <!-- Cánh trước — dài hơn, áp sát thân hơn, có vân -->
    <g transform="translate(79,20) rotate(16) scale(1.4)">
      <g class="lotus-dragonfly-wing lotus-dragonfly-wing--front">
        <path d="M0,0 Q20,-5.6 40,0 Q20,5.6 0,0 Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-opacity="0.42" stroke-width="0.5" />
        <path d="M3,0 Q19,-3.4 35,-0.6 M3,0 Q19,3.4 35,0.6" fill="none" stroke="currentColor" stroke-opacity="0.32" stroke-width="0.35" />
      </g>
    </g>
    <g transform="translate(79,20) rotate(-16) scale(1,-1) scale(1.4)">
      <g class="lotus-dragonfly-wing lotus-dragonfly-wing--front">
        <path d="M0,0 Q20,-5.6 40,0 Q20,5.6 0,0 Z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-opacity="0.42" stroke-width="0.5" />
        <path d="M3,0 Q19,-3.4 35,-0.6 M3,0 Q19,3.4 35,0.6" fill="none" stroke="currentColor" stroke-opacity="0.32" stroke-width="0.35" />
      </g>
    </g>

    <!-- 3 đôi chân nhỏ, co dưới ngực -->
    <g stroke="currentColor" stroke-opacity="0.5" stroke-width="0.75" stroke-linecap="round" fill="none">
      <path d="M76,24 Q74,29 70,31" />
      <path d="M79,25 Q77,31.5 73,35" />
      <path d="M82,25.4 Q80,32.5 76,37" />
    </g>

    <!-- Bụng — khối thon dày có viền, sọc đốt rõ (thay vì nét mảnh trước đây) -->
    <path
      d="M4,20 Q20,15.5 40,16.5 Q58,17.3 70,18.5 L70,21.5 Q58,22.7 40,23.5 Q20,24.5 4,20 Z"
      fill="currentColor"
      fill-opacity="0.5"
      stroke="currentColor"
      stroke-opacity="0.7"
      stroke-width="0.6"
    />
    <g stroke="currentColor" stroke-opacity="0.85" stroke-width="0.8" stroke-linecap="round">
      <path d="M12,18.3 L12,21.7" />
      <path d="M20,17.3 L20,22.9" />
      <path d="M29,16.8 L29,23.4" />
      <path d="M38,16.6 L38,23.7" />
      <path d="M47,17 L47,23.4" />
      <path d="M56,17.6 L56,22.6" />
      <path d="M64,18.2 L64,21.9" />
    </g>

    <!-- Ngực (nơi cánh gắn vào) -->
    <ellipse cx="74" cy="20" rx="6.5" ry="5.6" fill="currentColor" fill-opacity="0.78" />

    <!-- Đầu + mắt kép — to, gần chạm nhau -->
    <ellipse cx="90" cy="20" rx="9.5" ry="8" fill="currentColor" fill-opacity="0.38" stroke="currentColor" stroke-opacity="0.5" stroke-width="0.5" />
    <circle cx="88" cy="15.6" r="5.4" fill="currentColor" fill-opacity="0.92" />
    <circle cx="88" cy="24.4" r="5.4" fill="currentColor" fill-opacity="0.92" />
  </svg>
</template>

<style scoped>
.lotus-dragonfly-wing {
  transform-origin: 0 0;
  animation: dragonfly-flap-3d 0.6s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  will-change: transform;
}
.lotus-dragonfly-wing--back {
  animation-delay: -0.15s;
}

/* QUAN TRỌNG (chỉnh lại lần 2 — "vỗ cánh chưa mượt"): trước chỉ có 3 điểm
   dừng (0%-50%-100%) -> trình duyệt nội suy tuyến tính giữa 2 đoạn, tạo
   cảm giác cánh "lắc" 2 nhịp cứng thay vì 1 đường cong liên tục. Thêm điểm
   dừng trung gian (25%/75%) + timing riêng dạng cubic-bezier êm (thay
   ease-in-out mặc định hơi đột ngột ở 2 đầu) -> đường xoay mượt như 1
   đường sin thật, không còn khựng giữa nhịp. Chậm thêm chút (0.5s -> 0.6s)
   để mắt theo kịp chuyển động mượt. */
@keyframes dragonfly-flap-3d {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-7deg);
  }
  50% {
    transform: rotate(-16deg);
  }
  75% {
    transform: rotate(-7deg);
  }
}

.lotus-dragonfly.is-landed .lotus-dragonfly-wing {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .lotus-dragonfly-wing {
    animation: none;
  }
}
</style>
