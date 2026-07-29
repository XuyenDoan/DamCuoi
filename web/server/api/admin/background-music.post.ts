import { promises as fs } from 'node:fs'
import path from 'node:path'
import { customAlphabet } from 'nanoid'
import { requireAdmin } from '../../utils/adminSession'
import { uploadsSubdir, getUploadsDir } from '../../utils/paths'
import { settingsStore } from '../../utils/store'

const genId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)
const MAX_FILE_SIZE = 20 * 1024 * 1024
const ALLOWED_TYPES: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav'
}

/**
 * Nhạc nền trang công khai (spec.md mục 41) — CHỈ 1 file tại 1 thời điểm,
 * cùng khuôn mẫu `site-image/[key].post.ts` (ghi thẳng settings.json ngay
 * khi upload, không cần cơ chế "lưu sau" như mảng nhiều ảnh). Không xử lý/
 * nén lại file âm thanh (khác ảnh — dự án không có công cụ transcode audio),
 * chỉ giới hạn định dạng + dung lượng rồi lưu nguyên trạng.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((p) => p.name === 'file' && p.filename)
  if (!filePart) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng chọn 1 file nhạc' })
  }
  const ext = filePart.type ? ALLOWED_TYPES[filePart.type] : undefined
  if (!ext) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Định dạng không hỗ trợ (chỉ nhận MP3, OGG hoặc WAV)'
    })
  }
  if (filePart.data.length > MAX_FILE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'File vượt quá 20MB' })
  }

  const previous = (await settingsStore.read()).backgroundMusic

  const dir = uploadsSubdir('audio')
  await fs.mkdir(dir, { recursive: true })

  const id = `music_${genId()}`
  const filename = `${id}.${ext}`
  await fs.writeFile(path.join(dir, filename), filePart.data)

  const relativePath = `audio/${filename}`

  const updated = await settingsStore.update((current) => ({
    ...current,
    backgroundMusic: relativePath
  }))

  if (previous && previous !== relativePath) {
    await fs.rm(path.join(getUploadsDir(), previous), { force: true })
  }

  return { backgroundMusic: updated.backgroundMusic }
})
