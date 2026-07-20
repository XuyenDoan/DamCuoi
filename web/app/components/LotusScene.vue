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
  /**
   * Ghi đè hệ số `vw` dùng để tính bề rộng/cao (mặc định 10, xem `clampSize`)
   * — CHỈ cần khi bông có nguy cơ đè lên nội dung ở màn hình hẹp. Bông đầu
   * tiên (mép trái, gần khối đếm ngược ở trang chủ) dùng giá trị nhỏ hơn để
   * tránh chạm badge "Nhà Trai/Nhà Gái" trên mobile (lỗi thật đã phát hiện
   * khi rà soát giao diện: ở 375px, đủ dữ liệu 2 badge thì bông sen mép trái
   * đè lên viền badge "Nhà Gái"). Chỉ ảnh hưởng màn hình hẹp/vừa — trên màn
   * rộng công thức `rem` vẫn thắng nên không đổi gì so với trước.
   */
  vwCap?: number
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
    leaf: { size: 3.0, tone: 'text-secondary', offsetX: -12, rotate: -6 },
    vwCap: 6.5
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
 * Nhịp "trôi" rất nhẹ (nổi nhẹ cho bông trực diện / đung đưa nhẹ cho bông
 * nghiêng, xem class `lotus-drift-float`/`lotus-drift-sway` trong <style>) —
 * mỗi bông có thời lượng + độ trễ riêng để không bao giờ đồng bộ, trông tự
 * nhiên hơn là cả ao sen "nhấp nháy" cùng lúc. CHỈ dùng phép toán số nguyên/
 * thực cơ bản (*, %, /) — KHÔNG dùng Math.sin/cos hay Math.random để tạo lệch
 * nhịp, vì các hàm đó không đảm bảo cho kết quả giống hệt giữa Node.js (SSR)
 * và trình duyệt (client), từng gây lỗi hydration mismatch thật khi tạo lệch
 * ngẫu nhiên cho nhị hoa (xem spec.md mục 5, lỗi #4) — phép toán cơ bản trên
 * số thực được đặc tả chính xác tuyệt đối (IEEE 754) nên luôn ra cùng 1 kết
 * quả trên mọi engine, an toàn cho SSR.
 */
function driftStyle(seed: number, baseSec = 9, spreadSec = 6) {
  const duration = baseSec + (((seed * 37) % 100) / 100) * spreadSec
  const delay = -(((seed * 53) % 130) / 10)
  return { animationDuration: `${duration.toFixed(1)}s`, animationDelay: `${delay.toFixed(1)}s` }
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
        class="lotus-scene-item lotus-drift-sway absolute flex flex-col items-center"
        :style="{ left: f.left, bottom: f.bottom, opacity: fadeOpacity(f.appearAt), ...driftStyle(i) }"
      >
        <LotusFlower
          :bloom-progress="bloomOf(f)"
          class="-mb-2"
          :style="{
            width: clampSize(f.size * 6 * FLOWER_SCALE, f.size * (f.vwCap ?? 10) * FLOWER_SCALE),
            height: clampSize(f.size * 4.9 * FLOWER_SCALE, f.size * (f.vwCap ?? 10) * 0.817 * FLOWER_SCALE)
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
        class="lotus-scene-item lotus-drift-float absolute"
        :style="{ left: f.left, top: f.top, opacity: fadeOpacity(f.appearAt), ...driftStyle(i) }"
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

    <!-- Khung viền hoa sen 2 mép màn hình (yêu cầu bổ sung: "nửa bông hoa sen
         nhìn từ trên xuống, mỗi bên mép chỉ hiện 1 nửa"). Khác vai trò của 8
         bông "ao sen" phía trên (rải rác, nở theo cuộn, kể chuyện) — đây là 1
         khung trang trí TĨNH, nhất quán ở mọi trang, mờ hơn hẳn (opacity thấp
         hơn) để không cạnh tranh với nội dung. Không nở theo cuộn (bloom cố
         định ~0.82 — hé mở tự nhiên, không cứng nhắc như nở trọn 100%), không
         có lá đi kèm (giữ đơn giản, tránh trông như "thêm 1 cây sen" trong ao).
         Cắt đúng 1 nửa bằng `translate(-50%|50%, -50%)` (kỹ thuật đã dùng ở lá
         sen phía trên) trên lớp NGOÀI chỉ để định vị tĩnh; lớp TRONG mới nhận
         animation nổi nhẹ — tách 2 lớp để tránh xung đột CSS transform tĩnh
         (translate định vị) với CSS animation (translateY nổi nhẹ) trên CÙNG
         1 thẻ, đúng bài học đã rút ra ở lỗi thật #6b (spec.md mục 5). Kích
         thước dùng hệ số `vw` nhỏ để phần "ló" ra mép vẫn rất nhẹ nhàng trên
         màn hình hẹp, không lấn vào cột nội dung ở giữa. -->
    <div
      class="pointer-events-none absolute"
      style="left: 0; top: 46%; transform: translate(-50%, -50%)"
      aria-hidden="true"
    >
      <div class="lotus-drift-float" :style="{ opacity: 0.45, ...driftStyle(20) }">
        <LotusFlowerTop
          :bloom-progress="0.82"
          :style="{
            width: clampSize(2.9 * 6 * FLOWER_SCALE, 2.9 * 4.5 * FLOWER_SCALE),
            height: clampSize(2.9 * 6 * FLOWER_SCALE, 2.9 * 4.5 * FLOWER_SCALE)
          }"
        />
      </div>
    </div>
    <div
      class="pointer-events-none absolute"
      style="right: 0; top: 54%; transform: translate(50%, -50%)"
      aria-hidden="true"
    >
      <div class="lotus-drift-float" :style="{ opacity: 0.45, ...driftStyle(33) }">
        <LotusFlowerTop
          :bloom-progress="0.82"
          :style="{
            width: clampSize(2.6 * 6 * FLOWER_SCALE, 2.6 * 4.5 * FLOWER_SCALE),
            height: clampSize(2.6 * 6 * FLOWER_SCALE, 2.6 * 4.5 * FLOWER_SCALE)
          }"
        />
      </div>
    </div>

    <!-- Mặt nước — dải gợn sóng trôi ngang rất chậm ở phần dưới màn hình -->
    <WaterRipple />
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

/*
  Hoạt ảnh "trôi" rất nhẹ (yêu cầu bổ sung — gió nhẹ / nổi chậm cho hoa lá):
  - `lotus-drift-float`: bông nhìn từ trên xuống trôi nổi trên mặt nước —
    chỉ nhích lên/xuống vài px, KHÔNG rotate (nổi thẳng, không nghiêng ngả).
  - `lotus-drift-sway`: bông nghiêng có cuống — xoay rất nhẹ quanh GỐC cuống
    (transform-origin ở đáy khối), mô phỏng cuống đung đưa theo gió.
  Chỉ dùng `transform` (không đụng layout/paint) — êm cho hiệu năng. Thời
  lượng/độ trễ lệch nhau theo từng bông (`driftStyle` trong script) nên không
  bao giờ đồng bộ. Biên độ cố ý rất nhỏ để không gây rối mắt/mất tập trung khi
  nhìn lâu. Tôn trọng `prefers-reduced-motion` qua quy tắc chung đã có ở
  main.css (`animation-duration: 0.01ms !important` cho mọi phần tử) — không
  cần lặp lại riêng ở đây.
*/
.lotus-drift-float {
  animation-name: lotus-float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}
.lotus-drift-sway {
  transform-origin: 50% 100%;
  animation-name: lotus-sway;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes lotus-float {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(5px);
  }
}
@keyframes lotus-sway {
  from {
    transform: rotate(-0.8deg);
  }
  to {
    transform: rotate(0.8deg);
  }
}
</style>
