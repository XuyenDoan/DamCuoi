import type { Settings } from '../../server/utils/types'

/**
 * Đọc settings.json (nội dung chữ toàn site). Cache theo key 'site-settings'
 * để layout + nhiều trang dùng chung 1 lần fetch.
 */
export function useSiteSettings() {
  return useAsyncData<Settings>('site-settings', () => $fetch('/api/settings'))
}
