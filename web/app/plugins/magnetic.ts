/**
 * Directive v-magnetic: nút bấm dịch nhẹ theo hướng chuột khi rê tới gần
 * (spec.md mục 37 — theme "Chữ Cuộn Kịch Tính", CTA "nam châm"). Theo dõi
 * `mousemove` ở cấp `window` (không phải trên chính nút) để bắt được cả
 * lúc chuột còn CHƯA chạm nút — đúng cảm giác "bị hút" thay vì chỉ phản
 * ứng khi hover trực tiếp.
 *
 * CHỈ bật ở thiết bị có chuột thật, KHÔNG bật khi `prefers-reduced-motion`
 * — cùng nguyên tắc với `v-tilt` (plugins/tilt.ts).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const enabled = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  nuxtApp.vueApp.directive('magnetic', {
    mounted(el: HTMLElement) {
      if (!enabled()) return

      const STRENGTH = 0.35
      const EXTRA_RADIUS = 60

      function onMove(e: MouseEvent) {
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.hypot(dx, dy)
        const catchRadius = EXTRA_RADIUS + Math.max(r.width, r.height) / 2
        el.style.transform = dist < catchRadius ? `translate(${(dx * STRENGTH).toFixed(1)}px, ${(dy * STRENGTH).toFixed(1)}px)` : ''
      }

      el.classList.add('magnetic-btn')
      window.addEventListener('mousemove', onMove, { passive: true })
      ;(el as unknown as { __magneticCleanup?: () => void }).__magneticCleanup = () => {
        window.removeEventListener('mousemove', onMove)
      }
    },
    unmounted(el: HTMLElement) {
      ;(el as unknown as { __magneticCleanup?: () => void }).__magneticCleanup?.()
    }
  })
})
