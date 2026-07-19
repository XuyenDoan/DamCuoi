import { pageKeyFromPath } from '../../shared/pages'

/**
 * Chặn truy cập trực tiếp vào 1 trang đang bị admin tắt hiển thị (mục nâng
 * cấp "Ẩn/Hiện từng trang") — áp dụng cho 4 trang công khai ngoài Trang chủ
 * (Trang chủ luôn bắt buộc hiện, không gắn middleware này). `/api/settings`
 * là endpoint công khai (không cần cookie) nên dùng thẳng useSiteSettings()
 * là đủ, không cần useRequestFetch() như admin-auth.ts.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { data: settings } = await useSiteSettings()
  const pageKey = pageKeyFromPath(to.path)
  if (settings.value?.hiddenPages?.includes(pageKey)) {
    return navigateTo('/')
  }
})
