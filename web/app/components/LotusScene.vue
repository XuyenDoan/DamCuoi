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

/**
 * Lá sen — vị trí giờ tính TƯƠNG ĐỐI so với chính bông hoa (không còn toạ độ
 * left/top độc lập như trước) — xem giải thích chi tiết ở khối template.
 * - `offsetX`: lệch ngang so với tâm bông (%, âm = lệch trái) — tạo đa dạng
 *   tự nhiên, tránh mọi bông đều có lá đối xứng tăm tắp giống hệt nhau.
 * - `rotate`: xoay nhẹ (độ) cho lá trông tự nhiên hơn, không phẳng lì.
 */
interface LeafSpec {
  /** Chỉ dùng cho lá của bông SIDE (bông TOP tự tính theo topLeafSize) */
  size?: number
  tone: 'text-secondary' | 'text-secondary-light'
  offsetX?: number
  rotate?: number
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
    bottom: '19vh',
    size: 2.4,
    stemHeight: '18vh',
    stemCurve: -0.4,
    appearAt: 0,
    bloomStart: -0.7,
    bloomEnd: 0.2,
    leaf: { size: 3.0, tone: 'text-secondary', offsetX: -12, rotate: -6 }
  },
  {
    kind: 'top',
    left: '58%',
    top: '12%',
    size: 2.2,
    appearAt: 0,
    bloomStart: -0.15,
    bloomEnd: 0.5,
    leaf: { tone: 'text-secondary-light' }
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
    leaf: { tone: 'text-secondary-light' }
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
    leaf: { size: 1.8, tone: 'text-secondary-light', offsetX: 14, rotate: 8 }
  },
  {
    kind: 'top',
    left: '81%',
    top: '40%',
    size: 1.7,
    appearAt: 0.36,
    bloomStart: 0.4,
    bloomEnd: 0.86,
    leaf: { tone: 'text-secondary' }
  },
  {
    kind: 'side',
    left: '68%',
    bottom: '17vh',
    size: 2.2,
    stemHeight: '22vh',
    stemCurve: -0.45,
    appearAt: 0.5,
    bloomStart: 0.5,
    bloomEnd: 0.9,
    leaf: { size: 2.4, tone: 'text-secondary', offsetX: -10, rotate: -9 }
  },
  {
    kind: 'top',
    left: '34%',
    top: '68%',
    size: 1.4,
    appearAt: 0.6,
    bloomStart: 0.62,
    bloomEnd: 1,
    leaf: { tone: 'text-secondary-light' }
  },
  {
    kind: 'top',
    left: '72%',
    top: '4%',
    size: 1.15,
    appearAt: 0.8,
    bloomStart: 0.82,
    bloomEnd: 1,
    leaf: { tone: 'text-secondary-light' }
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

/** Tăng nhẹ kích thước toàn bộ hoa + lá theo yêu cầu ("tăng kích thước hoa sen lên xíu") */
const FLOWER_SCALE = 1.18

/**
 * Kích thước lá cho bông nhìn từ trên xuống — luôn tính THEO TỈ LỆ với kích
 * thước chính bông hoa đó (thay vì 1 con số cố định độc lập như trước), để
 * lá luôn "ló" ra quanh mép hoa đúng 1 tỉ lệ nhất quán dù bông to hay nhỏ —
 * đúng hình ảnh hoa sen nổi trên lá thật (lá luôn to hơn hoa 1 chút).
 */
function topLeafSize(f: TopFlower): number {
  return f.size * 0.9
}

/**
 * Chuồn chuồn/chim — bay theo mô phỏng vật lý thật (né hoa/lá, né mặt
 * nước, né va chạm nhau, thỉnh thoảng bay tới đậu đúng 1 bông hoa) thay vì
 * đường bay CSS @keyframes cố định trước đây — xem `useCreatureFlight.ts`.
 * Chướng ngại vật = chính các bông hoa trong mảng `flowers` ở trên, quy đổi
 * toạ độ % + bán kính né theo kích thước từng bông.
 */
const flowerObstacles: FlightObstacle[] = flowers.map((f) => ({
  x: parseFloat(f.left),
  y: f.kind === 'top' ? parseFloat(f.top) : 100 - parseFloat(f.bottom),
  r: f.size * FLOWER_SCALE * 5
}))

/** Mép trên vùng nước (WaterRipple cao 42vh từ đáy -> né từ % này trở xuống) */
const WATER_TOP_PERCENT = 58

const flightConfigs: FlightCreatureConfig[] = [
  { id: 'dragonfly-1', kind: 'dragonfly', tone: 'text-gold', size: 1.3, collisionRadius: 4.4, startX: 10, startY: 46 },
  { id: 'dragonfly-2', kind: 'dragonfly', tone: 'text-secondary', size: 1.05, collisionRadius: 3.8, startX: 88, startY: 30 },
  { id: 'dragonfly-3', kind: 'dragonfly', tone: 'text-gold', size: 1.15, collisionRadius: 4, startX: 48, startY: 20 },
  { id: 'dragonfly-4', kind: 'dragonfly', tone: 'text-secondary', size: 1.1, collisionRadius: 3.9, startX: 25, startY: 38 },
  { id: 'dragonfly-5', kind: 'dragonfly', tone: 'text-gold', size: 1.0, collisionRadius: 3.6, startX: 70, startY: 25 },
  // Chim vẽ nhỏ lại theo phản hồi — thu size + bán kính né tương ứng
  { id: 'bird-1', kind: 'bird', tone: 'text-secondary', size: 1.0, collisionRadius: 6.2, startX: 20, startY: 15 },
  { id: 'bird-2', kind: 'bird', tone: 'text-gold', size: 0.9, collisionRadius: 5.6, startX: 76, startY: 10 },
  { id: 'bird-3', kind: 'bird', tone: 'text-secondary', size: 0.95, collisionRadius: 5.9, startX: 55, startY: 22 }
]

const { creatures: flyingCreatures } = useCreatureFlight(flightConfigs, flowerObstacles, WATER_TOP_PERCENT)
const dragonflyCreatures = computed(() => flyingCreatures.filter((c) => c.kind === 'dragonfly'))
const birdCreatures = computed(() => flyingCreatures.filter((c) => c.kind === 'bird'))

/**
 * Hướng hiển thị của chuồn chuồn/chim — SỬA LỖI "bay lật ngược": trước đây
 * dùng thẳng `rotate(toDeg(angle))` theo đúng hướng bay thực (atan2), nghĩa
 * là khi bay hướng lên/xuống gần thẳng đứng hoặc quay đầu bay ngược lại,
 * cả hình xoay tới ~90-270° khiến hình trông LẬT NGƯỢC (bụng quay lên
 * trời) — vì hình vẽ 2D nhìn nghiêng không có "mặt sau", chỉ có thể XOAY
 * PHẲNG (yaw) bằng cách LẬT NGANG (mirror trái/phải), không thể xoay tới
 * mọi góc như vật thể 3D thật. Khắc phục: tách hướng bay thành 2 phần —
 * (1) quay đầu trái/phải -> lật ngang bằng `scaleX(-1)`, (2) độ dốc lên/
 * xuống -> chỉ NGHIÊNG NHẸ (tối đa `MAX_TILT_DEG`) chứ không xoay hết cỡ.
 */
const MAX_TILT_DEG = 26

function isFacingLeft(c: FlightCreatureState): boolean {
  return Math.cos(c.angle) < 0
}
function tiltDeg(c: FlightCreatureState): number {
  const verticalDir = Math.sin(c.angle) // -1..1, âm = đang bay lên (trục y màn hình hướng xuống)
  return (verticalDir < 0 ? -1 : 1) * Math.min(1, Math.abs(verticalDir)) * MAX_TILT_DEG
}
function creatureTransform(c: FlightCreatureState): string {
  return `translate(-50%, -50%) rotate(${tiltDeg(c)}deg) scaleX(${isFacingLeft(c) ? -1 : 1})`
}
</script>

<template>
  <div class="absolute inset-0 overflow-hidden">
    <template v-for="(f, i) in flowers" :key="`flower-${i}`">
      <!-- Nhìn nghiêng: neo đáy, có cuống — lá sen đặt NGAY TẠI GỐC CUỐNG
           (đúng "mặt nước"), hơi lệch ngang + xoay nhẹ mỗi bông để không đều
           tăm tắp, nằm TRÊN (đè lên) đoạn cuống dưới cùng — giống ảnh thật:
           cuống sen mọc xuyên/cạnh 1 tán lá nổi ngay chỗ nó chạm nước. -->
      <div
        v-if="f.kind === 'side'"
        class="lotus-scene-item absolute flex flex-col items-center"
        :style="{ left: f.left, bottom: f.bottom, opacity: fadeOpacity(f.appearAt) }"
      >
        <LotusFlower
          :bloom-progress="bloomOf(f)"
          class="-mb-2"
          :style="{
            width: clampSize(f.size * 6 * FLOWER_SCALE, f.size * 10 * FLOWER_SCALE),
            height: clampSize(f.size * 4.9 * FLOWER_SCALE, f.size * 8.17 * FLOWER_SCALE)
          }"
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
        <div
          class="absolute bottom-0 left-1/2"
          :class="f.leaf.tone"
          :style="{
            width: clampSize((f.leaf.size ?? f.size) * 9 * FLOWER_SCALE, (f.leaf.size ?? f.size) * 10 * FLOWER_SCALE),
            opacity: fadeOpacity(f.appearAt) * 0.5,
            transform: `translate(calc(-50% + ${f.leaf.offsetX ?? 0}%), 60%) rotate(${f.leaf.rotate ?? 0}deg) scaleY(0.42)`
          }"
        >
          <LotusLeaf />
        </div>
      </div>

      <!-- Nhìn từ trên xuống: trôi nổi ở nhiều độ cao — lá sen nằm CĂN GIỮA
           NGAY DƯỚI hoa (cùng tâm), to hơn hoa 1 chút để ló viền lá ra xung
           quanh mép cánh — đúng hình ảnh hoa sen nổi trên lá nhìn từ trên. -->
      <div
        v-else
        class="lotus-scene-item absolute"
        :style="{ left: f.left, top: f.top, opacity: fadeOpacity(f.appearAt) }"
      >
        <div
          class="absolute left-1/2 top-1/2"
          :class="f.leaf.tone"
          :style="{
            width: clampSize(topLeafSize(f) * 9 * FLOWER_SCALE, topLeafSize(f) * 10 * FLOWER_SCALE),
            opacity: fadeOpacity(f.appearAt) * 0.5,
            transform: `translate(-50%, -50%) rotate(${f.leaf.rotate ?? 0}deg)`
          }"
        >
          <LotusLeaf />
        </div>
        <LotusFlowerTop
          :bloom-progress="bloomOf(f)"
          class="relative"
          :style="{
            width: clampSize(f.size * 6 * FLOWER_SCALE, f.size * 10 * FLOWER_SCALE),
            height: clampSize(f.size * 6 * FLOWER_SCALE, f.size * 10 * FLOWER_SCALE)
          }"
        />
      </div>
    </template>

    <!-- Mặt nước — dải gợn sóng trôi ngang rất chậm ở phần dưới màn hình -->
    <WaterRipple />

    <!-- Chuồn chuồn — vị trí/góc quay tính real-time bởi useCreatureFlight (né hoa/lá/nước/nhau) -->
    <div
      v-for="c in dragonflyCreatures"
      :key="c.id"
      class="lotus-dragonfly-wrap absolute opacity-60"
      :class="c.tone"
      :style="{
        left: `${c.x}%`,
        top: `${c.y}%`,
        width: clampSize(c.size * 9, c.size * 11.7),
        transform: creatureTransform(c)
      }"
    >
      <LotusDragonfly :landed="c.landed" />
    </div>

    <!-- Chim -->
    <div
      v-for="c in birdCreatures"
      :key="c.id"
      class="lotus-bird-wrap absolute opacity-55"
      :class="c.tone"
      :style="{
        left: `${c.x}%`,
        top: `${c.y}%`,
        width: clampSize(c.size * 7.2, c.size * 9.4),
        transform: creatureTransform(c)
      }"
    >
      <LotusBird :landed="c.landed" />
    </div>
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

/* Vị trí/góc quay của chuồn chuồn + chim giờ do useCreatureFlight.ts tính
   mỗi khung hình (né hoa/lá/nước/nhau) và gán thẳng vào `:style` — không
   còn CSS @keyframes cho đường bay nữa, chỉ giữ gợi ý trình duyệt tối ưu
   hiệu năng khi `transform` đổi liên tục. Khi `prefers-reduced-motion`,
   `useCreatureFlight` không chạy vòng lặp -> vị trí đứng yên tại chỗ, phù
   hợp không cần thêm CSS gì riêng ở đây. */
.lotus-dragonfly-wrap,
.lotus-bird-wrap {
  will-change: transform;
}
</style>
