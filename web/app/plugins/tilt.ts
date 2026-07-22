/**
 * Directive v-tilt: nghiêng 3D nhẹ theo vị trí con trỏ chuột (spec.md mục
 * 37 — theme "Lưới Chuyển Động"). Dùng chung cho mọi lưới bento trong dự
 * án (Trang chủ, có thể tái dùng ở Album...) — cùng phong cách với
 * `v-reveal` (plugins/reveal.ts): 1 directive, đăng ký 1 lần.
 *
 * CHỈ bật ở thiết bị có chuột thật (`hover: hover` + `pointer: fine`) và
 * KHÔNG bật khi `prefers-reduced-motion` — nghiêng theo chuột không có ý
 * nghĩa gì trên cảm ứng (không có "hover"), và là hiệu ứng chuyển động cần
 * tôn trọng lựa chọn giảm chuyển động của người dùng.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const supportsTilt = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  nuxtApp.vueApp.directive('tilt', {
    mounted(el: HTMLElement) {
      if (!supportsTilt()) return

      function onMove(e: MouseEvent) {
        const r = el.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        el.style.transform = `rotateX(${(-py * 9).toFixed(2)}deg) rotateY(${(px * 9).toFixed(2)}deg) scale(1.02)`
      }
      function onLeave() {
        el.style.transform = ''
      }

      el.classList.add('tilt-card')
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      ;(el as unknown as { __tiltCleanup?: () => void }).__tiltCleanup = () => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      }
    },
    unmounted(el: HTMLElement) {
      ;(el as unknown as { __tiltCleanup?: () => void }).__tiltCleanup?.()
    }
  })
})
