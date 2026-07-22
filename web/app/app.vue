<script setup lang="ts">
import { DEFAULT_WEBSITE_THEME, isValidThemeId } from '#shared/themes'

/**
 * Chọn layout công khai theo websiteTheme (spec.md mục 36) — `<NuxtLayout
 * :name>` chỉ có tác dụng ở trang KHÔNG tự khai `definePageMeta({layout})`
 * (mọi trang /admin/** đều tự khai `layout: 'admin'` nên không bị ảnh
 * hưởng, xem app/pages/admin/*.vue).
 *
 * `data-theme` đặt trên <html> (không phải 1 div lồng bên trong) để CSS
 * token ở main.css phủ đúng cả `body` (nền/màu chữ toàn trang) — nếu đặt ở
 * div con, riêng `body` sẽ không đọc được override vì custom property chỉ
 * chảy XUỐI theo cây DOM, không chảy ngược lên tổ tiên. CHỈ áp dụng ở route
 * công khai — luôn bỏ trống ở /admin/** để trang quản trị giữ nguyên giao
 * diện gốc bất kể khách đang chọn theme công khai nào (yêu cầu tách biệt
 * quản trị khỏi theme khách xem).
 */
const { data: settings } = useSiteSettings()
const route = useRoute()

const activeTheme = computed(() => {
  if (route.path.startsWith('/admin')) return undefined
  const t = settings.value?.websiteTheme
  return isValidThemeId(t) ? t : DEFAULT_WEBSITE_THEME
})

useHead({
  htmlAttrs: {
    'data-theme': activeTheme
  }
})

/**
 * QUAN TRỌNG: trả về `undefined` (không phải chuỗi `'default'`) cho route
 * /admin/** — lỗi thật đã gặp khi build tính năng: `<NuxtLayout :name>`
 * truyền tường minh 1 chuỗi sẽ LUÔN thắng, kể cả khi trang tự khai
 * `definePageMeta({ layout: 'admin' })`, ĐÈ MẤT layout admin bằng layout
 * 'default' của trang công khai (xác nhận thật bằng ảnh chụp: header +
 * hoạ tiết hoa sen của layout default hiện chồng lên cả `AdminTopbar`).
 * Phải để prop `name` THỰC SỰ `undefined` thì `<NuxtLayout>` mới tự đọc
 * đúng `route.meta.layout` (do `definePageMeta` set) như hành vi mặc định.
 */
const layoutName = computed(() => {
  if (route.path.startsWith('/admin')) return undefined
  return activeTheme.value ?? 'default'
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--color-primary)" :height="3" />
    <NuxtLayout :name="layoutName">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
