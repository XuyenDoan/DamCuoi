import { requireAdmin } from '../utils/adminSession'
import { settingsStore } from '../utils/store'
import type { Settings } from '../utils/types'
import { MANAGED_PAGES, isHideablePageKey } from '#shared/pages'

/**
 * Google Maps mặc định cho sao chép cả đoạn HTML <iframe>...</iframe>, không
 * chỉ riêng link src — nếu admin dán nguyên cụm đó, tự trích link src ra để
 * dùng, tránh lỗi bản đồ không hiển thị do gán nguyên chuỗi HTML vào src.
 */
function extractMapEmbedSrc(value: string): string {
  const trimmed = value.trim()
  const match = trimmed.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i)
  return match?.[1] ?? trimmed
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Partial<Settings>>(event)

  if (!body.coupleNames?.bride?.trim() || !body.coupleNames?.groom?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Vui lòng nhập đầy đủ tên cô dâu và chú rể'
    })
  }

  const sanitized: Settings = {
    coupleNames: {
      bride: body.coupleNames.bride.trim(),
      groom: body.coupleNames.groom.trim()
    },
    weddingDate: body.weddingDate?.trim() ?? '',
    heroTagline: body.heroTagline?.trim() ?? '',
    welcomeMessage: body.welcomeMessage?.trim() ?? '',
    loveStory: (body.loveStory ?? []).map((m, i) => ({
      id: m.id || `story_${Date.now()}_${i}`,
      year: m.year?.trim() ?? '',
      title: m.title?.trim() ?? '',
      content: m.content?.trim() ?? '',
      photos: m.photos ?? []
    })),
    eventInfo: {
      ceremonyTime: body.eventInfo?.ceremonyTime ?? '',
      venueName: body.eventInfo?.venueName?.trim() ?? '',
      venueAddress: body.eventInfo?.venueAddress?.trim() ?? '',
      mapEmbedUrl: extractMapEmbedSrc(body.eventInfo?.mapEmbedUrl ?? '')
    },
    footerText: body.footerText?.trim() ?? '',
    // pageBackgrounds thực chất được quản lý qua /api/admin/page-background/[pageKey]
    // (upload/xoá ảnh riêng), ở đây chỉ giữ lại nguyên trạng theo đúng danh sách trang hợp lệ
    // để nút "Lưu thay đổi" chung không vô tình xoá mất khi gửi body cũ/thiếu key.
    pageBackgrounds: Object.fromEntries(
      MANAGED_PAGES.map((p) => [p.key, body.pageBackgrounds?.[p.key] ?? null])
    ),
    // Chỉ giữ lại key hợp lệ + có thể ẩn (loại 'home' phòng thủ — trang chủ luôn bắt buộc hiện)
    hiddenPages: (body.hiddenPages ?? []).filter(isHideablePageKey)
  }

  await settingsStore.write(sanitized)
  return sanitized
})
