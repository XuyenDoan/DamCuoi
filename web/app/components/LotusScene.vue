<script setup lang="ts">
/**
 * Khung cảnh ao sen làm nền TOÀN TRANG khi 1 trang chưa có ảnh nền riêng
 * (PageBackdrop.vue). Bố cục theo tranh màu nước mẫu + các lần chỉnh yêu cầu:
 * - Hoa TO, rải KHẮP trang (trên/giữa/dưới), không chỉ ở đáy.
 * - Trộn 2 góc nhìn: bông nhìn NGHIÊNG mọc trên cuống (LotusFlower) + bông
 *   nhìn TỪ TRÊN XUỐNG trôi nổi như trên mặt nước (LotusFlowerTop).
 * - MỖI BÔNG đều có 1 lá sen đi kèm ngay dưới/cạnh nó (yêu cầu chỉnh lần 5) —
 *   lá gắn liền theo từng bông thay vì rải độc lập, tránh chồng lấn vô lý.
 * - Đã bỏ 2 bông nhỏ từng nằm sát mép trái/phải gây chồng lấn với lá có sẵn
 *   (yêu cầu chỉnh lần 5 — không tìm được vị trí hợp lý hơn nên xoá theo đúng
 *   phương án dự phòng chủ dự án cho phép).
 *
 * Hành vi: lúc tải trang chỉ vài bông (có bông còn búp); cuộn xuống thì thêm
 * bông hiện dần và nở dần — mỗi bông có cửa sổ nở riêng, bên trong từng cánh
 * lại lệch nhịp (slow-motion) nên không bao giờ nở đồng loạt.
 */
const props = defineProps<{ progress: number }>()

interface LeafSpec {
  left: string
  bottom?: string
  top?: string
  size: number
  tone: 'text-secondary' | 'text-secondary-light'
}

interface SideFlower {
  kind: 'side'
  left: string
  bottom: string
  size: number
  stemHeight: string
  stemCurve: number
  appearAt: number
  bloomStart: number
  bloomEnd: number
  leaf: LeafSpec
}
interface TopFlower {
  kind: 'top'
  left: string
  top: string
  size: number
  appearAt: number
  bloomStart: number
  bloomEnd: number
  leaf: LeafSpec
}
type Flower = SideFlower | TopFlower

const flowers: Flower[] = [
  // --- Thấy ngay lúc tải trang (appearAt = 0) ---
  {
    kind: 'side',
    left: '2%',
    bottom: '0',
    size: 2.4,
    stemHeight: '18vh',
    stemCurve: -0.4,
    appearAt: 0,
    bloomStart: -0.7,
    bloomEnd: 0.2,
    leaf: { left: '0%', bottom: '-4vh', size: 3.0, tone: 'text-secondary' }
  },
  {
    kind: 'top',
    left: '58%',
    top: '12%',
    size: 2.2,
    appearAt: 0,
    bloomStart: -0.15,
    bloomEnd: 0.5,
    leaf: { left: '52%', top: '27%', size: 2.0, tone: 'text-secondary-light' }
  },

  // --- Hiện dần khi cuộn ---
  {
    kind: 'top',
    left: '14%',
    top: '6%',
    size: 1.3,
    appearAt: 0.18,
    bloomStart: 0.16,
    bloomEnd: 0.62,
    leaf: { left: '9%', top: '20%', size: 1.5, tone: 'text-secondary-light' }
  },
  {
    kind: 'side',
    left: '40%',
    bottom: '30vh',
    size: 2.0,
    stemHeight: '14vh',
    stemCurve: 0.4,
    appearAt: 0.24,
    bloomStart: 0.24,
    bloomEnd: 0.64,
    leaf: { left: '35%', bottom: '26vh', size: 1.8, tone: 'text-secondary-light' }
  },
  {
    kind: 'top',
    left: '81%',
    top: '40%',
    size: 1.7,
    appearAt: 0.36,
    bloomStart: 0.4,
    bloomEnd: 0.86,
    leaf: { left: '76%', top: '52%', size: 1.7, tone: 'text-secondary' }
  },
  {
    kind: 'side',
    left: '68%',
    bottom: '0',
    size: 2.2,
    stemHeight: '22vh',
    stemCurve: -0.45,
    appearAt: 0.5,
    bloomStart: 0.5,
    bloomEnd: 0.9,
    leaf: { left: '65%', bottom: '-3vh', size: 2.4, tone: 'text-secondary' }
  },
  {
    kind: 'top',
    left: '34%',
    top: '68%',
    size: 1.4,
    appearAt: 0.6,
    bloomStart: 0.62,
    bloomEnd: 1,
    leaf: { left: '29%', top: '78%', size: 1.6, tone: 'text-secondary-light' }
  },
  {
    kind: 'top',
    left: '72%',
    top: '4%',
    size: 1.15,
    appearAt: 0.8,
    bloomStart: 0.82,
    bloomEnd: 1,
    leaf: { left: '68%', top: '15%', size: 1.4, tone: 'text-secondary-light' }
  }
]

