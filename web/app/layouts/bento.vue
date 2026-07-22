<script setup lang="ts">
import { MANAGED_PAGES } from '#shared/pages'

/**
 * Layout "Lưới Chuyển Động" (spec.md mục 37) — masthead đặc, chữ đậm hình
 * học, các link điều hướng dạng "chip" bo tròn lớn (khớp ngôn ngữ ô bento
 * ở nội dung trang). Cùng logic điều hướng/dữ liệu với các layout khác.
 */
const { data: settings } = useSiteSettings()

const mobileOpen = ref(false)
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

    <header class="sticky top-0 z-40 border-b-2 border-text bg-bg">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4" aria-label="Điều hướng chính">
        <NuxtLink
          to="/"
          class="focus-ring rounded-full font-heading text-base font-extrabold text-text transition-colors duration-200 hover:text-primary"
        >
          {{ wordmark }}
        </NuxtLink>

        <ul class="hidden gap-2 md:flex">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="focus-ring block rounded-full px-4 py-2 text-sm font-bold text-text transition-colors duration-200 hover:bg-[var(--bento-cell-1)]"
              active-class="!bg-text !text-bg"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>

        <button
          type="button"
          class="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-text transition-colors duration-200 hover:bg-[var(--bento-cell-1)] md:hidden"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-menu-bento"
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

      <ul v-if="mobileOpen" id="mobile-menu-bento" class="flex flex-col gap-1 border-t-2 border-text bg-bg px-6 pb-4 md:hidden">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="focus-ring block min-h-11 rounded-2xl px-3 py-3 text-sm font-bold text-text transition-colors duration-200 hover:bg-[var(--bento-cell-1)]"
            active-class="!bg-text !text-bg"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t-2 border-text bg-[var(--bento-cell-4)] px-6 py-14 text-center">
      <p class="text-hover font-accent text-lg font-bold text-text">
        {{ settings?.footerText }}
      </p>
      <NuxtLink
        to="/admin"
        class="focus-ring mt-6 inline-block rounded-full text-xs font-bold text-text-muted underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline"
      >
        Quản trị
      </NuxtLink>
    </footer>
  </div>
</template>
