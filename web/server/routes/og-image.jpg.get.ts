import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getUploadsDir } from '../utils/paths'
import { settingsStore } from '../utils/store'
import { sharp } from '../utils/sharpLoader'
import { SHARE_IMAGE_HEIGHT, SHARE_IMAGE_WIDTH, pickShareImageSource } from '#shared/shareImage'

/**
 * Ảnh xem trước khi dán link web vào Zalo/Facebook/Messenger... (thẻ
 * `og:image`). Mạng xã hội cần JPEG/PNG đúng tỉ lệ ~1.91:1 (1200×630) — ảnh
 * hero gốc là WebP nhiều tỉ lệ khác nhau nên tạo bản riêng ở đây: cắt theo
 * vùng "đáng chú ý nhất" của ảnh (`attention` — ưu tiên khuôn mặt/chi tiết
 * nổi bật thay vì cắt cứng giữa ảnh). Có bộ nhớ đệm theo tên file nguồn
 * (tên file chứa mã ngẫu nhiên nên đổi ảnh = đổi tên = tự làm mới cache).
 */
const cache = new Map<string, Buffer>()

export default defineEventHandler(async (event) => {
  const settings = await settingsStore.read()
  const source = pickShareImageSource(settings)
  if (!source) {
    throw createError({ statusCode: 404, statusMessage: 'Chưa có ảnh để chia sẻ' })
  }

  const uploadsDir = path.normalize(getUploadsDir())
  const fullPath = path.normalize(path.join(uploadsDir, source))
  if (!fullPath.startsWith(uploadsDir + path.sep)) {
    throw createError({ statusCode: 403, statusMessage: 'Đường dẫn không hợp lệ' })
  }

  let jpeg = cache.get(source)
  if (!jpeg) {
    let input: Buffer
    try {
      input = await fs.readFile(fullPath)
    } catch {
      throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy ảnh' })
    }
    jpeg = await sharp(input)
      .rotate()
      .resize(SHARE_IMAGE_WIDTH, SHARE_IMAGE_HEIGHT, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 82, progressive: true })
      .toBuffer()
    if (cache.size > 8) cache.clear()
    cache.set(source, jpeg)
  }

  setHeader(event, 'Content-Type', 'image/jpeg')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return jpeg
})
