import { promises as fs } from 'node:fs'
import path from 'node:path'
import { customAlphabet } from 'nanoid'
import { uploadsSubdir } from '../utils/paths'
import { wishesStore } from '../utils/store'
import { sharp } from '../utils/sharpLoader'
const genId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)

const MAX_MESSAGE_LENGTH = 1000
const MAX_NAME_LENGTH = 100
const MAX_FILE_SIZE = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  if (!parts) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu dữ liệu gửi lên' })
  }

  const nameField = parts.find((p) => p.name === 'name')
  const messageField = parts.find((p) => p.name === 'message')
  const photoField = parts.find((p) => p.name === 'photo' && p.filename)

  const name = (nameField?.data.toString('utf-8').trim() || '').slice(0, MAX_NAME_LENGTH)
  const message = (messageField?.data.toString('utf-8').trim() || '').slice(0, MAX_MESSAGE_LENGTH)

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng nhập tên của bạn' })
  }
  if (!message) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng nhập lời chúc' })
  }

  let photoPath: string | null = null
  let photoWidth: number | null = null
  let photoHeight: number | null = null
  if (photoField) {
    if (!photoField.type || !ALLOWED_TYPES.has(photoField.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Ảnh đính kèm không đúng định dạng (chỉ nhận JPG, PNG, WEBP)'
      })
    }
    if (photoField.data.length > MAX_FILE_SIZE) {
      throw createError({ statusCode: 400, statusMessage: 'Ảnh đính kèm vượt quá 15MB' })
    }

    const photoId = `wish_${genId()}`
    // Lấy luôn kích thước THẬT SAU KHI resize (không phải kích thước gốc
    // trước resize) qua {resolveWithObject: true} — đúng kích thước sẽ hiển
    // thị, dùng để giữ tỉ lệ ảnh khi render + ước lượng chiều cao thẻ masonry.
    const { data: webpBuffer, info } = await sharp(photoField.data)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true })

    const originalsDir = uploadsSubdir('originals')
    await fs.mkdir(originalsDir, { recursive: true })
    await fs.writeFile(path.join(originalsDir, `${photoId}.webp`), webpBuffer)
    photoPath = `originals/${photoId}.webp`
    photoWidth = info.width
    photoHeight = info.height
  }

  const wish = {
    id: `wish_${genId()}`,
    name,
    message,
    photo: photoPath,
    width: photoWidth,
    height: photoHeight,
    visible: true,
    createdAt: new Date().toISOString()
  }

  await wishesStore.update((current) => ({ wishes: [...current.wishes, wish] }))

  return wish
})
