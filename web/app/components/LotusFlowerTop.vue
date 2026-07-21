<script setup lang="ts">
/**
 * Bông sen CÁNH KÉP nhìn TỪ TRÊN XUỐNG (top-down 90°) — 4 vòng cánh THUÔN DÀI
 * hơi nhọn chóp (đúng dáng cánh sen thật, KHÔNG phải hình bầu dục tròn kiểu
 * mẫu đơn) xếp chồng đồng tâm, gốc trắng kem → viền hồng đậm ra ngoài, cụm
 * NHỊ HOA (tua nhị + đầu phấn vàng) toả ở tâm (spec.md mục 5).
 *
 * QUAN TRỌNG (bugfix #1): mỗi vòng cánh có bán kính riêng BAKE THẲNG VÀO PATH
 * (toạ độ tuyệt đối quanh tâm 100,100), KHÔNG dùng CSS `translate(...px)` để
 * đẩy cánh ra xa tâm — gây lỗi cánh biến mất do translate theo px lồng trong
 * SVG viewBox bị lệch tỉ lệ. Chỉ dùng `rotate()` (SVG attribute) + `scale()`
 * (CSS, không đơn vị độ dài) — đúng cơ chế đã kiểm chứng ở LotusMotif.
 *
 * QUAN TRỌNG (bugfix #2 + #3): bản 66 cánh quá dày hoà thành khối tròn mờ; đã
 * giảm còn 32-36 cánh, tăng tương phản màu giữa các vòng. Nhưng dáng cánh
 * TRÒN kiểu mẫu đơn vẫn không giống sen thật -> đổi sang dáng cánh THUÔN
 * NHỌN (lance-shape: hẹp ở gốc, phình giữa, thon nhọn dần về chóp) + thêm
 * GÂN CÁNH mảnh + LỆCH GÓC/CỠ tự nhiên từng cánh (không đối xứng tuyệt đối
 * như bản trước — hoa thật không bao giờ đều tăm tắp).
 *
 * QUAN TRỌNG (yêu cầu chỉnh lần 8, rồi lần 9 sửa lại lần nữa — xem lỗi #5/#6
 * trong spec.md): 2 lần thử "cụm nhị hoa" (tua mảnh toả quanh tâm) đều thất
 * bại — lần đầu quá nhỏ nên vô hình, lần sau phóng to thì mất cân đối với
 * cánh (đặc biệt lúc hoa còn là búp, cánh co nhỏ nhưng nhị vẫn to => trông
 * như 1 cụm rời nằm NGOÀI hoa). Đã bỏ hẳn hướng "nhị hoa mảnh", thay bằng
 * GƯƠNG SEN (đài hạt sen dạng đĩa vàng-xanh có các lỗ hạt) — đặc điểm nhận
 * diện hoa sen rõ ràng và bền vững nhất ở mọi kích thước hiển thị, không cần
 * chi tiết mảnh dễ vỡ hình. Độ co-nở của gương sen dùng ĐÚNG công thức
 * scale với cánh (sàn 0.14) để không bao giờ to hơn cánh lúc còn là búp.
 *
 * bloomProgress: 0 = búp (mọi vòng co về tâm), 1 = nở xoè hết cỡ.
 *
 * `isHovering` — truyền TỪ NGOÀI vào (xem `LotusScene.vue`), cùng lý do/cơ
 * chế đã giải thích đầy đủ ở `LotusFlower.vue` (nền hoa sen nằm sau nội
 * dung thật, bị chặn hết sự kiện chuột nên không dùng CSS `:hover` trực tiếp
 * được — `LotusScene.vue` tự theo dõi toạ độ chuột bằng JS rồi truyền
 * xuống). Phản ứng chính = xoè nhẹ + gương sen sáng lên; phản ứng hiếm =
 * rụng 1 cánh, có hạn mức thời gian.
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

const uid = (useId() ?? 'lt').replace(/[^\w-]/g, '')

interface Ring {
  radius: number
  count: number
  len: number
  width: number
  tone: 'cream' | 'blush' | 'pink' | 'deep'
  staggerBase: number
}

// 4 vòng, cánh THUÔN DÀI — trong nhỏ/ôm sát, ngoài to/xoè phẳng, đúng mô tả tham chiếu
const rings: Ring[] = [
  { radius: 4, count: 6, len: 24, width: 7, tone: 'cream', staggerBase: 0.0 },
  { radius: 12, count: 8, len: 34, width: 10, tone: 'blush', staggerBase: 0.12 },
  { radius: 21, count: 10, len: 46, width: 13.5, tone: 'pink', staggerBase: 0.28 },
  { radius: 31, count: 12, len: 58, width: 16.5, tone: 'deep', staggerBase: 0.48 }
]

const toneColors: Record<Ring['tone'], { base: string; tip: string }> = {
  cream: { base: '#FFFEFB', tip: '#FDF2F8' },
  blush: { base: '#FFF6FA', tip: '#F9A8D4' },
  pink: { base: '#FDEFF6', tip: '#F472B6' },
  deep: { base: '#FCE7F0', tip: '#DB2777' }
}

/**
 * Số giả-ngẫu-nhiên ổn định theo seed — tạo lệch tự nhiên không đối xứng tuyệt đối.
 * CHỈ dùng phép nguyên (^, >>>, Math.imul) — KHÔNG dùng Math.sin/cos: các hàm
 * lượng giác không được đặc tả phải cho kết quả giống hệt bit-cuối giữa các
 * engine JS (Node.js server vs trình duyệt), từng gây lỗi hydration mismatch
 * thật (lệch ~10^-12 ở toạ độ nhị hoa) dù giá trị hiển thị coi như giống hệt.
 * Phép nguyên/Math.imul được đặc tả chính xác tuyệt đối nên luôn ra cùng 1
 * kết quả trên mọi engine — an toàn cho SSR.
 */
