import type { H3Event } from 'h3'

interface AdminSessionData {
  isAdmin?: boolean
}

/**
 * Session admin ký bằng cookie httpOnly (h3 useSession) — spec.md mục 15.1.
 * maxAge đóng vai trò "hết hạn sau một khoảng thời gian không hoạt động":
 * mỗi request đã xác thực đều gọi requireAdmin() làm mới cookie (sliding expiry).
 */
export function useAdminSession(event: H3Event) {
  const config = useRuntimeConfig()
  return useSession<AdminSessionData>(event, {
    password: config.adminSessionSecret,
    name: 'admin_session',
    maxAge: 60 * 60 * 2, // 2 giờ không thao tác thì phải đăng nhập lại
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: !import.meta.dev
    }
  })
}

export async function requireAdmin(event: H3Event) {
  const session = await useAdminSession(event)
  if (!session.data.isAdmin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Bạn cần đăng nhập quản trị để thực hiện thao tác này.'
    })
  }
  // Chạm vào session để làm mới thời gian hết hạn (sliding expiry)
  await session.update(session.data)
  return session
}
