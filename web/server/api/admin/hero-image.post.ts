import { promises as fs } from 'node:fs'
import path from 'node:path'
import { customAlphabet } from 'nanoid'
import { requireAdmin } from '../../utils/adminSession'
import { uploadsSubdir } from '../../utils/paths'
import { sharp } from '../../utils/sharpLoader'

const genId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)
const MAX_FILE_SIZE = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

/**
 * Ảnh carousel đầu trang chủ (spec.md mục 40) — nhận NHIỀU ảnh cùng lúc,
 * lưu vào /uploads/hero-images/. Cùng khuôn mẫu `love-story-photo.post.ts`
 * (chỉ lưu file vật lý + trả đường dẫn, KHÔNG ghi settings.json ở đây —
 * mảng `heroImages` chỉ thật sự lưu khi admin bấm "Lưu thay đổi" ở
 * PUT /api/settings, cho phép sắp xếp/xoá thử trước khi lưu chính thức).
 * Resize 2000px (khác 1600px của love-story) vì đây là banner full-bleed
 * đầu trang, khớp độ phân giải đã dùng cho ảnh hero đơn trước đây
 * (site-image/[key].post.ts).
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const parts = await readMultipartFormData(event)
  const fileParts = parts?.filter((p) => p.name === 'files' && p.filename) ?? []
  if (fileParts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng chọn ít nhất 1 ảnh' })
  }

  const dir = uploadsSubdir('hero-images')
  await fs.mkdir(dir, { recursive: true })

  const uploaded: string[] = []

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

    const id = `hero_${genId()}`
    const buffer = await sharp(file.data)
      .rotate()
      .resize({ width: 2000, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer()
    await fs.writeFile(path.join(dir, `${id}.webp`), buffer)

    uploaded.push(`hero-images/${id}.webp`)
  }

  return { images: uploaded }
})