const APPEAR_SPAN = 0.18

function fadeOpacity(appearAt: number): number {
  return Math.min(1, Math.max(0, (props.progress - (appearAt - APPEAR_SPAN)) / APPEAR_SPAN))
}
function bloomOf(f: Flower): number {
  if (f.bloomEnd <= f.bloomStart) return 1
  return Math.min(1, Math.max(0, (props.progress - f.bloomStart) / (f.bloomEnd - f.bloomStart)))
}
function stemPath(curve: number): string {
  const dx = 13 * curve
  return `M20,0 C${20 + dx},33 ${20 - dx},66 20,100`
}

/**
 * QUAN TRỌNG (bugfix responsive — mục 1 nâng cấp): kích thước hoa/lá trước đây
 * tính thẳng bằng `rem` cố định (VD lá to nhất `3.0 * 9 = 27rem` ≈ 432px) —
 * trên màn hình mobile 375px, riêng 1 chiếc lá đã RỘNG HƠN CẢ MÀN HÌNH, bị lớp
 * `overflow-hidden` cha cắt xén thô dù không tạo thanh cuộn ngang (phần tử nằm
 * trong `fixed` nên không cộng vào `scrollWidth` của trang — không phải bug
 * "vỡ layout" theo nghĩa scroll ngang, nhưng vẫn là lỗi thị giác thật, đã xác
 * nhận bằng đo `getBoundingClientRect()` thực tế ở viewport 375px).
 * Khắc phục: dùng CSS `min(REMrem, VWvw)` — trên màn hình hẹp, `vw` nhỏ hơn
 * nên áp dụng, hoa/lá tự thu nhỏ theo tỉ lệ màn hình; trên desktop `vw` lớn
 * hơn `rem` nên áp dụng đúng kích thước gốc đã thiết kế, không đổi gì.
 */
function clampSize(remMultiplier: number, vwMultiplier: number): string {
  return `min(${remMultiplier.toFixed(2)}rem, ${vwMultiplier.toFixed(2)}vw)`
}
</script>

<template>
  <div class="absolute inset-0 overflow-hidden">
    <template v-for="(f, i) in flowers" :key="`flower-${i}`">
      <!-- Lá sen đi kèm — render TRƯỚC bông (nằm dưới/sau về mặt xếp lớp) -->
      <div
        class="lotus-scene-item absolute"
        :class="f.leaf.tone"
        :style="{
          left: f.leaf.left,
          bottom: f.leaf.bottom,
          top: f.leaf.top,
          width: clampSize(f.leaf.size * 9, f.leaf.size * 10),
          opacity: fadeOpacity(f.appearAt) * 0.5
        }"
      >
        <LotusLeaf />
      </div>

      <!-- Nhìn nghiêng: neo đáy, có cuống -->
      <div
        v-if="f.kind === 'side'"
        class="lotus-scene-item absolute flex flex-col items-center"
        :style="{ left: f.left, bottom: f.bottom, opacity: fadeOpacity(f.appearAt) }"
      >
        <LotusFlower
          :bloom-progress="bloomOf(f)"
          class="-mb-2"
          :style="{ width: clampSize(f.size * 6, f.size * 10), height: clampSize(f.size * 4.9, f.size * 8.17) }"
        />
        <svg
          viewBox="0 0 40 100"
          preserveAspectRatio="none"
          class="w-8 text-secondary"
          :style="{ height: f.stemHeight }"
          aria-hidden="true"
        >
          <path
            :d="stemPath(f.stemCurve)"
            fill="none"
            stroke="currentColor"
            stroke-opacity="0.4"
            stroke-width="1.7"
            vector-effect="non-scaling-stroke"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <!-- Nhìn từ trên xuống: trôi nổi ở nhiều độ cao -->
      <div
        v-else
        class="lotus-scene-item absolute"
        :style="{ left: f.left, top: f.top, opacity: fadeOpacity(f.appearAt) }"
      >
        <LotusFlowerTop
          :bloom-progress="bloomOf(f)"
          :style="{ width: clampSize(f.size * 6, f.size * 10), height: clampSize(f.size * 6, f.size * 10) }"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.lotus-scene-item {
  transition: opacity 700ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .lotus-scene-item {
    transition: none;
    opacity: 1 !important;
  }
}
</style>
