import { requireAdmin } from '../utils/adminSession'
import { settingsStore } from '../utils/store'
import type { EventInfoBlock, Settings } from '../utils/types'
import { MANAGED_PAGES, isHideablePageKey } from '#shared/pages'
import { SITE_IMAGES } from '#shared/siteImages'

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

function sanitizeEventInfoBlock(v: Partial<EventInfoBlock> | undefined): EventInfoBlock {
  return {
    ceremonyTime: v?.ceremonyTime ?? '',
    venueName: v?.venueName?.trim() ?? '',
    venueAddress: v?.venueAddress?.trim() ?? '',
    mapEmbedUrl: extractMapEmbedSrc(v?.mapEmbedUrl ?? '')
  }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<Partial<Settings>>(event)
  // websiteTheme đổi qua PUT /api/admin/theme riêng (spec.md mục 36) — đọc
  // lại giá trị đang lưu, KHÔNG lấy theo body ở đây, để form "Nội dung
  // trang" không bao giờ vô tình ghi đè/reset theme khi lưu nội dung khác.
  const current = await settingsStore.read()

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
    heroTagline: body.heroTagline?.trim() ?? '',
    welcomeMessage: body.welcomeMessage?.trim() ?? '',
    // Giống hệt cơ chế loveStory[].photos: /api/admin/hero-image chỉ lưu file
    // vật lý, mảng thứ tự thật sự chỉ ghi vào settings.json ở đây.
    heroImages: Array.isArray(body.heroImages)
      ? body.heroImages.filter((f): f is string => typeof f === 'string' && f.length > 0)
      : [],
    loveStory: (body.loveStory ?? []).map((m, i) => ({
      id: m.id || `story_${Date.now()}_${i}`,
      year: m.year?.trim() ?? '',
      title: m.title?.trim() ?? '',
      content: m.content?.trim() ?? '',
      photos: m.photos ?? []
    })),
    eventInfo: {
      groom: sanitizeEventInfoBlock(body.eventInfo?.groom),
      bride: sanitizeEventInfoBlock(body.eventInfo?.bride)
    },
    footerText: body.footerText?.trim() ?? '',
    // pageBackgrounds thực chất được quản lý qua /api/admin/page-background/[pageKey]
    // (upload/xoá ảnh riêng), ở đây chỉ giữ lại nguyên trạng theo đúng danh sách trang hợp lệ
    // để nút "Lưu thay đổi" chung không vô tình xoá mất khi gửi body cũ/thiếu key.
    pageBackgrounds: Object.fromEntries(
      MANAGED_PAGES.map((p) => [p.key, body.pageBackgrounds?.[p.key] ?? null])
    ),
    // Chỉ giữ lại key hợp lệ + có thể ẩn (loại 'home' phòng thủ — trang chủ luôn bắt buộc hiện)
    hiddenPages: (body.hiddenPages ?? []).filter(isHideablePageKey),
    websiteTheme: current.websiteTheme,
    // backgroundMusic thực chất được quản lý qua /api/admin/background-music
    // (upload/xoá riêng, giống hệt siteImages/pageBackgrounds) — giữ nguyên
    // trạng thái hiện có, không lấy theo body.
    backgroundMusic: current.backgroundMusic,
    // siteImages thực chất được quản lý qua /api/admin/site-image/[key]
    // (upload/xoá riêng), giống hệt cách pageBackgrounds đã làm ở trên — ở
    // đây chỉ giữ nguyên trạng theo đúng danh sách key hợp lệ.
    siteImages: Object.fromEntries(
      SITE_IMAGES.map((s) => [s.key, body.siteImages?.[s.key] ?? null])
    ) as Settings['siteImages']
  }

  await settingsStore.write(sanitized)
  return sanitized
})
