// Kiểu dữ liệu khớp với schema mô tả trong spec.md mục 14.2-14.3
import type { SiteImageKey } from '#shared/siteImages'

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
  /**
   * Ảnh carousel đầu trang chủ (spec.md mục 40) — 0..n ảnh, TỰ ĐỘNG chuyển
   * lần lượt theo đúng thứ tự mảng này (thứ tự do admin sắp xếp bằng nút
   * lên/xuống). Khác cơ chế `siteImages`/`pageBackgrounds` (ghi thẳng
   * settings.json ngay khi upload): giống hệt `loveStory[].photos` — upload
   * qua `/api/admin/hero-image` chỉ lưu FILE vật lý + trả về đường dẫn, còn
   * mảng này chỉ thật sự lưu vào settings.json khi admin bấm "Lưu thay đổi"
   * (PUT /api/settings) — cho phép sắp xếp/xoá thử trước khi lưu chính thức.
   */
  heroImages: string[]
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
  /**
   * Ảnh chân dung cố định của trang chủ (khớp key trong shared/siteImages.ts
   * — spec.md mục 38): ảnh đầu trang + ảnh cô dâu/chú rể ở khối giới thiệu
   * trước "Câu Chuyện Của Chúng Tôi". Khác `pageBackgrounds` (ảnh NỀN mờ phía
   * sau nội dung) — đây là ảnh hiển thị TRỰC TIẾP trong nội dung. Giá trị
   * null -> không hiển thị khối/ảnh đó (không có placeholder trên trang công
   * khai, chỉ admin thấy khung trống để tải lên).
   */
  siteImages: Record<SiteImageKey, string | null>
  /**
   * Phong cách giao diện đang áp dụng cho toàn bộ trang công khai (khớp id
   * trong shared/themes.ts — spec.md mục 36). Chỉ đổi LAYOUT/COMPONENT/STYLE
   * hiển thị, không đụng tới field nào khác của Settings — mọi theme đọc
   * chung đúng dữ liệu này. Field TUỲ CHỌN để dữ liệu settings.json cũ (chưa
   * có field này) vẫn đọc được bình thường — fallback về 'default' ở
   * server/utils/store.ts, không cần migrate dữ liệu cũ.
   */
  websiteTheme?: string
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
