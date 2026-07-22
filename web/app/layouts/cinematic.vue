<script setup lang="ts">
import { MANAGED_PAGES } from '#shared/pages'

/**
 * Layout "Điện Ảnh Cuộn" (spec.md mục 36) — masthead trong suốt nổi trên
 * nền tối, chỉ hiện nền mờ/viền khi cuộn xuống (giữ đúng cảm giác "không
 * chắn cảnh phim" lúc mới vào trang). Cùng logic điều hướng/dữ liệu với
 * layouts/default.vue — chỉ khác trình bày (tối, chữ hoa tracking rộng
 * kiểu phụ đề phim).
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
      :class="isScrolled || mobileOpen ? 'border-b border-text/10 bg-bg/90 backdrop-blur' : 'bg-transparent'"
    >
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5" aria-label="Điều hướng chính">
        <NuxtLink
          to="/"
          class="focus-ring-dark font-heading text-base italic text-text transition-colors duration-200 hover:text-primary"
        >
          {{ wordmark }}
        </NuxtLink>

        <ul class="hidden gap-9 md:flex">
          <li v-for="link in navLinks" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="focus-ring-dark relative text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted transition-colors duration-200 hover:text-primary"
              active-class="!text-primary"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>

        <button
          type="button"
          class="focus-ring-dark flex h-11 w-11 items-center justify-center text-text transition-colors duration-200 hover:text-primary md:hidden"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-menu-cinematic"
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
        id="mobile-menu-cinematic"
        class="flex flex-col gap-1 border-t border-text/10 bg-bg px-6 pb-4 md:hidden"
      >
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="focus-ring-dark block min-h-11 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-muted transition-colors duration-200 hover:text-primary"
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

    <footer class="border-t border-text/10 bg-surface px-6 py-16 text-center">
      <span class="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Hết phim</span>
      <p class="text-hover-dark mx-auto mt-4 max-w-md font-accent text-lg italic text-text-muted">
        {{ settings?.footerText }}
      </p>
      <NuxtLink
        to="/admin"
        class="focus-ring-dark mt-10 inline-block text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted transition-colors duration-200 hover:text-primary"
      >
        Quản trị
      </NuxtLink>
    </footer>
  </div>
</template>
