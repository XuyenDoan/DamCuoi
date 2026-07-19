import { promises as fs } from 'node:fs'
import path from 'node:path'
import { requireAdmin } from '../../../utils/adminSession'
import { getUploadsDir } from '../../../utils/paths'
import { settingsStore } from '../../../utils/store'
import { isManagedPageKey } from '#shared/pages'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const pageKey = getRouterParam(event, 'pageKey')
  if (!pageKey || !isManagedPageKey(pageKey)) {
    throw createError({ statusCode: 400, statusMessage: 'Trang không hợp lệ' })
  }

  const current = await settingsStore.read()
  const existing = current.pageBackgrounds[pageKey]
  if (existing) {
    await fs.rm(path.join(getUploadsDir(), existing), { force: true })
  }

  await settingsStore.update((s) => ({
    ...s,
    pageBackgrounds: { ...s.pageBackgrounds, [pageKey]: null }
  }))

  return { success: true }
})
