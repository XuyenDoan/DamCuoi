<script setup lang="ts">
import { MANAGED_PAGES } from '#shared/pages'

/**
 * Layout "Chữ Cuộn Kịch Tính" (spec.md mục 37) — masthead tối giản, chữ
 * đậm tương phản cao kiểu poster, gạch chân dày cho mục đang active thay
 * vì đổi màu đơn thuần. Cùng logic điều hướng/dữ liệu với các layout khác.
 */
const { data: settings } = useSiteSettings()

const isScrolled = ref(false)
const mobileOpen = ref(false)

function onScroll() {
  isScrolled.value = window.scrollY > 40
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

const route = useRoute()
watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  }
)

const navLinks = computed(() =>
  MANAGED_PAGES.filter((p) => p.key === 'home' || !settings.value?.hiddenPages?.includes(p.key)).map(
    (p) => ({ to: p.path, label: p.label })
  )
)

const wordmark = computed(() => {
  const s = settings.value
  if (!s) return ''
  return `${s.coupleNames.groom} & ${s.coupleNames.bride}`
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <PageBackgroundImage />

    <header
      class="fixed inset-x-0 top-0 z-40 transition-colors duration-300"
      :class="isScrolled || mobileOpen ? 'border-b-2 border-text bg-bg' : 'bg-transparent'"
    >
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5" aria-label="Điều hướng chính">
        <NuxtLink
          to="/"
          class="focus-ring font-heading text-base font-extrabold uppercase tracking-tight text-text transition-colors duration-200 hover:text-primary"
        >
          {{ wordmark }}
        </NuxtLink>

        <ul class="hidden gap-8 md:flex">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="focus-ring border-b-2 border-transparent pb-0.5 text-[13px] font-bold uppercase tracking-wide text-text transition-colors duration-200 hover:border-primary hover:text-primary"
              active-class="!border-primary !text-primary"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>

        <button
          type="button"
          class="focus-ring flex h-11 w-11 items-center justify-center text-text transition-colors duration-200 hover:text-primary md:hidden"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-menu-kinetic"
          aria-label="Mở menu điều hướng"
          @click="mobileOpen = !mobileOpen"
        >
          <svg
            v-if="!mobileOpen"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            class="h-5 w-5"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="h-5 w-5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </nav>

      <ul v-if="mobileOpen" id="mobile-menu-kinetic" class="flex flex-col gap-1 border-t-2 border-text bg-bg px-6 pb-4 md:hidden">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="focus-ring block min-h-11 py-3 text-sm font-bold uppercase tracking-wide text-text transition-colors duration-200 hover:text-primary"
            active-class="!text-primary"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t-2 border-text px-6 py-16 text-center">
      <p class="text-hover font-accent text-2xl font-extrabold uppercase tracking-tight text-text">
        {{ settings?.footerText }}
      </p>
      <NuxtLink
        to="/admin"
        class="focus-ring mt-6 inline-block text-xs font-bold uppercase tracking-wide text-text-muted transition-colors duration-200 hover:text-primary"
      >
        Quản trị
      </NuxtLink>
    </footer>
  </div>
</template>
