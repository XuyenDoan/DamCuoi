export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return

  // Bắt buộc dùng useRequestFetch() thay vì $fetch trơn: khi tải trang admin
  // trực tiếp (F5, mở link mới), middleware chạy trên server (SSR) và $fetch
  // thường KHÔNG tự chuyển tiếp cookie của request gốc sang lệnh gọi API nội bộ
  // → luôn coi là chưa đăng nhập dù cookie hợp lệ. useRequestFetch() khắc phục việc này.
  const requestFetch = useRequestFetch()
  const { authenticated } = await requestFetch<{ authenticated: boolean }>('/api/admin/me')
  if (!authenticated) {
    return navigateTo('/admin/login')
  }
})
