<script setup lang="ts">
/**
 * 1 cánh hoa nhỏ tách khỏi hoa mẹ khi hover — biến thể "hiếm" của hiệu ứng
 * hover hoa sen (spec.md mục rà soát hoa/lá), KHÔNG phải mỗi lần hover đều
 * chạy (component cha tự quyết định khi nào bật qua điều kiện tần suất +
 * hạn mức thời gian, xem `LotusFlower.vue`/`LotusFlowerTop.vue`).
 *
 * Tái dùng hình cánh giống `FallingPetal.vue` (ao sen) để nhất quán hình
 * ảnh xuyên suốt site, nhưng animation CHẠY 1 LẦN rồi tự ẩn (không lặp vô
 * hạn như hiệu ứng nền) — đây là phản ứng rời rạc theo hành động hover.
 *
 * QUAN TRỌNG (tránh đúng lỗi đã gặp ở `LotusFlowerTop.vue` — bugfix #6b):
 * định vị tĩnh (translate tới đúng điểm trên hoa) và animation (rơi + xoay)
 * PHẢI tách 2 lớp <g>/<path> riêng biệt — nếu gộp chung 1 thẻ vừa có SVG
 * transform tĩnh vừa có CSS animation transform thì CSS sẽ ghi đè mất phần
 * tĩnh, khiến cánh bay lệch khỏi đúng vị trí trên hoa.
 */
withDefaults(
  defineProps<{
    x: number
    y: number
    /** Điểm kết thúc (lệch so với điểm bắt đầu) — mặc định rơi xuống, có thể đổi hướng cho hợp góc nhìn hoa */
    dx?: number
    dy?: number
    rotateEnd?: number
    color: string
  }>(),
  { dx: -5, dy: 42, rotateEnd: 150 }
)
const emit = defineEmits<{ done: [] }>()
</script>

<template>
  <g :transform="`translate(${x} ${y})`">
    <path
      class="lotus-petal-drop"
      d="M0,-4.5 C2.3,-2.3 3.4,1.1 0,5.6 C-3.4,1.1 -2.3,-2.3 0,-4.5 Z"
      :fill="color"
      fill-opacity="0.6"
      :style="{ '--drop-dx': `${dx}px`, '--drop-dy': `${dy}px`, '--drop-rotate': `${rotateEnd}deg` }"
      @animationend="emit('done')"
    />
  </g>
</template>

<style scoped>
.lotus-petal-drop {
  transform-box: fill-box;
  transform-origin: center;
  animation: lotus-petal-drop 1.1s ease-in forwards;
}

@keyframes lotus-petal-drop {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.72;
  }
  100% {
    transform: translate(var(--drop-dx), var(--drop-dy)) rotate(var(--drop-rotate));
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lotus-petal-drop {
    animation: none;
    opacity: 0;
  }
}
</style>
