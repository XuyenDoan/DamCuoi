/**
 * Phía trình duyệt của chống spam (xem `server/utils/antiSpam.ts`): giữ giá
 * trị ô ẩn "honeypot" + đo số ms từ lúc mở form tới lúc bấm gửi bằng đồng hồ
 * tương đối của trình duyệt (`performance.now()` — không phụ thuộc giờ máy
 * khách đúng hay sai). Dùng kèm component `BotTrapField.vue` trong <form>.
 */
export function useBotTraps() {
  const website = ref('')
  let openedAt = 0

  function start() {
    openedAt = performance.now()
    website.value = ''
  }
  function appendTo(formData: FormData) {
    formData.append('website', website.value)
    formData.append('fillMs', String(Math.round(performance.now() - openedAt)))
  }

  onMounted(start)
  return { website, start, appendTo }
}
