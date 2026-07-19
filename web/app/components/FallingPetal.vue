<script setup lang="ts">
/**
 * 1 cánh hoa/lá rơi từ trên xuống mặt nước rồi tạo gợn sóng lõm tõm ngay chỗ
 * rơi trúng — dùng bên trong WaterRipple.vue (yêu cầu "lá hoa rơi lõm tõm").
 * Cấu trúc: wrapper neo CỐ ĐỊNH tại đúng điểm rơi trúng (không di chuyển) —
 * bên trong có 2 phần tử con animate ĐỘC LẬP nhưng CÙNG thời lượng/độ trễ để
 * luôn khớp nhịp: (1) cánh hoa rơi từ phía trên xuống đúng điểm neo rồi biến
 * mất, (2) vòng gợn sóng nằm im vô hình, chỉ phóng to + mờ dần đúng lúc cánh
 * hoa chạm tới (cuối chu kỳ) rồi lặp lại.
 */
const props = defineProps<{
  left: string
  landTop: string
  size: number
  fallDistance: string
  duration: string
  delay: string
  tone: 'text-secondary' | 'text-secondary-light' | 'text-primary-light'
}>()
</script>

<template>
  <div
    class="falling-petal-wrap pointer-events-none absolute"
    :style="{ left: props.left, top: props.landTop }"
  >
    <div
      class="falling-petal-drop absolute"
      :class="props.tone"
      :style="{
        width: `${props.size}rem`,
        height: `${props.size}rem`,
        animationDuration: props.duration,
        animationDelay: props.delay,
        '--fall-distance': props.fallDistance
      }"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10,1 C15,5 17,10 10,19 C3,10 5,5 10,1 Z" fill="currentColor" fill-opacity="0.55" />
      </svg>
    </div>
    <div
      class="falling-petal-splash absolute rounded-full border"
      :class="props.tone"
      :style="{
        width: `${props.size * 2.2}rem`,
        height: `${props.size * 2.2}rem`,
        animationDuration: props.duration,
        animationDelay: props.delay
      }"
    />
  </div>
</template>

<style scoped>
.falling-petal-drop {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) translateY(var(--fall-distance, -30vh));
  animation-name: petal-fall;
  animation-timing-function: ease-in;
  animation-iteration-count: infinite;
}

@keyframes petal-fall {
  0% {
    transform: translate(-50%, -50%) translateY(var(--fall-distance)) rotate(0deg);
    opacity: 0.9;
  }
  92% {
    transform: translate(-50%, -50%) translateY(0) rotate(200deg);
    opacity: 0.9;
  }
  97% {
    transform: translate(-50%, -50%) translateY(4px) rotate(210deg);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) translateY(4px) rotate(210deg);
    opacity: 0;
  }
}

.falling-petal-splash {
  left: 50%;
  top: 50%;
  border-width: 1.5px;
  transform: translate(-50%, -50%) scale(0.2);
  opacity: 0;
  animation-name: petal-splash;
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
}

@keyframes petal-splash {
  0%,
  90% {
    transform: translate(-50%, -50%) scale(0.2);
    opacity: 0;
  }
  93% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.6;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.6);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .falling-petal-drop,
  .falling-petal-splash {
    animation: none;
    opacity: 0;
  }
}
</style>
