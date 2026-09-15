import { promises as fs } from 'node:fs'
import path from 'node:path'
import { customAlphabet } from 'nanoid'
import { uploadsSubdir } from '../utils/paths'
import { photosStore } from '../utils/store'
import { sharp } from '../utils/sharpLoader'
import type { Photo } from '../utils/types'

// Lớp bảo vệ bắt buộc khi upload công khai (spec.md mục 15.3) — captcha/rate-limit
// chưa bật theo quyết định đã trao đổi, chỉ giới hạn dung lượng/loại file + duyệt thủ công.
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILES_PER_REQUEST = 20
const GUEST_ALBUM_ID = 'album_khach-moi'

const genId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)

interface UploadResult {
  originalName: string
  status: 'success' | 'error'
  message?: string
}

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Không có dữ liệu gửi lên' })
  }

  const nameField = parts.find((p) => p.name === 'name')
  const uploaderName = nameField?.data.toString('utf-8').trim() || 'Ẩn danh'

  const fileParts = parts.filter((p) => p.name === 'files' && p.filename)
  if (fileParts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng chọn ít nhất 1 ảnh' })
  }
  if (fileParts.length > MAX_FILES_PER_REQUEST) {
    throw createError({
      statusCode: 400,
      statusMessage: `Chỉ được gửi tối đa ${MAX_FILES_PER_REQUEST} ảnh mỗi lần`
    })
  }

  const pendingDir = uploadsSubdir('pending')
  await fs.mkdir(pendingDir, { recursive: true })

  const results: UploadResult[] = []
  const newPhotoEntries: Photo[] = []

  for (const file of fileParts) {
    const originalName = file.filename || 'anh.jpg'

    if (!file.type || !ALLOWED_TYPES.has(file.type)) {
      results.push({
        originalName,
        status: 'error',
        message: 'Định dạng không hỗ trợ (chỉ nhận JPG, PNG hoặc WEBP)'
      })
      continue
    }
    if (file.data.length > MAX_FILE_SIZE) {
      results.push({
        originalName,
        status: 'error',
        message: 'Ảnh vượt quá 15MB, vui lòng chọn ảnh nhỏ hơn'
      })
      continue
    }

    try {
      const id = `guest_${genId()}`
      // Lỗi thật đã gặp (cùng lỗi đã fix ở love-story-photo.post.ts): gọi
      // `.metadata()` RIÊNG sau `.rotate()` trả về kích thước ảnh GỐC TRƯỚC
      // KHI XOAY (EXIF orientation chưa áp dụng vào pixel) — ảnh khách gửi
      // chụp dọc bằng điện thoại bị lưu nhầm thành số đo ngang, làm lệch
      // lưới masonry ở Album. Lấy `info` từ chính `toBuffer({resolveWithObject:
      // true})` — kích thước THẬT của file đã xoay xong.
      const { data: webpBuffer, info } = await sharp(file.data)
        .rotate() // tự xoay theo EXIF trước khi bỏ metadata
        .webp({ quality: 85 })
        .toBuffer({ resolveWithObject: true })
      await fs.writeFile(path.join(pendingDir, `${id}.webp`), webpBuffer)

      newPhotoEntries.push({
        id,
        filename: `pending/${id}.webp`,
        thumbnail: `pending/${id}.webp`,
        width: info.width,
        height: info.height,
        albumId: GUEST_ALBUM_ID,
        caption: '',
        order: 0,
        uploadedBy: uploaderName,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      results.push({ originalName, status: 'success' })
    } catch {
      results.push({
        originalName,
        status: 'error',
        message: 'Không xử lý được ảnh này, vui lòng thử ảnh khác'
      })
    }
  }

  if (newPhotoEntries.length > 0) {
    await photosStore.update((current) => {
      const startOrder = current.photos.length
      const entriesWithOrder = newPhotoEntries.map((p, i) => ({ ...p, order: startOrder + i + 1 }))
      return { photos: [...current.photos, ...entriesWithOrder] }
    })
  }

  return { results }
})
