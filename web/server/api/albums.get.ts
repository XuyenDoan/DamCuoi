import { albumsStore } from '../utils/store'

export default defineEventHandler(async () => {
  const { albums } = await albumsStore.read()
  return [...albums].sort((a, b) => a.order - b.order)
})
