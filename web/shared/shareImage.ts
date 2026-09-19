/**
 * Ảnh xem trước khi chia sẻ link (Open Graph) — dùng CHUNG server (route
 * `/og-image.jpg` cắt/ép đúng cỡ) và client (`app.vue` gắn thẻ meta) để 2
 * bên luôn chọn CÙNG 1 ảnh nguồn.
 */
export const SHARE_IMAGE_WIDTH = 1200
export const SHARE_IMAGE_HEIGHT = 630

/** Ưu tiên ảnh hero đầu tiên, rồi ảnh chân dung cô dâu / chú rể. null = chưa có ảnh nào. */
export function pickShareImageSource(settings: {
  heroImages?: string[]
  siteImages?: Record<string, string | null | undefined>
}): string | null {
  return (
    settings.heroImages?.[0] ||
    settings.siteImages?.bridePortrait ||
    settings.siteImages?.groomPortrait ||
    null
  )
}
