/**
 * Danh sách ảnh cố định của trang chủ (khác `pageBackgrounds` — đó là ảnh NỀN
 * mờ phía sau nội dung của TỪNG TRANG; đây là ảnh CHÂN DUNG cô dâu/chú rể
 * hiển thị trực tiếp trong nội dung trang chủ). Đặt ở shared/ theo đúng quy
 * ước `shared/pages.ts` — dùng chung server (validate key) + client (admin UI
 * tự sinh danh sách, không cần sửa khi thêm/bớt ảnh).
 */
export type SiteImageKey = 'hero' | 'bridePortrait' | 'groomPortrait'

export interface SiteImageDef {
  key: SiteImageKey
  label: string
  description: string
}

export const SITE_IMAGES: SiteImageDef[] = [
  {
    key: 'hero',
    label: 'Ảnh đầu trang chủ',
    description: 'Ảnh chữ nhật hiển thị phía trên tên cô dâu chú rể, ngay đầu trang chủ.'
  },
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