function pseudoRandom(seed: number): number {
  let x = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b)
  x ^= x >>> 13
  x = Math.imul(x, 0xc2b2ae35)
  x ^= x >>> 16
  return (x >>> 0) / 4294967296 // 0..1
}

/**
 * Cánh THUÔN NHỌN kiểu cánh sen thật: hẹp ở gốc (gần tâm), phình ra ở khoảng
 * 60% chiều dài, thon nhọn dần về chóp (không bo tròn như cánh mẫu đơn).
 * Toạ độ TUYỆT ĐỐI quanh tâm (100,100): gốc cách tâm `radius`, chóp cách tâm
 * `radius+len`.
 */
function petalPath(radius: number, len: number, w: number): string {
  const by = 100 - radius
  const y = (t: number) => (by - len * t).toFixed(2)
  const x = (dx: number) => (100 + dx).toFixed(2)
  return (
    `M${x(0)},${by.toFixed(2)} ` +
    `C${x(-w * 0.18)},${y(0.1)} ${x(-w * 0.95)},${y(0.34)} ${x(-w * 0.82)},${y(0.62)} ` +
    `C${x(-w * 0.68)},${y(0.84)} ${x(-w * 0.22)},${y(0.96)} ${x(0)},${y(1)} ` +
    `C${x(w * 0.22)},${y(0.96)} ${x(w * 0.68)},${y(0.84)} ${x(w * 0.82)},${y(0.62)} ` +
    `C${x(w * 0.95)},${y(0.34)} ${x(w * 0.18)},${y(0.1)} ${x(0)},${by.toFixed(2)} Z`
  )
}

/** Gân cánh mảnh chạy dọc giữa — chỉ 1 nét cong nhẹ từ gốc gần tới chóp */
function veinPath(radius: number, len: number): string {
  const by = 100 - radius
  const tipY = by - len * 0.92
  return `M100,${(by - len * 0.08).toFixed(2)} Q100.6,${(by - len * 0.5).toFixed(2)} 100,${tipY.toFixed(2)}`
}

interface PetalInstance {
  ringIndex: number
  angle: number
  stagger: number
  dur: number
  opacity: number
  sizeJitter: number
}

