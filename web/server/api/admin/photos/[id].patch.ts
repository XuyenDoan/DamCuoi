import { requireAdmin } from '../../../utils/adminSession'
import { photosStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ caption?: string; albumId?: string; order?: number }>(event)

  let found = false
  const updated = await photosStore.update((current) => {
    const photos = current.photos.map((p) => {
      if (p.id !== id) return p
      found = true
      return {
        ...p,
        caption: body.caption !== undefined ? body.caption.trim() : p.caption,
        albumId: body.albumId ?? p.albumId,
        order: body.order !== undefined ? body.order : p.order
      }
    })
    return { photos }
  })

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy ảnh' })
  }
  return updated.photos.find((p) => p.id === id)
})
