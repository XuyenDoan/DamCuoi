import { useAdminSession } from '../../utils/adminSession'

export default defineEventHandler(async (event) => {
  const session = await useAdminSession(event)
  await session.clear()
  return { success: true }
})
