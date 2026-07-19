import { photosStore } from '../utils/store'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { photos } = await photosStore.read()

  let list = photos.filter((p) => p.status === 'published')
  if (query.albumId && query.albumId !== 'all') {
    list = list.filter((p) => p.albumId === query.albumId)
  }

  return list.sort((a, b) => a.order - b.order)
})
