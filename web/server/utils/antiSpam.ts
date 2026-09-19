import type { H3Event } from 'h3'
import { createHash } from 'node:crypto'

/**
 * Chống spam cho 2 form công khai không cần đăng nhập (gửi lời chúc
 * `POST /api/wishes`, gửi ảnh `POST /api/upload`). Không dùng dịch vụ bên thứ
 * 3 (captcha) — đúng quyết định đã chốt ở spec.md mục 15.3 ("captcha chưa
 * bật") và tinh thần "không thêm điều phối viên ngoài" — mà xếp nhiều lớp nhẹ:
 *
 *  1. Honeypot: ô ẩn `website` người thật không thấy/không điền, bot điền hết
 *     mọi ô -> giả vờ thành công (không báo lỗi để bot khỏi đổi cách né).
 *  2. Thời gian điền form: người thật cần vài giây, bot gửi gần như tức thì.
 *  3. Giới hạn tần suất theo IP (cửa sổ trượt, nhiều mốc phút/giờ/ngày).
 *  4. Giới hạn TOÀN CỤC (mọi IP cộng lại) — lưới an toàn khi không xác định
 *     được IP thật hoặc kẻ tấn công đổi IP liên tục.
 *  5. Chặn trùng nội dung + quá nhiều link (lời chúc).
 *  6. Trần hàng chờ duyệt (xem `pendingCap` ở nơi gọi) — không để hộp duyệt/ổ
 *     đĩa bị nhồi vô hạn.
 *
 * Trạng thái giữ TRONG BỘ NHỚ tiến trình (không ghi đĩa): mất khi server
 * restart — chấp nhận được vì mục tiêu chỉ là chặn tấn công dồn dập, không
 * phải sổ sách. Không cần thêm hạ tầng (Redis...) cho hosting chia sẻ.
 */

export interface RateRule {
  limit: number
  windowMs: number
}

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

/** Tối thiểu (ms) từ lúc mở form tới lúc gửi — dưới mức này coi là bot. */
export const MIN_FILL_MS = 2_500

export const WISH_LIMITS = {
  perIp: [
    { limit: 3, windowMs: MIN },
    { limit: 8, windowMs: HOUR },
    { limit: 20, windowMs: DAY }
  ] satisfies RateRule[],
  global: [{ limit: 60, windowMs: HOUR }] satisfies RateRule[],
  /** Trần số lời chúc đang chờ duyệt — vượt thì tạm ngưng nhận thêm. */
  pendingCap: 200
}

export const UPLOAD_LIMITS = {
  /** Số LẦN gửi (request) theo IP */
  perIpRequests: [
    { limit: 4, windowMs: 10 * MIN },
    { limit: 20, windowMs: DAY }
  ] satisfies RateRule[],
  /** Số FILE ảnh theo IP */
  perIpFiles: [
    { limit: 40, windowMs: HOUR },
    { limit: 120, windowMs: DAY }
  ] satisfies RateRule[],
  globalFiles: [{ limit: 300, windowMs: HOUR }] satisfies RateRule[],
  pendingCap: 500
}

const hits = new Map<string, number[]>()
let callsSincePrune = 0

function prune(now: number) {
  callsSincePrune = 0
  for (const [key, list] of hits) {
    const alive = list.filter((t) => now - t < DAY)
    if (alive.length === 0) hits.delete(key)
    else hits.set(key, alive)
  }
}

function isPrivateOrLoopback(ip: string): boolean {
  const v = ip.replace(/^::ffff:/, '')
  return (
    v === '::1' ||
    v.startsWith('127.') ||
    v.startsWith('10.') ||
    v.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(v) ||
    v.startsWith('fc') ||
    v.startsWith('fd') ||
    v.startsWith('fe80')
  )
}

/**
 * IP khách thật, hoặc `null` nếu không xác định được (khi đó CHỈ áp giới hạn
 * toàn cục — tuyệt đối không gộp mọi khách vào 1 IP giả như "127.0.0.1", vì
 * hạn mức theo IP nhỏ sẽ khoá cả đám khách cùng lúc).
 *  - Kết nối trực tiếp từ IP công cộng -> tin socket, BỎ QUA header (chống giả
 *    mạo `X-Forwarded-For`).
 *  - Socket là loopback/mạng nội bộ (đứng sau proxy của hosting) -> lấy
 *    `X-Real-IP` hoặc phần tử CUỐI của `X-Forwarded-For` (do proxy tin cậy nối
 *    thêm vào).
 */
