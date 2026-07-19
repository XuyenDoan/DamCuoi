import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getUploadsDir } from '../../utils/paths'

const MIME: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png'
}

/**
 * Phục vụ ảnh tĩnh từ /uploads (nằm ngoài web/, ở gốc dự án — mục 14.1).
 * Không dùng thư mục public/ của Nuxt vì /uploads phải tách biệt để backup/deploy độc lập.
 */
export default defineEventHandler(async (event) => {
  const rawParam = event.context.params?.path
  const relPath = Array.isArray(rawParam) ? rawParam.join('/') : rawParam
  if (!relPath) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu đường dẫn file' })
  }

  // Ảnh trong pending/ chưa được admin duyệt — không phục vụ công khai
  if (relPath.startsWith('pending/') || relPath.startsWith('pending\\')) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy ảnh' })
  }

  const uploadsDir = getUploadsDir()
  const fullPath = path.normalize(path.join(uploadsDir, relPath))

  // Chặn path traversal — fullPath phải nằm trong uploadsDir
  if (!fullPath.startsWith(path.normalize(uploadsDir) + path.sep)) {
    throw createError({ statusCode: 403, statusMessage: 'Đường dẫn không hợp lệ' })
  }

  try {
    const data = await fs.readFile(fullPath)
    const ext = path.extname(fullPath).toLowerCase()
    setHeader(event, 'Content-Type', MIME[ext] || 'application/octet-stream')
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return data
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy ảnh' })
  }
})
