import { promises as fs } from 'node:fs'
import path from 'node:path'
import { requireAdmin } from '../../../utils/adminSession'
import { getUploadsDir } from '../../../utils/paths'
import { photosStore } from '../../../utils/store'

/**
 * Cho phép admin xem cả ảnh trong pending/ (route công khai /uploads/pending/*
 * cố tình chặn — mục 15.3). Yêu cầu session admin hợp lệ.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  const { photos } = await photosStore.read()
  const photo = photos.find((p) => p.id === id)
  if (!photo) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy ảnh' })
  }

  const data = await fs.readFile(path.join(getUploadsDir(), photo.filename))
  setHeader(event, 'Content-Type', 'image/webp')
  setHeader(event, 'Cache-Control', 'private, no-store')
  return data
})
