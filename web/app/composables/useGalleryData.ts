import type { Album, Photo } from '../../server/utils/types'

export function useAlbums() {
  return useAsyncData<Album[]>('albums', () => $fetch('/api/albums'))
}

export function usePublishedPhotos() {
  return useAsyncData<Photo[]>('photos', () => $fetch('/api/photos'))
}
