<script setup lang="ts">
import { MANAGED_PAGES } from '#shared/pages'

/**
 * Layout "Kính Mờ Ánh Sáng" (spec.md mục 37) — thanh điều hướng dạng viên
 * kính mờ nổi (floating pill), LUÔN trong suốt/blur (không đợi cuộn mới
 * hiện nền như default/cinematic) vì bản thân nó CHÍNH LÀ 1 khối kính nổi
 * trên nền aurora xuyên suốt trang, không phải thanh chắn ngang thông
 * thường. Cùng logic điều hướng/dữ liệu với các layout khác.
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

    <header class="fixed inset-x-0 top-4 z-40 px-4">
      <nav
        class="glass-nav mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-full px-6 py-3"
        aria-label="Điều hướng chính"
      >
        <NuxtLink
          to="/"
          class="focus-ring shrink-0 truncate font-heading text-base text-text transition-colors duration-200 hover:text-primary"
        >
          {{ wordmark }}
        </NuxtLink>

        <ul class="hidden gap-6 md:flex">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="focus-ring rounded-sm text-[13px] font-semibold text-text-muted transition-colors duration-200 hover:text-primary"
              active-class="!text-primary"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>

        <button
          type="button"
          class="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text transition-colors duration-200 hover:text-primary md:hidden"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-menu-glass"
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
        id="mobile-menu-glass"
        class="glass-nav mx-auto mt-2 flex max-w-3xl flex-col gap-1 rounded-3xl p-3 md:hidden"
      >
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="focus-ring block min-h-11 rounded-xl px-3 py-3 text-sm font-semibold text-text-muted transition-colors duration-200 hover:text-primary"
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

    <footer class="px-6 py-16 text-center">
      <div class="glass-nav mx-auto max-w-md rounded-3xl px-8 py-8">
        <p class="text-hover font-accent text-lg italic text-text">
          {{ settings?.footerText }}
        </p>
        <NuxtLink
          to="/admin"
          class="focus-ring mt-6 inline-block text-xs font-semibold text-text-muted transition-colors duration-200 hover:text-primary"
        >
          Quản trị
        </NuxtLink>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.glass-nav {
  background-color: color-mix(in srgb, var(--color-surface) 55%, transparent);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border: 1px solid color-mix(in srgb, var(--color-surface) 65%, transparent);
  box-shadow: 0 8px 30px color-mix(in srgb, var(--color-text) 8%, transparent);
}
</style>
