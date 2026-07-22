<script setup lang="ts">
import { MANAGED_PAGES } from '#shared/pages'

/**
 * Layout "Biên Tập Sang Trọng" (spec.md mục 36) — masthead LUÔN đặc (không
 * trong suốt/blur khi cuộn như default), chữ hoa tracking rộng kiểu tạp
 * chí, không hoạ tiết. Cùng logic điều hướng/dữ liệu với layouts/default.vue
 * (MANAGED_PAGES, hiddenPages, wordmark) — chỉ khác trình bày.
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

    <header class="fixed inset-x-0 top-0 z-40 border-b border-text/10 bg-bg">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5" aria-label="Điều hướng chính">
        <NuxtLink
          to="/"
          class="focus-ring font-heading text-base tracking-wide text-text transition-colors duration-200 hover:text-secondary"
        >
          {{ wordmark }}
        </NuxtLink>

        <ul class="hidden gap-9 md:flex">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="focus-ring text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted transition-colors duration-200 hover:text-secondary"
              active-class="!text-secondary"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>

        <button
          type="button"
          class="focus-ring flex h-11 w-11 items-center justify-center text-text transition-colors duration-200 hover:text-secondary md:hidden"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-menu-editorial"
          aria-label="Mở menu điều hướng"
          @click="mobileOpen = !mobileOpen"
        >
          <svg
            v-if="!mobileOpen"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            class="h-5 w-5"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="h-5 w-5">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </nav>

      <ul
        v-if="mobileOpen"
        id="mobile-menu-editorial"
        class="flex flex-col gap-1 border-t border-text/10 bg-bg px-6 pb-4 md:hidden"
      >
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="focus-ring block min-h-11 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-text-muted transition-colors duration-200 hover:text-secondary"
            active-class="!text-secondary"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </header>

    <main class="flex-1 pt-[73px]">
      <slot />
    </main>

    <footer class="border-t border-text/10 bg-surface px-6 py-14 text-center">
      <p class="text-hover mx-auto max-w-md font-accent text-lg italic text-text-muted">
        {{ settings?.footerText }}
      </p>
      <div class="mx-auto mt-8 h-px w-12 bg-text/20" />
      <NuxtLink
        to="/admin"
        class="focus-ring mt-8 inline-block text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted transition-colors duration-200 hover:text-secondary"
      >
        Quản trị
      </NuxtLink>
    </footer>
  </div>
</template>
