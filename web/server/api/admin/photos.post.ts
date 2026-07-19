import { promises as fs } from 'node:fs'
import path from 'node:path'
import { customAlphabet } from 'nanoid'
import { requireAdmin } from '../../utils/adminSession'
import { uploadsSubdir } from '../../utils/paths'
import { albumsStore, photosStore } from '../../utils/store'
import { sharp } from '../../utils/sharpLoader'
import type { Photo } from '../../utils/types'

const genId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)

const MAX_FILE_SIZE = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface UploadResult {
  originalName: string
  status: 'success' | 'error'
  message?: string
}

/** Admin tự upload ảnh — publish ngay, không qua hàng chờ duyệt (khác upload công khai) */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const parts = await readMultipartFormData(event)
  if (!parts) {
    throw createError({ statusCode: 400, statusMessage: 'Không có dữ liệu gửi lên' })
  }

  const albumField = parts.find((p) => p.name === 'albumId')
  const albumId = albumField?.data.toString('utf-8') || ''
  const { albums } = await albumsStore.read()
  if (!albums.find((a) => a.id === albumId)) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng chọn album hợp lệ' })
  }

  const fileParts = parts.filter((p) => p.name === 'files' && p.filename)
  if (fileParts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng chọn ít nhất 1 ảnh' })
  }

  const originalsDir = uploadsSubdir('originals')
  const thumbsDir = uploadsSubdir('thumbnails')
  await fs.mkdir(originalsDir, { recursive: true })
  await fs.mkdir(thumbsDir, { recursive: true })

  const results: UploadResult[] = []
  const newEntries: Photo[] = []

  for (const file of fileParts) {
    const originalName = file.filename || 'anh.jpg'

    if (!file.type || !ALLOWED_TYPES.has(file.type)) {
      results.push({ originalName, status: 'error', message: 'Định dạng không hỗ trợ' })
      continue
    }
    if (file.data.length > MAX_FILE_SIZE) {
      results.push({ originalName, status: 'error', message: 'Ảnh vượt quá 15MB' })
      continue
    }

    try {
      const id = `photo_${genId()}`
      const oriented = sharp(file.data).rotate()
      const metadata = await oriented.metadata()
      const originalBuffer = await oriented.webp({ quality: 90 }).toBuffer()
      await fs.writeFile(path.join(originalsDir, `${id}.webp`), originalBuffer)

      const thumbBuffer = await sharp(file.data)
        .rotate()
        .resize({ width: 600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
      await fs.writeFile(path.join(thumbsDir, `${id}.webp`), thumbBuffer)

      newEntries.push({
        id,
        filename: `originals/${id}.webp`,
        thumbnail: `thumbnails/${id}.webp`,
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
        albumId,
        caption: '',
        order: 0,
        uploadedBy: 'admin',
        status: 'published',
        createdAt: new Date().toISOString()
      })
      results.push({ originalName, status: 'success' })
    } catch {
      results.push({ originalName, status: 'error', message: 'Không xử lý được ảnh này' })
    }
  }

  if (newEntries.length > 0) {
    await photosStore.update((current) => {
      const startOrder = current.photos.length
      const withOrder = newEntries.map((p, i) => ({ ...p, order: startOrder + i + 1 }))
      return { photos: [...current.photos, ...withOrder] }
    })
  }

  return { results }
})
