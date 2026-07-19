import type { Wish } from '../../server/utils/types'

export function useWishes() {
  return useAsyncData<Wish[]>('wishes', () => $fetch('/api/wishes'))
}
