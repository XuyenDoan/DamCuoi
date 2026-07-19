import { requireAdmin } from '../../../utils/adminSession'
import { wishesStore } from '../../../utils/store'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ visible: boolean }>(event)

  let found = false
  const updated = await wishesStore.update((current) => ({
    wishes: current.wishes.map((w) => {
      if (w.id !== id) return w
      found = true
      return { ...w, visible: body.visible }
    })
  }))

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy lời chúc' })
  }
  return updated.wishes.find((w) => w.id === id)
})
