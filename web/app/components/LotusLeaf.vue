<script setup lang="ts">
/**
 * Lá sen tròn nhìn từ trên, mép LƯỢN SÓNG mềm mại (như lá sen thật), gradient
 * toả tâm sáng ở rốn lá → xanh đậm ra mép, gân lá cong toả từ rốn. Màu lấy
 * theo currentColor để LotusScene pha 2 sắc xanh secondary / secondary-light.
 *
 * `isHovering` (mặc định false, truyền TỪ NGOÀI vào — xem `LotusScene.vue`,
 * chỉ bật cho lá đi kèm 8 bông "ao sen kể chuyện" chính): cùng lý do KHÔNG
 * dùng CSS `:hover`/sự kiện chuột trực tiếp đã giải thích ở `LotusFlower.vue`
 * (nội dung thật phía trước chặn hết sự kiện chuột tới nền phía sau — phải
 * theo dõi toạ độ chuột bằng JS ở `LotusScene.vue` rồi truyền xuống).
 * - Phản ứng CHÍNH (luôn xảy ra khi `isHovering` bật): nghiêng nhẹ như gió
 *   thoảng qua + đậm màu nhẹ (gộp chung vì đọc như 1 khoảnh khắc "gió lướt,
 *   nắng vừa chiếu qua" chứ không phải 2 hiệu ứng tách rời) — điều khiển
 *   thẳng bằng class CSS theo prop.
 * - Phản ứng HIẾM: gợn sóng lan ra quanh mép lá — tái dùng đúng ngôn ngữ gợn
 *   sóng đã có ở cánh hoa rơi trúng nước (`FallingPetal.vue`/`WaterRipple.vue`).
 */
const props = withDefaults(defineProps<{ isHovering?: boolean }>(), { isHovering: false })

const showRipple = ref(false)
const onCooldown = ref(false)
const RIPPLE_CHANCE = 0.3
const COOLDOWN_MS = 22000
let cooldownTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.isHovering,
  (hovering) => {
    if (!hovering || onCooldown.value) return
    if (Math.random() > RIPPLE_CHANCE) return
    showRipple.value = true
    onCooldown.value = true
    cooldownTimer = setTimeout(() => {
      onCooldown.value = false
    }, COOLDOWN_MS)
  }
)

onBeforeUnmount(() => {
  if (cooldownTimer) clearTimeout(cooldownTimer)
})

const uid = (useId() ?? 'll').replace(/[^\w-]/g, '')

// Đường viền lá lượn sóng: 12 gợn quanh hình tròn bán kính ~40 quanh tâm (50,52)
const leafPath = (() => {
  const cx = 50
  const cy = 52
  const lobes = 11
  const rOuter = 41
  const rInner = 37
  let d = ''
  const notchStart = -0.55 // vị trí khuyết chữ V (radian quanh vòng)
  const notchEnd = 0.15
  for (let i = 0; i <= lobes; i++) {
    const a0 = notchEnd + ((Math.PI * 2 - (notchEnd - notchStart)) * i) / lobes
    const a1 = notchEnd + ((Math.PI * 2 - (notchEnd - notchStart)) * (i + 0.5)) / lobes
    const x0 = cx + rOuter * Math.cos(a0)
    const y0 = cy + rOuter * Math.sin(a0)
    const xm = cx + rInner * Math.cos(a1)
    const ym = cy + rInner * Math.sin(a1)
    if (i === 0) d += `M${x0.toFixed(1)},${y0.toFixed(1)} `
    d += `Q${xm.toFixed(1)},${ym.toFixed(1)} `
    const a2 = notchEnd + ((Math.PI * 2 - (notchEnd - notchStart)) * (i + 1)) / lobes
    const x2 = cx + rOuter * Math.cos(a2)
    const y2 = cy + rOuter * Math.sin(a2)
    d += `${x2.toFixed(1)},${y2.toFixed(1)} `
  }
  // Khuyết chữ V về rốn lá
  d += `L${cx},${cy} Z`
  return d
})()
</script>

<template>
  <svg
    viewBox="0 0 100 104"
    class="lotus-leaf"
    :class="{ 'lotus-leaf--hover': isHovering }"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <radialGradient :id="`ll-fill-${uid}`" cx="0.5" cy="0.52" r="0.55">
        <stop offset="0" stop-color="currentColor" stop-opacity="0.28" />
        <stop offset="0.65" stop-color="currentColor" stop-opacity="0.5" />
        <stop offset="1" stop-color="currentColor" stop-opacity="0.62" />
      </radialGradient>
    </defs>

    <path
      :d="leafPath"
      :fill="`url(#ll-fill-${uid})`"
      stroke="currentColor"
      stroke-opacity="0.5"
      stroke-width="0.8"
      stroke-linejoin="round"
    />
    <!-- Gân lá cong toả từ rốn lá -->
    <g fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="0.7" stroke-linecap="round">
      <path d="M50,52 Q40,32 46,14" />
      <path d="M50,52 Q28,40 12,36" />
      <path d="M50,52 Q26,58 12,72" />
      <path d="M50,52 Q42,74 40,92" />
      <path d="M50,52 Q66,72 74,88" />
      <path d="M50,52 Q76,58 90,60" />
      <path d="M50,52 Q70,36 76,20" />
      <path d="M50,52 Q58,30 60,12" />
    </g>
    <circle cx="50" cy="52" r="2" fill="currentColor" fill-opacity="0.55" />

    <circle
      v-if="showRipple"
      cx="50"
      cy="52"
      r="20"
      fill="none"
      stroke="currentColor"
      stroke-opacity="0.5"
      stroke-width="1.2"
      class="lotus-leaf-ripple"
      @animationend="showRipple = false"
    />
  </svg>
</template>

<style scoped>
.lotus-leaf {
  transition: transform 320ms ease-out, filter 320ms ease-out;
}
.lotus-leaf--hover {
  transform: rotate(-2deg) scale(1.03);
  filter: brightness(0.94) saturate(1.15);
}
.lotus-leaf-ripple {
  transform-box: fill-box;
  transform-origin: center;
  animation: lotus-leaf-ripple 1s ease-out forwards;
}
@keyframes lotus-leaf-ripple {
  0% {
    transform: scale(0.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .lotus-leaf {
    transition: none;
  }
  .lotus-leaf--hover {
    transform: none;
    filter: none;
  }
  .lotus-leaf-ripple {
    animation: none;
    opacity: 0;
  }
}
</style>