export function getClientIp(event: H3Event): string | null {
  const socketIp = event.node.req.socket?.remoteAddress ?? ''
  if (socketIp && !isPrivateOrLoopback(socketIp)) return socketIp.replace(/^::ffff:/, '')

  const real = getRequestHeader(event, 'x-real-ip')?.trim()
  if (real && !isPrivateOrLoopback(real)) return real
  const xff = getRequestHeader(event, 'x-forwarded-for')
  if (xff) {
    const last = xff.split(',').map((s) => s.trim()).filter(Boolean).pop()
    if (last && !isPrivateOrLoopback(last)) return last
  }
  return null
}

function countInWindow(key: string, windowMs: number, now: number): number {
  const list = hits.get(key)
  if (!list) return 0
  let n = 0
  for (const t of list) if (now - t < windowMs) n++
  return n
}

function tooMany(message: string, retryAfterSec: number): never {
  throw createError({
    statusCode: 429,
    statusMessage: message,
    data: { retryAfter: retryAfterSec }
  })
}

function record(key: string, weight: number, now: number) {
  const list = hits.get(key) ?? []
  for (let i = 0; i < weight; i++) list.push(now)
  hits.set(key, list)
}

/**
 * Kiểm tra + ghi nhận 1 lượt dùng (`weight` lượt — VD số file ảnh). Ném 429
 * (kèm `Retry-After`) nếu vượt BẤT KỲ mốc nào; chỉ ghi nhận khi TẤT CẢ mốc
 * đều còn chỗ, để yêu cầu bị từ chối không làm tăng bộ đếm.
 */
export function takeQuota(
  event: H3Event,
  scope: string,
  perIp: RateRule[],
  globalRules: RateRule[],
  weight: number,
  message: string
) {
  const now = Date.now()
  if (++callsSincePrune > 500) prune(now)

  const ip = getClientIp(event)
  const targets: Array<{ key: string; rules: RateRule[] }> = [{ key: `${scope}|*`, rules: globalRules }]
  if (ip) targets.push({ key: `${scope}|${ip}`, rules: perIp })

  for (const { key, rules } of targets) {
    for (const rule of rules) {
      const used = countInWindow(key, rule.windowMs, now)
      if (used + weight > rule.limit) {
        const oldest = (hits.get(key) ?? []).find((t) => now - t < rule.windowMs) ?? now
        const retry = Math.max(1, Math.ceil((oldest + rule.windowMs - now) / 1000))
        setResponseHeader(event, 'Retry-After', retry)
        tooMany(message, retry)
      }
    }
  }
  for (const { key } of targets) record(key, weight, now)
}

/**
 * Bẫy bot dùng chung: trả `true` nếu yêu cầu NÊN bị lờ đi trong im lặng (bot).
 * `honeypot` phải rỗng; `fillMsRaw` là số ms TRÌNH DUYỆT tự đo từ lúc mở form
 * tới lúc bấm gửi (đo bằng đồng hồ tương đối của trình duyệt, KHÔNG so với
 * giờ máy chủ — tránh oan khi đồng hồ máy khách lệch giờ) — phải có mặt và
 * >= MIN_FILL_MS.
 */
export function looksLikeBot(honeypot: string, fillMsRaw: string): boolean {
  if (honeypot.trim().length > 0) return true
  const fillMs = Number(fillMsRaw)
  return !Number.isFinite(fillMs) || fillMs < MIN_FILL_MS
}

const recentMessages = new Map<string, number>()

/**
 * Cùng 1 IP gửi lại đúng nội dung trong 1 giờ -> trùng. Không xác định được IP
 * thì BỎ QUA (không thể phân biệt 2 khách khác nhau cùng viết "Chúc mừng hạnh
 * phúc!" — tránh chặn oan).
 */
export function isDuplicateMessage(event: H3Event, text: string): boolean {
  const ip = getClientIp(event)
  if (!ip) return false
  const now = Date.now()
  for (const [k, t] of recentMessages) if (now - t > HOUR) recentMessages.delete(k)
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim()
  const key = createHash('sha1').update(`${ip}|${normalized}`).digest('hex')
  if (recentMessages.has(key)) return true
  recentMessages.set(key, now)
  return false
}

/** Đếm số đường link trong 1 đoạn chữ (http(s)://, www., hoặc tên miền trần dạng abc.com/xyz). */
export function countLinks(text: string): number {
  const matches = text.match(/(https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(com|net|org|info|xyz|top|vn|io|ru|cn|tk|ml|site|online|shop|biz)\b/gi)
  return matches ? matches.length : 0
}
