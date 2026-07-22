/**
 * Directive v-kinetic: chữ đậm dần/đổi màu khi cuộn tới đúng dải giữa màn
 * hình, nhạt/lệch khi ra khỏi dải đó (spec.md mục 37 — theme "Chữ Cuộn Kịch
 * Tính"). Dùng `IntersectionObserver` với `rootMargin` âm 2 phía để tạo 1
 * dải mỏng quanh tâm viewport — KHÁC `v-reveal` (chỉ kích hoạt 1 lần rồi
 * ngừng theo dõi): ở đây bật/tắt lại được nhiều lần để chữ "sống" theo cả 2
 * chiều cuộn lên/xuống, đúng tinh thần "tua lại khi cuộn ngược" đã hứa.
 *
 * Khi `prefers-reduced-motion`: bật sẵn trạng thái active tĩnh, không theo
 * dõi cuộn nữa — đổi hẳn sang trải nghiệm tĩnh thay vì chỉ giảm tốc độ.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  nuxtApp.vueApp.directive('kinetic', {
    mounted(el: HTMLElement) {
      el.classList.add('kinetic-word')

      if (prefersReducedMotion()) {
        el.classList.add('kinetic-active')
        return
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            entry.target.classList.toggle('kinetic-active', entry.isIntersecting)
          }
        },
        { threshold: 0, rootMargin: '-42% 0px -42% 0px' }
      )
      observer.observe(el)
      ;(el as unknown as { __kineticCleanup?: () => void }).__kineticCleanup = () => observer.disconnect()
    },
    unmounted(el: HTMLElement) {
      ;(el as unknown as { __kineticCleanup?: () => void }).__kineticCleanup?.()
    }
  })
})
