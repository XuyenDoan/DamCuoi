#!/usr/bin/env node
/**
 * Tạo nhanh dữ liệu mẫu cho môi trường dev (`/data`, `/uploads` — ngang cấp
 * `web/`, theo đúng cấu trúc mục 14.1 spec.md) để không phải dựng tay dữ
 * liệu test (đăng nhập admin, tên cô dâu/chú rể, giờ lễ 2 nhà...) mỗi lần
 * cần kiểm tra lại giao diện. CHỈ dùng cho máy dev cá nhân — `/data` và
 * `/uploads` đã nằm trong `.gitignore`, không commit lên git.
 *
 * Cách chạy (từ thư mục `web/`): `npm run seed:dev`
 * Thêm `--force` để ghi đè dữ liệu đã có sẵn (mặc định: bỏ qua file nào đã
 * tồn tại, không tự ý ghi đè dữ liệu thật bạn có thể đang thử nghiệm dở).
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = resolve(__dirname, '..', '..', 'data')
const uploadsDir = resolve(__dirname, '..', '..', 'uploads')
const force = process.argv.includes('--force')

const DEV_PASSWORD = 'dev12345'

const settings = {
  coupleNames: { groom: 'Minh Khôi', bride: 'Thanh Trúc' },
  heroTagline: 'Chúng tôi sắp về chung một nhà',
  welcomeMessage:
    'Xin chân thành cảm ơn vì đã dành thời gian ghé thăm trang lưu giữ những khoảnh khắc đẹp nhất trong ngày trọng đại của chúng tôi.',
  loveStory: [
    {
      id: 'm1',
      year: '2020',
      title: 'Lần đầu gặp gỡ',
      content: 'Một buổi chiều mưa tình cờ gặp nhau ở quán cà phê nhỏ.',
      photos: []
    },
    {
      id: 'm2',
      year: '2022',
      title: 'Ngày ngỏ lời',
      content: 'Anh đã ngỏ lời trong một chuyến đi biển đáng nhớ.',
      photos: []
    },
    {
      id: 'm3',
      year: '2026',
      title: 'Về chung một nhà',
      content: 'Và hôm nay, chúng tôi chính thức nên duyên vợ chồng.',
      photos: []
    }
  ],
  eventInfo: {
    groom: {
      ceremonyTime: '2026-12-20T09:00:00+07:00',
      venueName: 'Tư gia nhà trai',
      venueAddress: '12 Đường Hoa Sen, Quận 1, TP.HCM',
      mapEmbedUrl: ''
    },
    bride: {
      ceremonyTime: '2026-12-20T14:00:00+07:00',
      venueName: 'Tư gia nhà gái',
      venueAddress: '34 Đường Hoa Mai, Quận 3, TP.HCM',
      mapEmbedUrl: ''
    }
  },
  footerText: 'Cảm ơn đã đồng hành cùng chúng tôi trong ngày trọng đại',
  pageBackgrounds: {},
  hiddenPages: []
}

const albums = {
  albums: [
    { id: 'album_vu-quy', name: 'Vu Quy', order: 0 },
    { id: 'album_le-thanh-hon', name: 'Lễ Thành Hôn', order: 1 },
    { id: 'album_tiec-cuoi', name: 'Tiệc Cưới', order: 2 }
  ]
}

function writeIfNeeded(path, content) {
  if (existsSync(path) && !force) {
    console.log(`  bỏ qua (đã tồn tại): ${path}`)
    return
  }
  writeFileSync(path, content)
  console.log(`  đã ghi: ${path}`)
}

mkdirSync(dataDir, { recursive: true })
mkdirSync(join(uploadsDir, 'originals'), { recursive: true })
mkdirSync(join(uploadsDir, 'thumbnails'), { recursive: true })
mkdirSync(join(uploadsDir, 'pending'), { recursive: true })
mkdirSync(join(uploadsDir, 'backgrounds'), { recursive: true })
mkdirSync(join(uploadsDir, 'love-story'), { recursive: true })

console.log('Tạo dữ liệu mẫu dev tại:', dataDir)
writeIfNeeded(join(dataDir, 'settings.json'), JSON.stringify(settings, null, 2))
writeIfNeeded(join(dataDir, 'albums.json'), JSON.stringify(albums, null, 2))
writeIfNeeded(
  join(dataDir, 'admin.json'),
  JSON.stringify(
    { passwordHash: bcrypt.hashSync(DEV_PASSWORD, 10), failedAttempts: 0, lockedUntil: null },
    null,
    2
  )
)

console.log('')
console.log('Xong! Chạy `npm run dev` rồi vào /admin đăng nhập bằng mật khẩu:')
console.log(`  ${DEV_PASSWORD}`)
console.log('(Chỉ dùng cho dev cá nhân — KHÔNG dùng mật khẩu này khi deploy thật.)')
