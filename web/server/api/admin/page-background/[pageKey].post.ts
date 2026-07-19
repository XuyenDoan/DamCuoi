import { promises as fs } from 'node:fs'
import path from 'node:path'
import { customAlphabet } from 'nanoid'
import { requireAdmin } from '../../../utils/adminSession'
import { uploadsSubdir, getUploadsDir } from '../../../utils/paths'
import { settingsStore } from '../../../utils/store'
import { sharp } from '../../../utils/sharpLoader'
import { isManagedPageKey } from '../../../../shared/pages'

const genId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)
const MAX_FILE_SIZE = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

/**
 * Ảnh nền riêng cho 1 trang cụ thể (Content Editor mục "Ảnh nền từng trang").
 * KHÔNG thuộc album/photos.json nào — chỉ dùng làm nền mờ phía sau nội dung
 * (PageBackdrop.vue), lưu ở /uploads/backgrounds/, tách biệt khỏi ảnh Album.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const pageKey = getRouterParam(event, 'pageKey')
  if (!pageKey || !isManagedPageKey(pageKey)) {
    throw createError({ statusCode: 400, statusMessage: 'Trang không hợp lệ' })
  }

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((p) => p.name === 'file' && p.filename)
  if (!filePart) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng chọn 1 ảnh' })
  }
  if (!filePart.type || !ALLOWED_TYPES.has(filePart.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Định dạng không hỗ trợ (chỉ nhận JPG, PNG hoặc WEBP)'
    })
  }
  if (filePart.data.length > MAX_FILE_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'Ảnh vượt quá 15MB' })
  }

  const previous = (await settingsStore.read()).pageBackgrounds[pageKey]

  const bgDir = uploadsSubdir('backgrounds')
  await fs.mkdir(bgDir, { recursive: true })

  const id = `bg_${pageKey}_${genId()}`
  const buffer = await sharp(filePart.data)
    .rotate()
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()
  await fs.writeFile(path.join(bgDir, `${id}.webp`), buffer)

  const relativePath = `backgrounds/${id}.webp`

  const updated = await settingsStore.update((current) => ({
    ...current,
    pageBackgrounds: { ...current.pageBackgrounds, [pageKey]: relativePath }
  }))

  if (previous && previous !== relativePath) {
    await fs.rm(path.join(getUploadsDir(), previous), { force: true })
  }

  return { pageKey, image: updated.pageBackgrounds[pageKey] }
})
