import { requireAdmin } from '../../utils/adminSession'
import { settingsStore } from '../../utils/store'
import { DEFAULT_WEBSITE_THEME, isValidThemeId } from '#shared/themes'

/**
 * Đổi phong cách giao diện — tách riêng khỏi PUT /api/settings (spec.md mục
 * 36) để "Đổi ngay lập tức" không phụ thuộc/không đụng chạm toàn bộ nội
 * dung khác (giống cách page-background/[pageKey] tách riêng khỏi settings
 * chung). Dùng settingsStore.update() (đọc-sửa-ghi) thay vì write() nguyên
 * khối để tuyệt đối không có rủi ro mất dữ liệu field khác.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ websiteTheme?: string }>(event)
  const websiteTheme = isValidThemeId(body?.websiteTheme) ? body.websiteTheme : DEFAULT_WEBSITE_THEME

  return settingsStore.update((current) => ({ ...current, websiteTheme }))
})
