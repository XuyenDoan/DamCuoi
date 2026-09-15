/**
 * Đo tỉ lệ THẬT của ảnh cá nhân (câu chuyện tình yêu, lời chúc...) ngay khi
 * tải xong trên trình duyệt (`naturalWidth`/`naturalHeight`), ưu tiên dùng
 * số đo này thay vì `width`/`height` lưu sẵn trong dữ liệu.
 *
 * Lý do (bug thật đã gặp — "chọn ảnh dọc vẫn hiện ra ngang"): API upload
 * từng gọi `sharp(...).rotate()` rồi `.metadata()` RIÊNG, trả về kích thước
 * ẢNH GỐC TRƯỚC KHI XOAY theo EXIF — ảnh điện thoại chụp dọc bị lưu nhầm
 * thành số đo ngang. Đã sửa đúng ở API (`love-story-photo.post.ts`,
 * `upload.post.ts`, `admin/photos.post.ts`), nhưng ảnh tải lên TRƯỚC các bản
 * fix đó vẫn còn lưu sai trong dữ liệu cũ. Đo lại trực tiếp từ file ảnh thật
 * (luôn đúng, vì trình duyệt giải mã đúng chiều ảnh đã xoay) giúp "chữa
 * lành" ảnh cũ mà không cần tải lại — dùng chung 1 chỗ cho mọi nơi hiển thị
 * ảnh theo đúng tỉ lệ gốc (Câu Chuyện Tình Yêu ở cả 6 theme).
 */
export function usePhotoAspectRatio() {
  const measuredRatios = ref<Record<string, number>>({})

  function onPhotoLoad(e: Event, photoId: string) {
    const img = e.target as HTMLImageElement
    if (img.naturalWidth && img.naturalHeight) {
      measuredRatios.value[photoId] = img.naturalWidth / img.naturalHeight
    }
  }

  function photoAspectRatio(
    photo: { id: string; width?: number; height?: number } | undefined,
    fallback = '4 / 3'
  ): string {
    if (!photo) return fallback
    const measured = measuredRatios.value[photo.id]
    if (measured) return String(measured)
    if (!photo.width || !photo.height) return fallback
    return `${photo.width} / ${photo.height}`
  }

  return { onPhotoLoad, photoAspectRatio }
}
