import { requireAdmin } from '../../utils/adminSession'
import { photosStore } from '../../utils/store'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { photos } = await photosStore.read()
  return [...photos].sort((a, b) => a.order - b.order)
})
