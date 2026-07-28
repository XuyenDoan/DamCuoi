import { promises as fs } from 'node:fs'
import path from 'node:path'
import { requireAdmin } from '../../../utils/adminSession'
import { getUploadsDir } from '../../../utils/paths'
import { settingsStore } from '../../../utils/store'
import { isSiteImageKey } from '#shared/siteImages'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const key = getRouterParam(event, 'key')
  if (!key || !isSiteImageKey(key)) {
    throw createError({ statusCode: 400, statusMessage: 'Ảnh không hợp lệ' })
  }

  const current = await settingsStore.read()
  const existing = current.siteImages[key]
  if (existing) {
    await fs.rm(path.join(getUploadsDir(), existing), { force: true })
  }

  await settingsStore.update((s) => ({
    ...s,
    siteImages: { ...s.siteImages, [key]: null }
  }))

  return { success: true }
})
