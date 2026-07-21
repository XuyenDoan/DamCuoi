<script setup lang="ts">
/**
 * Bông sen nhìn NGHIÊNG, nhiều lớp cánh tô gradient hồng — vẽ theo tranh màu
 * nước mẫu (spec.md mục 5): cánh hồng đậm ở chóp nhạt dần về gốc, có gân cánh
 * mảnh cho chân thật, đài xanh ở chân hoa, nhuỵ vàng lộ ra khi nở.
 *
 * bloomProgress: 0 = búp khép (cánh chụm thẳng đứng), 1 = nở hết cỡ.
 * Hiệu ứng "slow-motion": MỖI CÁNH có mốc bắt đầu (stagger) và thời lượng
 * transition riêng, nên khi cuộn trang các cánh lệch nhịp nhau như video nở chậm.
 *
 * `isHovering` (mặc định false, truyền TỪ NGOÀI vào — xem `LotusScene.vue`):
 * bật hover cho hoa "ao sen kể chuyện" chính (2 bông khung viền tĩnh 2 mép
 * màn hình KHÔNG nhận prop này — chủ đích không cạnh tranh với nội dung).
 *
 * QUAN TRỌNG (lý do KHÔNG dùng CSS `:hover`/sự kiện `mouseenter` thẳng trên
 * SVG như cách làm ban đầu): nền hoa sen nằm trong lớp `fixed` phía SAU toàn
 * bộ nội dung trang. Đo thực tế bằng Playwright phát hiện MỌI khối nội dung
 * thật (`<section>`, các `<div>` bọc layout...) tuy trong suốt về màu sắc
 * nhưng vẫn CHIẾM TRỌN vùng nhận sự kiện chuột theo mặc định của trình
 * duyệt (không phải chỉ nơi có chữ/ảnh thật) — nên dù hoa nằm ở "chỗ trống"
 * nhìn bằng mắt, sự kiện hover vẫn bị khối nội dung phía trước chặn mất
 * trước khi tới được nền. Muốn sửa đúng gốc (nới `pointer-events` toàn site)
 * sẽ phải rà lại pointer-events của rất nhiều khối trên toàn bộ trang — rủi
 * ro làm hỏng khả năng bấm của nút/link thật ở nơi khác, không đáng đánh đổi
 * cho 1 chi tiết trang trí. Giải pháp AN TOÀN hơn: `LotusScene.vue` tự theo
 * dõi toạ độ chuột bằng JS (không đụng `pointer-events` của bất kỳ đâu khác)
 * rồi truyền kết quả xuống qua prop này.
 *
 * Hover có 2 tầng, kích hoạt qua `watch` trên chính prop `isHovering`:
 * - Phản ứng CHÍNH (luôn xảy ra khi `isHovering` bật): hoa xoè nhẹ + nhuỵ
 *   sáng lên — gộp chung vì ăn khớp tự nhiên (hoa "sống động" hơn khi được
 *   chú ý), điều khiển thẳng bằng class CSS theo prop, không cần JS riêng.
 * - Phản ứng HIẾM (không phải lần nào cũng có, có hạn mức thời gian giữa 2
 *   lần liên tiếp): rụng 1 cánh nhỏ (`LotusPetalDrop.vue`) — tránh hoa bị
 *   "vặt trụi" nếu người dùng di chuột qua lại nhiều lần.
 */
const props = withDefaults(defineProps<{ bloomProgress?: number; isHovering?: boolean }>(), {
  bloomProgress: 1,
  isHovering: false
})

const showDroppedPetal = ref(false)
const onCooldown = ref(false)
const DROP_CHANCE = 0.35
const COOLDOWN_MS = 25000
let cooldownTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.isHovering,
  (hovering) => {
    if (!hovering || onCooldown.value) return
    if (Math.random() > DROP_CHANCE) return
    showDroppedPetal.value = true
    onCooldown.value = true
    cooldownTimer = setTimeout(() => {
      onCooldown.value = false
    }, COOLDOWN_MS)
  }
)

onBeforeUnmount(() => {
  if (cooldownTimer) clearTimeout(cooldownTimer)
})

const uid = (useId() ?? 'lf').replace(/[^\w-]/g, '')

interface Petal {
  angle: number
  len: number
  layer: 0 | 1 | 2 | 3
  stagger: number
  dur: number
}

// 18 cánh, 4 lớp — dày dặn, chân thật hơn bản 12 cánh
const petals: Petal[] = [
  // Lớp sau cùng — xoè rộng nhất, mở trước
  { angle: -78, len: 0.82, layer: 0, stagger: 0.0, dur: 950 },
  { angle: -50, len: 0.95, layer: 0, stagger: 0.06, dur: 1050 },
  { angle: -20, len: 1.04, layer: 0, stagger: 0.03, dur: 900 },
  { angle: 20, len: 1.04, layer: 0, stagger: 0.09, dur: 1000 },
  { angle: 50, len: 0.95, layer: 0, stagger: 0.02, dur: 1120 },
  { angle: 78, len: 0.82, layer: 0, stagger: 0.11, dur: 880 },
  // Lớp giữa-ngoài
  { angle: -60, len: 0.88, layer: 1, stagger: 0.14, dur: 1000 },
  { angle: -33, len: 0.98, layer: 1, stagger: 0.2, dur: 1100 },
  { angle: 0, len: 1.02, layer: 1, stagger: 0.16, dur: 950 },
  { angle: 33, len: 0.98, layer: 1, stagger: 0.23, dur: 1050 },
  { angle: 60, len: 0.88, layer: 1, stagger: 0.12, dur: 1150 },
  // Lớp giữa-trong
  { angle: -42, len: 0.82, layer: 2, stagger: 0.27, dur: 1050 },
  { angle: -14, len: 0.9, layer: 2, stagger: 0.33, dur: 1150 },
  { angle: 14, len: 0.9, layer: 2, stagger: 0.29, dur: 950 },
  { angle: 42, len: 0.82, layer: 2, stagger: 0.36, dur: 1100 },
  // Lớp trong cùng — ôm nhuỵ, mở sau chót
  { angle: -22, len: 0.72, layer: 3, stagger: 0.44, dur: 1200 },
  { angle: 0, len: 0.76, layer: 3, stagger: 0.5, dur: 1050 },
  { angle: 22, len: 0.72, layer: 3, stagger: 0.4, dur: 1250 }
]

