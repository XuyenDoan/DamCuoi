/**
 * Danh sách các trang công khai có thể gán ảnh nền riêng (Content Editor mục
 * "Ảnh nền từng trang"). Đặt ở shared/ để dùng chung server (validate) và
 * client (admin UI tự sinh danh sách) — thêm/bớt 1 trang chỉ cần sửa ở đây,
 * không cần sửa UI admin hay API riêng (yêu cầu "số lượng trang sẽ động").
 */
export interface ManagedPage {
  key: string
  label: string
  path: string
}

export const MANAGED_PAGES: ManagedPage[] = [
  { key: 'home', label: 'Trang chủ', path: '/' },
  { key: 'album', label: 'Album Ảnh', path: '/album' },
  { key: 'gui-anh', label: 'Gửi Ảnh', path: '/gui-anh' },
  { key: 'loi-chuc', label: 'Lời Chúc', path: '/loi-chuc' },
  { key: 'thong-tin', label: 'Thông Tin Lễ Cưới', path: '/thong-tin' }
]

export function isManagedPageKey(key: string): boolean {
  return MANAGED_PAGES.some((p) => p.key === key)
}

/** Trang có thể bật/tắt hiển thị — trừ 'home' (trang chủ luôn bắt buộc hiện) */
export function isHideablePageKey(key: string): boolean {
  return isManagedPageKey(key) && key !== 'home'
}

/** Map đường dẫn route hiện tại -> page key (dùng bởi PageBackdrop) */
export function pageKeyFromPath(path: string): string {
  const found = MANAGED_PAGES.find((p) => p.path === path)
  return found?.key ?? 'home'
}
