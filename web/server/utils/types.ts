// Kiểu dữ liệu khớp với schema mô tả trong spec.md mục 14.2-14.3

/** Ảnh tối thiểu đủ dùng cho PhotoLightbox (album, mốc thời gian...) */
export interface LightboxPhoto {
  id: string
  filename: string
  width: number
  height: number
  caption?: string
}

export interface LoveStoryMilestone {
  id: string
  year: string
  title: string
  content: string
  /** Ảnh minh hoạ cho mốc này (0..n) — dữ liệu cũ có thể chưa có field này, đọc phải fallback `?? []` */
  photos: LightboxPhoto[]
}

export interface EventInfoBlock {
  ceremonyTime: string
  venueName: string
  venueAddress: string
  mapEmbedUrl: string
}

export interface Settings {
  coupleNames: { groom: string; bride: string }
  heroTagline: string
  welcomeMessage: string
  loveStory: LoveStoryMilestone[]
  /** Thông tin lễ (giờ/địa điểm) của từng nhà — nhà trai hiển thị trước, nhà gái sau */
  eventInfo: {
    groom: EventInfoBlock
    bride: EventInfoBlock
  }
  footerText: string
  /**
   * Ảnh nền riêng cho từng trang công khai (key khớp với shared/pages.ts),
   * không thuộc album/photos.json nào. Giá trị null -> trang đó hiện hoạ tiết
   * hoa sen nở dần theo scroll thay cho ảnh (PageBackdrop.vue).
   */
  pageBackgrounds: Record<string, string | null>
  /**
   * Danh sách key trang (khớp shared/pages.ts) đang bị ẩn khỏi menu + chặn
   * truy cập trực tiếp (redirect về "/"). Trang chủ ('home') không bao giờ
   * được phép có trong mảng này — luôn bắt buộc hiển thị.
   */
  hiddenPages: string[]
}

export interface Album {
  id: string
  name: string
  order: number
}

export interface AlbumsFile {
  albums: Album[]
}

export type PhotoStatus = 'published' | 'pending' | 'rejected'

export interface Photo {
  id: string
  filename: string
  thumbnail: string
  /** Kích thước gốc (px) — dùng để đặt width/height chống layout shift (checklist 17.4) */
  width: number
  height: number
  albumId: string
  caption: string
  order: number
  uploadedBy: string
  status: PhotoStatus
  createdAt: string
}

export interface PhotosFile {
  photos: Photo[]
}

export interface Wish {
  id: string
  name: string
  message: string
  photo: string | null
  /** Kích thước gốc (px) của ảnh đính kèm — dùng để giữ đúng tỉ lệ khi hiển
   *  thị (không cắt vuông) + ước lượng chiều cao thẻ cho lưới masonry. Chỉ
   *  có giá trị khi `photo` khác null; dữ liệu lời chúc CŨ (trước khi thêm
   *  field này) có thể thiếu 2 field này dù có ảnh — nơi đọc phải fallback. */
  width: number | null
  height: number | null
  visible: boolean
  createdAt: string
}

export interface WishesFile {
  wishes: Wish[]
}

export interface AdminAuth {
  passwordHash: string
  failedAttempts: number
  lockedUntil: string | null
}
