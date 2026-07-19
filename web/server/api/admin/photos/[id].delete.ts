import { promises as fs } from 'node:fs'
import path from 'node:path'
import { requireAdmin } from '../../../utils/adminSession'
import { getUploadsDir } from '../../../utils/paths'
import { photosStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  const { photos } = await photosStore.read()
  const photo = photos.find((p) => p.id === id)
  if (!photo) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy ảnh' })
  }

  const uploadsDir = getUploadsDir()
  await fs.rm(path.join(uploadsDir, photo.filename), { force: true })
  if (photo.thumbnail !== photo.filename) {
    await fs.rm(path.join(uploadsDir, photo.thumbnail), { force: true })
  }

  await photosStore.update((current) => ({ photos: current.photos.filter((p) => p.id !== id) }))

  return { success: true }
})