const petals: PetalInstance[] = rings.flatMap((ring, ri) => {
  const items: PetalInstance[] = []
  const angleOffset = ri % 2 === 0 ? 0 : 360 / ring.count / 2
  for (let i = 0; i < ring.count; i++) {
    const seed = ri * 97 + i * 13
    const angleJitter = (pseudoRandom(seed) - 0.5) * 10 // ±5°, hoa thật không đều tăm tắp
    items.push({
      ringIndex: ri,
      angle: angleOffset + (360 / ring.count) * i + angleJitter,
      stagger: ring.staggerBase + ((i % 5) / 5) * 0.06,
      dur: 900 + ((i * 37 + ri * 53) % 5) * 70,
      opacity: 0.88 + pseudoRandom(seed + 1) * 0.12,
      sizeJitter: 0.92 + pseudoRandom(seed + 2) * 0.16 // 0.92 - 1.08
    })
  }
  return items
})

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
function petalProgress(p: PetalInstance): number {
  const raw = (clamp01(props.bloomProgress) - p.stagger) / (1 - p.stagger)
  return easeOutCubic(clamp01(raw))
}
function petalStyle(p: PetalInstance) {
  const pp = petalProgress(p)
  const scale = (0.14 + 0.86 * pp) * p.sizeJitter
  return {
    transform: `rotate(${p.angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`,
    transformOrigin: '100px 100px',
    transitionDuration: `${p.dur}ms`
  }
}

// QUAN TRỌNG: dùng ĐÚNG công thức scale với cánh (sàn 0.14, xem petalStyle)
// — nếu sàn cao hơn cánh (bản nhị hoa trước dùng sàn 0.5) thì lúc hoa còn là
// búp, gương sen vẫn to trong khi cánh co nhỏ về gần tâm => trông như 1 khối
// rời nằm ngoài cụm cánh. Sàn giống nhau đảm bảo gương sen luôn "vừa khít"
// bên trong cụm cánh ở mọi giai đoạn nở.
const podScale = computed(() => {
  const pp = easeOutCubic(clamp01(props.bloomProgress ?? 1))
  return 0.14 + 0.86 * pp
})

/**
 * GƯƠNG SEN (đài hạt sen) — đĩa vàng-xanh dẹt với các lỗ hạt, thay hẳn cho
 * hướng "nhị hoa mảnh" đã thử 2 lần và thất bại (xem log lỗi #5/#6 spec.md).
 * Đây là đặc điểm dễ nhận diện nhất của hoa sen nhìn từ trên xuống trong đời
 * thực — 1 khối đặc, không có chi tiết mảnh nào có thể "biến mất" ở cỡ hiển
 * thị nhỏ. Bán kính đĩa ~12 đơn vị (viewBox 200) vừa khít khoảng trống trước
 * gốc cánh trong cùng (radius 4, nhưng gốc cánh thuôn hẹp nên khoảng trống
 * thị giác thực tế lớn hơn con số 4 khá nhiều).
 */
interface SeedHole {
  angle: number
  radius: number
  size: number
}
const seedHoles: SeedHole[] = [
  // Vòng trong: 6 hạt
  ...Array.from({ length: 6 }, (_, i) => {
    const seed = i * 17 + 3
    return {
      angle: (360 / 6) * i,
      radius: 5.5 + pseudoRandom(seed) * 0.6,
      size: 1.6 + pseudoRandom(seed + 1) * 0.3
    }
  }),
  // Vòng ngoài: 10 hạt, lệch pha để xếp kiểu tổ ong
  ...Array.from({ length: 10 }, (_, i) => {
    const seed = i * 23 + 101
    return {
      angle: (360 / 10) * i + 18,
      radius: 9.5 + pseudoRandom(seed) * 0.6,
      size: 1.4 + pseudoRandom(seed + 1) * 0.3
    }
  })
]
</script>

