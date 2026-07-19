import { promises as fs } from 'node:fs'
import path from 'node:path'
import { getUploadsDir } from '../../../utils/paths'
import { photosStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { photos } = await photosStore.read()
  const photo = photos.find((p) => p.id === id && p.status === 'published')

  if (!photo) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy ảnh' })
  }

  const fullPath = path.join(getUploadsDir(), photo.filename)
  const data = await fs.readFile(fullPath)
  const downloadName = `${photo.id}${path.extname(photo.filename)}`

  setHeader(event, 'Content-Type', 'application/octet-stream')
  setHeader(event, 'Content-Disposition', `attachment; filename="${downloadName}"`)
  return data
})
