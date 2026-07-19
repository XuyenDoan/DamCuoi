import { createReadStream } from 'node:fs'
import path from 'node:path'
import { getUploadsDir } from '../../../utils/paths'
import { createZipArchive } from '../../../utils/archiverLoader'
import { albumsStore, photosStore } from '../../../utils/store'

/**
 * Tải toàn bộ ảnh trong 1 album dưới dạng file zip — nén phía server
 * theo spec.md mục 10, tránh treo trình duyệt khách khi album lớn.
 */
export default defineEventHandler(async (event) => {
  const albumId = getRouterParam(event, 'id')
  const { albums } = await albumsStore.read()
  const album = albums.find((a) => a.id === albumId)
  if (!album) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy album' })
  }

  const { photos } = await photosStore.read()
  const albumPhotos = photos.filter((p) => p.albumId === albumId && p.status === 'published')
  if (albumPhotos.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Album chưa có ảnh nào để tải' })
  }

  setHeader(event, 'Content-Type', 'application/zip')
  setHeader(event, 'Content-Disposition', `attachment; filename="${album.id}.zip"`)

  const archive = createZipArchive({ zlib: { level: 6 } })
  const uploadsDir = getUploadsDir()

  for (const photo of albumPhotos) {
    const fullPath = path.join(uploadsDir, photo.filename)
    const entryName = `${photo.id}${path.extname(photo.filename)}`
    archive.append(createReadStream(fullPath), { name: entryName })
  }

  archive.finalize()
  return sendStream(event, archive)
})
