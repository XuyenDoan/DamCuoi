import { promises as fs } from 'node:fs'
import path from 'node:path'
import { customAlphabet } from 'nanoid'
import { requireAdmin } from '../../utils/adminSession'
import { uploadsSubdir } from '../../utils/paths'
import { sharp } from '../../utils/sharpLoader'
import type { LightboxPhoto } from '../../utils/types'

const genId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)
const MAX_FILE_SIZE = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

/**
 * Ảnh minh hoạ cho từng mốc "Câu chuyện tình yêu" (Content Editor) — nhận
 * NHIỀU ảnh cùng lúc, lưu vào /uploads/love-story/, tách biệt khỏi Album.
 * KHÔNG ghi vào settings.json ở đây — gắn ảnh vào đúng mốc + lưu vẫn đi qua
 * PUT /api/settings khi admin bấm "Lưu thay đổi" (đúng kiến trúc hiện có:
 * mọi thay đổi settings.json chỉ ghi ở 1 chỗ).
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const parts = await readMultipartFormData(event)
  const fileParts = parts?.filter((p) => p.name === 'files' && p.filename) ?? []
  if (fileParts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng chọn ít nhất 1 ảnh' })
  }

  const dir = uploadsSubdir('love-story')
  await fs.mkdir(dir, { recursive: true })

  const uploaded: LightboxPhoto[] = []

  for (const file of fileParts) {
    if (!file.type || !ALLOWED_TYPES.has(file.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Định dạng không hỗ trợ: ${file.filename}`
      })
    }
    if (file.data.length > MAX_FILE_SIZE) {
      throw createError({ statusCode: 400, statusMessage: `Ảnh vượt quá 15MB: ${file.filename}` })
    }

    const id = `ls_${genId()}`
    // Lỗi thật đã gặp (phản hồi chủ dự án: "ảnh dọc hiển thị luôn ra ngang"):
    // `sharp(...).rotate()` rồi gọi `.metadata()` RIÊNG trả về kích thước ảnh
    // GỐC TRƯỚC KHI XOAY (EXIF orientation chưa áp dụng vào pixel) — ảnh điện
    // thoại chụp dọc (orientation 6/8) bị lưu nhầm thành số đo NGANG. Phải lấy
    // `info` từ chính `toBuffer({resolveWithObject: true})` — đó là kích
    // thước THẬT của file đã xoay xong, đúng với những gì trình duyệt hiển
    // thị (giống cách `wishes.post.ts` đã làm đúng từ đầu).
    const { data: buffer, info } = await sharp(file.data)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true })
    await fs.writeFile(path.join(dir, `${id}.webp`), buffer)

    uploaded.push({
      id,
      filename: `love-story/${id}.webp`,
      width: info.width,
      height: info.height
    })
  }

  return { photos: uploaded }
})