const layerFill = ['back', 'back', 'mid', 'front']

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
function petalProgress(p: Petal): number {
  const raw = (clamp01(props.bloomProgress) - p.stagger) / (1 - p.stagger)
  return easeOutCubic(clamp01(raw))
}
function petalStyle(p: Petal) {
  const pp = petalProgress(p)
  const angle = p.angle * (0.06 + 0.94 * pp)
  const len = p.len * (0.8 + 0.2 * pp)
  return {
    transform: `rotate(${angle.toFixed(2)}deg) scale(${(0.93 + 0.07 * pp).toFixed(3)}, ${len.toFixed(3)})`,
    transformOrigin: '100px 150px',
    transitionDuration: `${p.dur}ms`
  }
}

const podOpacity = computed(() => 0.75 * clamp01((clamp01(props.bloomProgress) - 0.5) / 0.5))
</script>

<template>
  <svg
    viewBox="0 0 200 165"
    class="lotus-flower"
    :class="{ 'lotus-flower--hover': isHovering }"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient :id="`lf-back-${uid}`" gradientUnits="userSpaceOnUse" x1="100" y1="80" x2="100" y2="150">
        <stop offset="0" stop-color="#DB2777" stop-opacity="0.72" />
        <stop offset="0.55" stop-color="#EC4899" stop-opacity="0.5" />
        <stop offset="1" stop-color="#F9A8D4" stop-opacity="0.26" />
      </linearGradient>
      <linearGradient :id="`lf-mid-${uid}`" gradientUnits="userSpaceOnUse" x1="100" y1="80" x2="100" y2="150">
        <stop offset="0" stop-color="#EC4899" stop-opacity="0.66" />
        <stop offset="1" stop-color="#F9A8D4" stop-opacity="0.24" />
      </linearGradient>
      <linearGradient :id="`lf-front-${uid}`" gradientUnits="userSpaceOnUse" x1="100" y1="82" x2="100" y2="150">
        <stop offset="0" stop-color="#F9A8D4" stop-opacity="0.92" />
        <stop offset="1" stop-color="#FBCFE8" stop-opacity="0.22" />
      </linearGradient>
      <!-- Cánh: gốc nhọn ở tâm (100,150), phình giữa, chóp hơi nhọn -->
      <path :id="`lf-petal-${uid}`" d="M100,150 C85,130 82,100 100,82 C118,100 115,130 100,150 Z" />
      <!-- Gân cánh mảnh chạy dọc giữa cánh -->
      <path :id="`lf-vein-${uid}`" d="M100,148 C99,128 99,104 100,86" />
    </defs>

    <!-- Đài hoa xanh ở chân -->
    <path d="M100,150 C93,145 89,134 95,126 C98,135 99,143 100,150 Z" fill="#4D7C5F" opacity="0.42" transform="rotate(-40 100 150)" />
    <path d="M100,150 C107,145 111,134 105,126 C102,135 101,143 100,150 Z" fill="#4D7C5F" opacity="0.42" transform="rotate(40 100 150)" />

    <g v-for="(p, i) in petals" :key="i" class="lotus-petal" :style="petalStyle(p)">
      <use
        :href="`#lf-petal-${uid}`"
        :fill="`url(#lf-${layerFill[p.layer]}-${uid})`"
        stroke="#DB2777"
        stroke-opacity="0.2"
        stroke-width="0.7"
      />
      <use :href="`#lf-vein-${uid}`" fill="none" stroke="#DB2777" stroke-opacity="0.16" stroke-width="0.6" />
    </g>

    <ellipse cx="100" cy="134" rx="8" ry="5" fill="#C9A227" class="lotus-pod" :style="{ opacity: podOpacity }" />

    <LotusPetalDrop
      v-if="showDroppedPetal"
      :x="38"
      :y="128"
      :dx="-8"
      :dy="40"
      :rotate-end="150"
      color="#EC4899"
      @done="showDroppedPetal = false"
    />
  </svg>
</template>

<style scoped>
.lotus-petal {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.22, 0.8, 0.3, 1);
}
.lotus-pod {
  transition: opacity 700ms ease-out, filter 280ms ease-out;
}
.lotus-flower {
  transition: transform 280ms cubic-bezier(0.22, 0.8, 0.3, 1);
}
.lotus-flower--hover {
  transform: scale(1.04);
}
.lotus-flower--hover .lotus-pod {
  filter: drop-shadow(0 0 5px rgba(201, 162, 39, 0.9));
}
@media (prefers-reduced-motion: reduce) {
  .lotus-petal,
  .lotus-pod,
  .lotus-flower {
    transition: none;
  }
  .lotus-flower--hover {
    transform: none;
  }
}
</style>
