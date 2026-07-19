<script setup lang="ts">
import { MANAGED_PAGES } from '#shared/pages'

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

// Hợp nhất với MANAGED_PAGES (shared/pages.ts) — trước đây danh sách trang ở
// đây tách biệt hoàn toàn khỏi danh sách dùng cho "Ảnh nền từng trang", dễ
// lệch nhau khi thêm/bớt trang. Lọc theo hiddenPages để trang bị tắt tự biến
// mất khỏi menu ngay khi admin đổi (settings reactive, không cần F5).
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
    <PageBackdrop />

    <header
      class="fixed inset-x-0 top-0 z-40 transition-colors duration-300"
      :class="isScrolled || mobileOpen ? 'bg-bg/95 shadow-sm backdrop-blur' : 'bg-transparent'"
    >
      <nav
        class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
        aria-label="Điều hướng chính"
      >
        <NuxtLink to="/" class="font-heading text-lg text-text">
          {{ wordmark }}
        </NuxtLink>

        <ul class="hidden gap-8 md:flex">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="text-sm font-medium text-text transition-colors hover:text-primary"
              active-class="text-primary"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>

        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center text-text md:hidden"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-menu"
          aria-label="Mở menu điều hướng"
          @click="mobileOpen = !mobileOpen"
        >
          <svg
            v-if="!mobileOpen"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            class="h-6 w-6"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            class="h-6 w-6"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </nav>

      <ul
        v-if="mobileOpen"
        id="mobile-menu"
        class="flex flex-col gap-1 border-t border-secondary-light/30 bg-bg px-6 pb-4 md:hidden"
      >
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="block min-h-11 py-3 text-base text-text"
            active-class="text-primary"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="relative overflow-hidden border-t border-secondary-light/30 bg-surface px-6 py-12 text-center">
      <LotusWatermark position="center" tone="secondary" size="w-64" />
      <p class="relative font-accent text-lg italic text-text-muted">
        {{ settings?.footerText }}
      </p>
      <NuxtLink
        to="/admin"
        class="relative mt-6 inline-block text-xs text-text-muted/60 transition-colors hover:text-text-muted"
      >
        Quản trị
      </NuxtLink>
    </footer>
  </div>
</template>
