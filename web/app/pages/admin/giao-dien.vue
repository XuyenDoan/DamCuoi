<script setup lang="ts">
import { WEBSITE_THEMES, DEFAULT_WEBSITE_THEME } from '#shared/themes'

/**
 * Mục "Website Theme" trong Admin (spec.md mục 36) — chọn 1 trong 3 phong
 * cách giao diện công khai. Đổi NGAY LẬP TỨC (không cần bấm "Lưu thay đổi"
 * như trang Nội Dung — đúng yêu cầu "có thể đổi ngay lập tức"), qua endpoint
 * riêng `PUT /api/admin/theme` (không đụng tới field nào khác của Settings).
 * Sau khi lưu, `refreshNuxtData('site-settings')` để MỌI nơi đang đọc
 * `useSiteSettings()` (kể cả layout/app.vue) cập nhật ngay không cần tải
 * lại trang.
 */
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Giao Diện Website — Quản Trị' })

const { data: settings } = await useSiteSettings()

const currentTheme = computed(() => {
  const t = settings.value?.websiteTheme
  return WEBSITE_THEMES.some((x) => x.id === t) ? t! : DEFAULT_WEBSITE_THEME
})

const savingId = ref<string | null>(null)
const errorMessage = ref('')

async function selectTheme(id: string) {
  if (id === currentTheme.value || savingId.value) return
  savingId.value = id
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/theme', { method: 'PUT', body: { websiteTheme: id } })
    await refreshNuxtData('site-settings')
  } catch {
    errorMessage.value = 'Đổi giao diện thất bại, vui lòng thử lại.'
  } finally {
    savingId.value = null
  }
}
</script>

<template>
  <div>
    <AdminTopbar title="Giao diện website" />

    <div class="mx-auto max-w-5xl px-6 py-10">
      <h2 class="mb-2 font-heading text-2xl text-text">Chọn phong cách giao diện</h2>
      <p class="mb-8 max-w-2xl text-sm text-text-muted">
        Áp dụng ngay cho toàn bộ trang công khai — không ảnh hưởng nội dung (album, lời chúc, câu
        chuyện, giờ lễ...), chỉ đổi cách trình bày. Trang quản trị này luôn giữ nguyên giao diện,
        không đổi theo lựa chọn bên dưới.
      </p>

      <p v-if="errorMessage" role="alert" class="mb-6 text-sm text-error">{{ errorMessage }}</p>

      <div class="grid gap-6 sm:grid-cols-3">
        <button
          v-for="t in WEBSITE_THEMES"
          :key="t.id"
          type="button"
          class="focus-ring theme-pick-card flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all duration-200 disabled:cursor-wait"
          :class="
            currentTheme === t.id
              ? 'border-primary shadow-sm'
              : 'border-secondary-light/40 hover:border-primary/40'
          "
          :disabled="savingId !== null"
          :aria-pressed="currentTheme === t.id"
          @click="selectTheme(t.id)"
        >
          <!-- Sample thu nhỏ — dùng đúng font/màu thật của theme (đã nạp sẵn toàn site) -->
          <div
            class="theme-sample flex h-28 flex-col justify-center gap-1.5 px-4"
            :data-theme="t.id"
            :style="{
              background: t.palette[2] ?? t.palette[1],
              color: t.palette[0]
            }"
          >
            <span
              class="text-[10px] font-semibold uppercase tracking-[0.14em]"
              :style="{ color: t.palette[3] ?? t.palette[0], opacity: 0.85 }"
            >{{ t.subLabel }}</span>
            <span class="theme-sample-heading text-xl leading-tight" :style="{ fontFamily: `'${t.fonts.heading}', serif` }">
              {{ settings?.coupleNames?.groom || 'Chú Rể' }} &amp; {{ settings?.coupleNames?.bride || 'Cô Dâu' }}
            </span>
            <span class="flex gap-1.5">
              <span v-for="c in t.palette" :key="c" class="h-3 w-3 rounded-full border border-black/10" :style="{ background: c }" />
            </span>
          </div>

          <div class="flex flex-1 flex-col gap-2 p-5">
            <div class="flex items-center justify-between gap-2">
              <p class="font-heading text-lg text-text">{{ t.label }}</p>
              <span
                v-if="currentTheme === t.id"
                class="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Đang dùng
              </span>
              <span
                v-else-if="savingId === t.id"
                class="shrink-0 text-xs text-text-muted"
              >Đang áp dụng...</span>
            </div>
            <p class="text-xs uppercase tracking-wide text-text-muted">{{ t.subLabel }}</p>
            <p class="mt-1 text-sm leading-relaxed text-text-muted">{{ t.description }}</p>
            <p class="mt-auto pt-3 text-xs text-text-muted">
              Font: <span class="text-text">{{ t.fonts.heading }}</span> + <span class="text-text">{{ t.fonts.body }}</span>
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-sample-heading {
  font-family: inherit;
}
</style>
