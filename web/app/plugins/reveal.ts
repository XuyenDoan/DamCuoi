/**
 * Directive v-reveal: fade + scale nhẹ khi phần tử cuộn vào viewport
 * (spec.md mục 8, checklist 17.4/17.3 — tôn trọng prefers-reduced-motion).
 * Dùng: <div v-reveal="index * 40"> — số truyền vào là độ trễ (ms) để tạo stagger.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement, binding) {
      if (prefersReducedMotion()) return

      el.classList.add('reveal-init')
      const delay = typeof binding.value === 'number' ? binding.value : 0
      el.style.transitionDelay = `${delay}ms`

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              el.classList.add('reveal-visible')
              observer.unobserve(el)
            }
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      )
      observer.observe(el)
    }
  })
})
