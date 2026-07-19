import { wishesStore } from '../utils/store'

export default defineEventHandler(async () => {
  const { wishes } = await wishesStore.read()
  return wishes
    .filter((w) => w.visible)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})
