import { DEFAULT_WEBSITE_THEME, isValidThemeId } from '#shared/themes'

/**
 * Theme công khai hiện tại — đọc từ đúng settings.websiteTheme (nguồn dữ
 * liệu duy nhất, spec.md mục 36), fallback 'default' nếu thiếu/không hợp
 * lệ. Dùng chung ở app.vue (chọn layout) và mọi trang (chọn view component).
 */
export function useWebsiteTheme() {
  const { data: settings } = useSiteSettings()
  return computed<string>(() => {
    const t = settings.value?.websiteTheme
    return isValidThemeId(t) ? t : DEFAULT_WEBSITE_THEME
  })
}
