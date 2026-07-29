import { promises as fs } from 'node:fs'
import path from 'node:path'
import { requireAdmin } from '../../utils/adminSession'
import { getUploadsDir } from '../../utils/paths'
import { settingsStore } from '../../utils/store'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const current = await settingsStore.read()
  const existing = current.backgroundMusic
  if (existing) {
    await fs.rm(path.join(getUploadsDir(), existing), { force: true })
  }

  await settingsStore.update((s) => ({ ...s, backgroundMusic: null }))

  return { success: true }
})
