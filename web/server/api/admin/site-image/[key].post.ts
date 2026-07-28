import { promises as fs } from 'node:fs'
import path from 'node:path'
import { customAlphabet } from 'nanoid'
import { requireAdmin } from '../../../utils/adminSession'
import { uploadsSubdir, getUploadsDir } from '../../../utils/paths'
import { settingsStore } from '../../../utils/store'
import { sharp } from '../../../utils/sharpLoader'
import { isSiteImageKey } from '#shared/siteImages'

const genId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)
const MAX_FILE_SIZE = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

/**
 * Ảnh chân dung cố định của trang chủ (Content Editor mục "Ảnh trang chủ") —
 * hero + cô dâu + chú rể (spec.md mục 38). Cùng khuôn mẫu với
 * `page-background/[pageKey].post.ts`, chỉ khác thư mục lưu
 * (`/uploads/site-images/`) và tập key hợp lệ (3 key cố định thay vì danh
 * sách trang).
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const key = getRouterParam(event, 'key')
  if (!key || !isSiteImageKey(key)) {
    throw createError({ statusCode: 400, statusMessage: 'Ảnh không hợp lệ' })
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

  const previous = (await settingsStore.read()).siteImages[key]

  const dir = uploadsSubdir('site-images')
  await fs.mkdir(dir, { recursive: true })

  const id = `site_${key}_${genId()}`
  const buffer = await sharp(filePart.data)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()
  await fs.writeFile(path.join(dir, `${id}.webp`), buffer)

  const relativePath = `site-images/${id}.webp`

  const updated = await settingsStore.update((current) => ({
    ...current,
    siteImages: { ...current.siteImages, [key]: relativePath }
  }))

  if (previous && previous !== relativePath) {
    await fs.rm(path.join(getUploadsDir(), previous), { force: true })
  }

  return { key, image: updated.siteImages[key] }
})
