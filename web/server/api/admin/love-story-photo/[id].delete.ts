import { promises as fs } from 'node:fs'
import path from 'node:path'
import { requireAdmin } from '../../../utils/adminSession'
import { uploadsSubdir } from '../../../utils/paths'

/** Xoá file vật lý 1 ảnh mốc "Câu chuyện tình yêu" — id khớp tên file `love-story/{id}.webp` */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id || !/^[a-z0-9_]+$/i.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Id ảnh không hợp lệ' })
  }

  await fs.rm(path.join(uploadsSubdir('love-story'), `${id}.webp`), { force: true })
  return { success: true }
})
