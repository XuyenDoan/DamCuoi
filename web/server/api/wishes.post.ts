import { promises as fs } from 'node:fs'
import path from 'node:path'
import { customAlphabet } from 'nanoid'
import { uploadsSubdir } from '../utils/paths'
import { wishesStore } from '../utils/store'
import { sharp } from '../utils/sharpLoader'
import { WISH_LIMITS, countLinks, isDuplicateMessage, looksLikeBot, takeQuota } from '../utils/antiSpam'
const genId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)

const MAX_MESSAGE_LENGTH = 1000
const MAX_NAME_LENGTH = 100
const MAX_FILE_SIZE = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export default defineEventHandler(async (event) => {
  // Chống spam (xem server/utils/antiSpam.ts): hạn mức theo IP + toàn cục
  // kiểm TRƯỚC khi đọc body để kẻ spam không tốn tài nguyên xử lý ảnh.
  takeQuota(
    event,
    'wish',
    WISH_LIMITS.perIp,
    WISH_LIMITS.global,
    1,
    'Bạn gửi hơi nhanh rồi, vui lòng đợi một chút rồi gửi lại nhé.'
  )

  const parts = await readMultipartFormData(event)
  if (!parts) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu dữ liệu gửi lên' })
  }

  // Bẫy bot: ô ẩn `website` + thời gian điền form. Trả về "thành công" giả
  // (không lưu gì) để bot không biết mình bị chặn mà đổi cách né.
  const honeypot = parts.find((p) => p.name === 'website')?.data.toString('utf-8') ?? ''
  const fillMs = parts.find((p) => p.name === 'fillMs')?.data.toString('utf-8') ?? ''
  if (looksLikeBot(honeypot, fillMs)) {
    return { id: 'wish_ok', name: '', message: '', photo: null, width: null, height: null, visible: false, approved: false, createdAt: new Date().toISOString() }
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
  if (countLinks(name) > 0 || countLinks(message) > 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Lời chúc không nên chứa đường link, bạn vui lòng bỏ link rồi gửi lại nhé.'
    })
  }
  if (isDuplicateMessage(event, message)) {
    throw createError({ statusCode: 400, statusMessage: 'Bạn vừa gửi đúng lời chúc này rồi, cảm ơn bạn!' })
  }

  const current = await wishesStore.read()
  if (current.wishes.filter((w) => w.approved === false).length >= WISH_LIMITS.pendingCap) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Hiện có quá nhiều lời chúc đang chờ duyệt, bạn vui lòng quay lại gửi sau nhé.'
    })
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
    approved: false,
    createdAt: new Date().toISOString()
  }

  await wishesStore.update((current) => ({ wishes: [...current.wishes, wish] }))

  return wish
})
