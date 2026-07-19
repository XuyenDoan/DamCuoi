import { promises as fs } from 'node:fs'
import path from 'node:path'
import { requireAdmin } from '../../../utils/adminSession'
import { getUploadsDir } from '../../../utils/paths'
import { wishesStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  const { wishes } = await wishesStore.read()
  const wish = wishes.find((w) => w.id === id)
  if (!wish) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy lời chúc' })
  }

  if (wish.photo) {
    await fs.rm(path.join(getUploadsDir(), wish.photo), { force: true })
  }

  await wishesStore.update((current) => ({ wishes: current.wishes.filter((w) => w.id !== id) }))
  return { success: true }
})
