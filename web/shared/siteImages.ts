/**
 * Danh sách ảnh cố định của trang chủ (khác `pageBackgrounds` — đó là ảnh NỀN
 * mờ phía sau nội dung của TỪNG TRANG; đây là ảnh CHÂN DUNG cô dâu/chú rể
 * hiển thị trực tiếp trong nội dung trang chủ). Đặt ở shared/ theo đúng quy
 * ước `shared/pages.ts` — dùng chung server (validate key) + client (admin UI
 * tự sinh danh sách, không cần sửa khi thêm/bớt ảnh).
 */
/**
 * `hero` (ảnh đầu trang chủ) đã tách RIÊNG khỏi hệ thống 1-ảnh-1-key này —
 * xem `heroImages: string[]` trong `server/utils/types.ts` + endpoint
 * `/api/admin/hero-image` (spec.md mục 40) — vì trang chủ giờ cần NHIỀU ảnh
 * (carousel) thay vì đúng 1 ảnh cố định như 2 key còn lại.
 */
export type SiteImageKey = 'bridePortrait' | 'groomPortrait'

export interface SiteImageDef {
  key: SiteImageKey
  label: string
  description: string
}

export const SITE_IMAGES: SiteImageDef[] = [
  {
    key: 'bridePortrait',
    label: 'Ảnh cô dâu',
    description: 'Hiển thị ở khối giới thiệu cô dâu, phía trên "Câu Chuyện Của Chúng Tôi".'
  },
  {
    key: 'groomPortrait',
    label: 'Ảnh chú rể',
    description: 'Hiển thị ở khối giới thiệu chú rể, phía trên "Câu Chuyện Của Chúng Tôi".'
  }
]

export function isSiteImageKey(key: string): key is SiteImageKey {
  return SITE_IMAGES.some((s) => s.key === key)
}
