<script setup lang="ts">
import { DEFAULT_WEBSITE_THEME, isValidThemeId } from '#shared/themes'
import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH, pickShareImageSource } from '#shared/shareImage'

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
 * Thẻ chia sẻ link (Open Graph + Twitter Card) — để dán link vào Zalo /
 * Facebook / Messenger hiện đúng ảnh bìa + tên cô dâu chú rể + lời ngỏ thay
 * vì khung trống. Lấy từ settings thật (đổi trong admin là đổi theo). Trang
 * /admin/** KHÔNG có thẻ chia sẻ và bị đánh dấu `noindex` để công cụ tìm kiếm
 * không lập chỉ mục trang quản trị.
 *
 * URL ảnh phải TUYỆT ĐỐI (mạng xã hội không hiểu đường dẫn tương đối):
 * `runtimeConfig.public.siteUrl` nếu có (ổn định nhất — đặt biến
 * `NUXT_PUBLIC_SITE_URL`), không thì lấy theo địa chỉ request. Ảnh do route
 * `/og-image.jpg` cắt sẵn 1200×630 JPEG; `?v=` là tên file nguồn (chứa mã
 * ngẫu nhiên) để mạng xã hội tự làm mới bản đã lưu khi admin đổi ảnh hero.
 */
const runtimeConfig = useRuntimeConfig()
const requestUrl = useRequestURL()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const siteUrl = computed(() => (runtimeConfig.public.siteUrl || requestUrl.origin).replace(/\/+$/, ''))

const shareTitle = computed(() => {
  const n = settings.value?.coupleNames
  return n?.bride && n?.groom ? `${n.bride} & ${n.groom}` : 'Album Cưới'
})
const shareDescription = computed(() => {
  const msg = settings.value?.welcomeMessage?.replace(/\s+/g, ' ').trim()
  if (!msg) return 'Trân trọng kính mời bạn đến chung vui cùng chúng tôi trong ngày trọng đại.'
  return msg.length > 200 ? `${msg.slice(0, 197)}...` : msg
})
const shareImage = computed(() => {
  const source = settings.value ? pickShareImageSource(settings.value) : null
  if (!source) return undefined
  return `${siteUrl.value}/og-image.jpg?v=${encodeURIComponent(source.split('/').pop() ?? '')}`
})

const publicOnly = <T,>(value: () => T) => computed(() => (isAdminRoute.value ? undefined : value()))
const imageOnly = <T,>(value: () => T) =>
  computed(() => (isAdminRoute.value || !shareImage.value ? undefined : value()))

useSeoMeta({
  robots: computed(() => (isAdminRoute.value ? 'noindex, nofollow' : undefined)),
  description: publicOnly(() => shareDescription.value),
  ogType: publicOnly(() => 'website' as const),
  ogSiteName: publicOnly(() => 'Album Cưới'),
  ogLocale: publicOnly(() => 'vi_VN'),
  ogTitle: publicOnly(() => shareTitle.value),
  ogDescription: publicOnly(() => shareDescription.value),
  ogUrl: publicOnly(() => `${siteUrl.value}${route.fullPath}`),
  ogImage: publicOnly(() => shareImage.value),
  ogImageWidth: imageOnly(() => SHARE_IMAGE_WIDTH),
  ogImageHeight: imageOnly(() => SHARE_IMAGE_HEIGHT),
  ogImageAlt: imageOnly(() => shareTitle.value),
  twitterCard: publicOnly(() => (shareImage.value ? ('summary_large_image' as const) : ('summary' as const))),
  twitterTitle: publicOnly(() => shareTitle.value),
  twitterDescription: publicOnly(() => shareDescription.value),
  twitterImage: publicOnly(() => shareImage.value)
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
  const t = activeTheme.value ?? 'default'
  // 'watercolor' (spec.md mục 39) tái dùng NGUYÊN layout 'default' — chỉ
  // khác màu/nền qua CSS token (`[data-theme="watercolor"]`) + `PageBackdrop`,
  // không có bố cục khung riêng nên không tạo `layouts/watercolor.vue`
  // trùng lặp. `data-theme` (biến riêng, không đổi) vẫn giữ đúng giá trị
  // 'watercolor' nên mọi CSS override vẫn áp dụng đúng.
  return t === 'watercolor' ? 'default' : t
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--color-primary)" :height="3" />
    <NuxtLayout :name="layoutName">
      <NuxtPage />
    </NuxtLayout>
    <BackgroundMusicPlayer />
  </div>
</template>
