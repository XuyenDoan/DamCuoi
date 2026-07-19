import { requireAdmin } from '../../utils/adminSession'
import { wishesStore } from '../../utils/store'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { wishes } = await wishesStore.read()
  return [...wishes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})