<template>
  <svg
    viewBox="0 0 200 200"
    class="lotus-flower-top"
    :class="{ 'lotus-flower-top--hover': isHovering }"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <linearGradient
        v-for="(ring, ri) in rings"
        :id="`lt-ring${ri}-${uid}`"
        :key="ri"
        gradientUnits="userSpaceOnUse"
        x1="100"
        :y1="100 - ring.radius"
        x2="100"
        :y2="100 - ring.radius - ring.len"
      >
        <stop offset="0" :stop-color="toneColors[ring.tone].base" stop-opacity="0.95" />
        <stop offset="0.55" :stop-color="toneColors[ring.tone].base" stop-opacity="0.88" />
        <stop offset="1" :stop-color="toneColors[ring.tone].tip" stop-opacity="0.92" />
      </linearGradient>

      <path
        v-for="(ring, ri) in rings"
        :id="`lt-petal${ri}-${uid}`"
        :key="`p${ri}`"
        :d="petalPath(ring.radius, ring.len, ring.width)"
      />
      <path
        v-for="(ring, ri) in rings"
        :id="`lt-vein${ri}-${uid}`"
        :key="`v${ri}`"
        :d="veinPath(ring.radius, ring.len)"
      />

      <radialGradient :id="`lt-pod-${uid}`" cx="0.4" cy="0.35" r="0.75">
        <stop offset="0" stop-color="#E4D98A" stop-opacity="0.98" />
        <stop offset="0.6" stop-color="#C7C468" stop-opacity="0.97" />
        <stop offset="1" stop-color="#93A25A" stop-opacity="0.98" />
      </radialGradient>
    </defs>

    <g v-for="(p, i) in petals" :key="i" class="lotus-petal-top" :style="petalStyle(p)">
      <use
        :href="`#lt-petal${p.ringIndex}-${uid}`"
        :fill="`url(#lt-ring${p.ringIndex}-${uid})`"
        :fill-opacity="p.opacity"
        stroke="#BE185D"
        stroke-opacity="0.32"
        stroke-width="0.9"
      />
      <use :href="`#lt-vein${p.ringIndex}-${uid}`" fill="none" stroke="#BE185D" stroke-opacity="0.22" stroke-width="0.5" />
    </g>

    <!-- Gương sen ở tâm: đĩa vàng-xanh có lỗ hạt — thay hẳn hướng "nhị hoa
         mảnh" đã 2 lần thất bại (vô hình rồi lệch khỏi cụm cánh).
         QUAN TRỌNG (bugfix #6b): định vị vào tâm (translate) và scale theo
         bloom PHẢI tách ra 2 thẻ <g> lồng nhau riêng biệt — 1 thẻ <g> vừa có
         thuộc tính SVG transform vừa có CSS style transform thì CSS sẽ GHI ĐÈ
         HOÀN TOÀN thuộc tính SVG (không cộng dồn), khiến phần translate bị
         mất tác dụng và gương sen lệch về góc viewBox thay vì tâm hoa. -->
    <g transform="translate(100 100)">
      <g class="lotus-pod-top" :style="{ transform: `scale(${podScale})`, transformOrigin: '0 0' }">
        <circle r="13" :fill="`url(#lt-pod-${uid})`" stroke="#78823F" stroke-opacity="0.55" stroke-width="0.6" />
        <circle
          v-for="(hole, hi) in seedHoles"
          :key="hi"
          :cx="0"
          :cy="0"
          :r="hole.size"
          fill="#5B6B3A"
          fill-opacity="0.85"
          :transform="`rotate(${hole.angle.toFixed(2)}) translate(0 ${-hole.radius})`"
        />
      </g>
    </g>

    <LotusPetalDrop
      v-if="showDroppedPetal"
      :x="100"
      :y="20"
      :dx="16"
      :dy="20"
      :rotate-end="90"
      color="#DB2777"
      @done="showDroppedPetal = false"
    />
  </svg>
</template>

<style scoped>
.lotus-petal-top {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.22, 0.8, 0.3, 1);
}
.lotus-pod-top {
  transition-property: transform, filter;
  transition-duration: 700ms, 280ms;
  transition-timing-function: ease-out;
}
.lotus-flower-top {
  transition: transform 280ms cubic-bezier(0.22, 0.8, 0.3, 1);
}
.lotus-flower-top--hover {
  transform: scale(1.04);
}
.lotus-flower-top--hover .lotus-pod-top {
  filter: drop-shadow(0 0 5px rgba(201, 162, 39, 0.9));
}
@media (prefers-reduced-motion: reduce) {
  .lotus-petal-top,
  .lotus-pod-top,
  .lotus-flower-top {
    transition: none;
  }
  .lotus-flower-top--hover {
    transform: none;
  }
}
</style>
