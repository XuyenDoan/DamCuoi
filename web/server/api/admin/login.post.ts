import { adminStore } from '../../utils/store'
import { useAdminSession } from '../../utils/adminSession'
import { nodeRequire } from '../../utils/nodeRequire'

const bcrypt = nodeRequire('bcryptjs') as typeof import('bcryptjs')

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000

export default defineEventHandler(async (event) => {
  const body = await readBody<{ password?: string }>(event)
  const password = body?.password ?? ''

  const admin = await adminStore.read()

  if (admin.lockedUntil && new Date(admin.lockedUntil).getTime() > Date.now()) {
    const remainingMin = Math.ceil((new Date(admin.lockedUntil).getTime() - Date.now()) / 60000)
    throw createError({
      statusCode: 429,
      statusMessage: `Đã nhập sai mật khẩu quá nhiều lần. Vui lòng thử lại sau ${remainingMin} phút.`
    })
  }

  const isValid = admin.passwordHash ? bcrypt.compareSync(password, admin.passwordHash) : false

  if (!isValid) {
    const updated = await adminStore.update((current) => {
      const failedAttempts = current.failedAttempts + 1
      const lockedUntil =
        failedAttempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS).toISOString() : null
      return { ...current, failedAttempts, lockedUntil }
    })
    if (updated.lockedUntil) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Đã nhập sai mật khẩu quá 5 lần. Tài khoản tạm khoá 5 phút.'
      })
    }
    throw createError({ statusCode: 401, statusMessage: 'Sai mật khẩu, vui lòng thử lại.' })
  }

  await adminStore.update((current) => ({ ...current, failedAttempts: 0, lockedUntil: null }))

  const session = await useAdminSession(event)
  await session.update({ isAdmin: true })

  return { success: true }
})
