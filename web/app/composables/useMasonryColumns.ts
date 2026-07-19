import type { Ref } from 'vue'

/**
 * Số cột masonry theo breakpoint (đồng bộ Tailwind sm/lg đang dùng ở toàn
 * site: 2 cột mobile -> 3 cột sm -> 4 cột lg).
 */
export function useColumnCount() {
  const columnCount = ref(2)

  function update() {
    const w = window.innerWidth
    if (w >= 1024) columnCount.value = 4
    else if (w >= 640) columnCount.value = 3
    else columnCount.value = 2
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update, { passive: true })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', update)
  })

  return columnCount
}

/**
 * Masonry cột cân bằng (greedy shortest-column) — thay cho CSS `columns-*`
 * (phân bổ theo thứ tự đọc, không theo chiều cao thực tế -> để lại khoảng
 * trống lớn ở cột cuối khi ảnh có tỉ lệ chênh lệch nhau, đúng vấn đề cần sửa).
 * Mỗi ảnh được đẩy vào cột đang "thấp" nhất, chiều cao ước lượng từ tỉ lệ
 * height/width gốc (width cột coi như bằng nhau nên tỉ lệ này đủ để so sánh).
 */
export function useMasonryColumns<T extends { width: number; height: number }>(
  photos: Ref<T[]>,
  columnCount: Ref<number>
) {
  return computed(() => {
    const count = Math.max(1, columnCount.value)
    const columns: T[][] = Array.from({ length: count }, () => [])
    const heights = new Array(count).fill(0)

    for (const photo of photos.value) {
      const ratio = photo.width > 0 ? photo.height / photo.width : 1
      let shortest = 0
      for (let i = 1; i < count; i++) {
        if (heights[i] < heights[shortest]) shortest = i
      }
      columns[shortest].push(photo)
      heights[shortest] += ratio
    }

    return columns
  })
}
