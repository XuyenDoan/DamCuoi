<script setup lang="ts">
/**
 * Hoạ tiết hoa sen line-art — chi tiết bản sắc riêng theo spec.md mục 5.
 * 3 chế độ:
 * - Mặc định (tĩnh): dùng làm watermark nền (qua LotusWatermark) hoặc icon nhỏ.
 * - animated: khoảnh khắc "nở hoa" một lần khi mount (login, empty state...).
 * - bloomProgress (0-1): búp hoa co lại ở 0, nở dần theo giá trị truyền vào
 *   (điều khiển bởi LotusScene.vue theo vị trí cuộn trang — mục 8/15.2).
 * `filled`: tô mềm thay vì chỉ viền, dùng cho khung cảnh nhiều hoa (LotusScene)
 * để có cảm giác mềm mại kiểu tranh màu nước hơn là line-art thuần.
 */
const props = withDefaults(
  defineProps<{
    animated?: boolean
    bloomProgress?: number
    filled?: boolean
  }>(),
  { animated: false, bloomProgress: undefined, filled: false }
)

const outerAngles = [0, 45, 90, 135, 180, 225, 270, 315]
const innerAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5]

const isBloomMode = computed(() => props.bloomProgress !== undefined)

// Búp (co gần tâm) -> nở hết cỡ, base cánh hoa đã nằm sẵn ở tâm (100,100)
// nên chỉ cần scale từ tâm là ra đúng hình búp khép/nở tự nhiên.
const bloomScale = computed(() => {
  const p = Math.min(1, Math.max(0, props.bloomProgress ?? 1))
  return 0.18 + 0.82 * p
})

function bloomStyle(angle: number) {
  return {
    transform: `rotate(${angle}deg) scale(${bloomScale.value})`,
    transformOrigin: '100px 100px'
  }
}
</script>

<template>
  <svg
    viewBox="0 0 200 200"
    :fill="filled ? 'currentColor' : 'none'"
    :fill-opacity="filled ? 0.55 : 1"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lotus-motif"
    :class="{ 'lotus-motif--animated': animated && !isBloomMode, 'lotus-motif--bloom': isBloomMode }"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <path id="lotus-outer-petal" d="M100,100 C82,78 80,35 100,12 C120,35 118,78 100,100 Z" />
      <path id="lotus-inner-petal" d="M100,100 C90,85 88,60 100,50 C112,60 110,85 100,100 Z" />
    </defs>

    <template v-if="isBloomMode">
      <use
        v-for="angle in outerAngles"
        :key="`outer-${angle}`"
        href="#lotus-outer-petal"
        :style="bloomStyle(angle)"
      />
      <use
        v-for="angle in innerAngles"
        :key="`inner-${angle}`"
        href="#lotus-inner-petal"
        :style="bloomStyle(angle)"
      />
      <circle cx="100" cy="100" r="7" />
    </template>

    <template v-else>
      <use
        v-for="(angle, i) in outerAngles"
        :key="`outer-${angle}`"
        href="#lotus-outer-petal"
        :transform="`rotate(${angle} 100 100)`"
        :style="{ '--lotus-delay': `${i * 90}ms` }"
      />
      <use
        v-for="(angle, i) in innerAngles"
        :key="`inner-${angle}`"
        href="#lotus-inner-petal"
        :transform="`rotate(${angle} 100 100)`"
        :style="{ '--lotus-delay': `${640 + i * 70}ms` }"
      />
      <circle cx="100" cy="100" r="7" :style="{ '--lotus-delay': '1300ms' }" />
    </template>
  </svg>
</template>

<style scoped>
.lotus-motif--animated use,
.lotus-motif--animated circle {
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  opacity: 0;
  animation:
    lotus-draw 900ms ease-out forwards,
    lotus-fade-in 200ms ease-out forwards;
  animation-delay: var(--lotus-delay, 0ms);
}

/* Nội suy mượt giữa các lần cập nhật scroll (rAF-throttled) thay vì nhảy khựng */
.lotus-motif--bloom use {
  transition: transform 260ms cubic-bezier(0.33, 1, 0.68, 1);
}

@keyframes lotus-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes lotus-fade-in {
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lotus-motif--animated use,
  .lotus-motif--animated circle {
    animation: none;
    opacity: 1;
    stroke-dashoffset: 0;
  }
  .lotus-motif--bloom use {
    transition: none;
  }
}
</style>
