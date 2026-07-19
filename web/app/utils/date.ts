/**
 * Tiện ích ngày tháng cho website Việt Nam.
 * Luôn tính toán dựa trên lịch UTC/Asia-Ho-Chi-Minh cố định (KHÔNG dùng
 * timezone mặc định của máy) để tránh hydration mismatch giữa SSR (server)
 * và client — server và trình duyệt có thể chạy ở 2 timezone khác nhau.
 */

const VN_TIME_ZONE = 'Asia/Ho_Chi_Minh'

/** "YYYY-MM-DD" -> [y, m, d] (số nguyên, mặc định 0 nếu chuỗi thiếu phần nào) */
function parseYmd(ymd: string): [number, number, number] {
  const [y, m, d] = ymd.split('-').map(Number)
  return [y ?? 0, m ?? 1, d ?? 1]
}

export function todayYmdInVietnam(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: VN_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())
}

/** Số ngày từ `fromYmd` đến `toYmd` (dương nếu toYmd ở tương lai) */
export function daysBetweenYmd(fromYmd: string, toYmd: string): number {
  const [fy, fm, fd] = parseYmd(fromYmd)
  const [ty, tm, td] = parseYmd(toYmd)
  const fromUtc = Date.UTC(fy, fm - 1, fd)
  const toUtc = Date.UTC(ty, tm - 1, td)
  return Math.round((toUtc - fromUtc) / 86400000)
}

/** "2026-12-20" -> "20 tháng 12, 2026" — cố định format theo UTC, không lệch theo máy đọc */
export function formatVietnameseDate(ymd: string): string {
  if (!ymd) return ''
  const [y, m, d] = parseYmd(ymd)
  const utcDate = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(utcDate)
}

/**
 * "2026-12-20T09:00:00+07:00" -> "9:00, 20 tháng 12, 2026".
 * Chuỗi ISO đã có offset múi giờ riêng nên thời điểm luôn đúng; chỉ pin thêm
 * timeZone khi format để tránh hydration mismatch giữa server/client.
 */
export function formatVietnameseDateTime(iso: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  const timeZone = 'Asia/Ho_Chi_Minh'
  const datePart = new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone
  }).format(date)
  const timePart = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone
  }).format(date)
  return `${timePart}, ${datePart}`
}

/** ISO -> "20/7/2026" ngắn gọn (dùng cho card/mốc thời gian) — pin múi giờ VN, tránh hydration mismatch */
export function formatShortDate(iso: string): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(iso))
}

/** ISO có offset -> "YYYY-MM-DDTHH:mm" theo giờ Việt Nam, dùng cho input type="datetime-local" */
export function isoToVietnamLocalInput(iso: string): string {
  if (!iso) return ''
  const timeZone = 'Asia/Ho_Chi_Minh'
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

/**
 * "YYYY-MM-DDTHH:mm" (giá trị input datetime-local) -> ISO với offset +07:00 cố định.
 * Luôn diễn giải giá trị nhập là giờ Việt Nam, không phụ thuộc múi giờ trình duyệt admin.
 */
export function vietnamLocalInputToIso(localValue: string): string {
  if (!localValue) return ''
  return `${localValue}:00+07:00`
}
