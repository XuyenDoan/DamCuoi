/**
 * Danh sách phong cách giao diện website (spec.md mục 36) — đặt ở shared/
 * theo đúng quy ước MANAGED_PAGES (shared/pages.ts): server (validate khi
 * lưu settings) và client (admin UI chọn theme, layout công khai) dùng
 * CHUNG 1 nguồn, tránh lệch danh sách. Thêm Theme 3/4 sau này chỉ cần thêm
 * 1 phần tử vào mảng này + 1 bộ layout/component theme tương ứng — không
 * cần sửa API hay schema dữ liệu.
 */
export interface WebsiteThemeMeta {
  id: string
  /** Tên hiển thị trong Admin */
  label: string
  /** Tên tiếng Anh ngắn — phụ đề cho label */
  subLabel: string
  /** Mô tả ngắn hiển thị trong thẻ chọn theme ở Admin */
  description: string
  /** 4-5 màu đại diện, dùng vẽ swatch preview trong Admin */
  palette: string[]
  /** Tên font hiển thị cho người dùng đọc trong Admin (không phải giá trị CSS) */
  fonts: { heading: string; body: string }
}

export const WEBSITE_THEMES: WebsiteThemeMeta[] = [
  {
    id: 'default',
    label: 'Hoa Sen',
    subLabel: 'Mặc định',
    description:
      'Hoạ tiết hoa sen động, tông hồng – xanh lá, storytelling cuộn mềm mại. Giao diện gốc của website.',
    palette: ['#DB2777', '#4D7C5F', '#FDF2F8', '#C9A227'],
    fonts: { heading: 'Playfair Display', body: 'Be Vietnam Pro' }
  },
  {
    id: 'editorial',
    label: 'Biên Tập Sang Trọng',
    subLabel: 'Modern Editorial',
    description:
      'Lấy cảm hứng tạp chí thời trang cao cấp — typography lớn, ảnh full-bleed, khoảng trắng chủ động, không hoạ tiết trang trí.',
    palette: ['#1C2333', '#F5F1E6', '#FFFFFF', '#644C2A'],
    fonts: { heading: 'Bodoni Moda', body: 'Libre Franklin' }
  },
  {
    id: 'cinematic',
    label: 'Điện Ảnh Cuộn',
    subLabel: 'Cinematic Scroll',
    description:
      'Mỗi màn hình là 1 cảnh phim full-bleed, cuộn qua từng khoảnh khắc câu chuyện — chuyển động chậm, có kiểm soát.',
    palette: ['#16130F', '#F2EAD9', '#D4A463', '#AD7B72'],
    fonts: { heading: 'Fraunces', body: 'Karla' }
  },
  {
    id: 'glass',
    label: 'Kính Mờ Ánh Sáng',
    subLabel: 'Glassmorphism Aurora',
    description:
      'Nền cực quang (aurora) trôi chậm, nội dung đặt trong khối kính mờ nổi bồng bềnh — ánh sáng theo dõi con trỏ chuột.',
    palette: ['#2B2438', '#FAF7F5', '#7A3157', '#554B87'],
    fonts: { heading: 'Instrument Serif', body: 'Manrope' }
  },
  {
    id: 'bento',
    label: 'Lưới Chuyển Động',
    subLabel: 'Bento Motion Grid',
    description:
      'Trang chủ dạng lưới ô to/nhỏ xen kẽ kiểu Apple/Notion, nghiêng nhẹ theo chuột, bay vào theo nhịp khi tải trang.',
    palette: ['#262220', '#FAF6EF', '#973520', '#33543F'],
    fonts: { heading: 'Sora', body: 'Plus Jakarta Sans' }
  },
  {
    id: 'kinetic',
    label: 'Chữ Cuộn Kịch Tính',
    subLabel: 'Kinetic Scroll Typography',
    description:
      'Chữ cỡ lớn đậm dần, đổi màu, trượt vào đúng lúc cuộn tới — kể câu chuyện tình yêu như một bài thơ chuyển động.',
    palette: ['#211C1A', '#FAF8F4', '#8A2626', '#4A3F3A'],
    fonts: { heading: 'Bricolage Grotesque', body: 'Archivo' }
  }
]

export const DEFAULT_WEBSITE_THEME = 'default'

export function isValidThemeId(id: unknown): id is string {
  return typeof id === 'string' && WEBSITE_THEMES.some((t) => t.id === id)
}
