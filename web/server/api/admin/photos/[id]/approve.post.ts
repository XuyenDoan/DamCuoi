import { promises as fs } from 'node:fs'
import path from 'node:path'
import { requireAdmin } from '../../../../utils/adminSession'
import { getUploadsDir, uploadsSubdir } from '../../../../utils/paths'
import { photosStore } from '../../../../utils/store'
import { sharp } from '../../../../utils/sharpLoader'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  const { photos } = await photosStore.read()
  const photo = photos.find((p) => p.id === id && p.status === 'pending')
  if (!photo) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy ảnh đang chờ duyệt' })
  }

  const uploadsDir = getUploadsDir()
  const pendingPath = path.join(uploadsDir, photo.filename)
  const buffer = await fs.readFile(pendingPath)

  const originalsDir = uploadsSubdir('originals')
  const thumbsDir = uploadsSubdir('thumbnails')
  await fs.mkdir(originalsDir, { recursive: true })
  await fs.mkdir(thumbsDir, { recursive: true })

  await fs.writeFile(path.join(originalsDir, `${id}.webp`), buffer)
  const thumbBuffer = await sharp(buffer)
    .resize({ width: 600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()
  await fs.writeFile(path.join(thumbsDir, `${id}.webp`), thumbBuffer)
  await fs.rm(pendingPath, { force: true })

  const updated = await photosStore.update((current) => ({
    photos: current.photos.map((p) =>
      p.id === id
        ? {
            ...p,
            filename: `originals/${id}.webp`,
            thumbnail: `thumbnails/${id}.webp`,
            status: 'published' as const
          }
        : p
    )
  }))

  return updated.photos.find((p) => p.id === id)
})
