import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()]
  },

  app: {
    // ĐÃ THỬ VÀ BỎ (bug thật đã gặp — mục nâng cấp "hiệu ứng chuyển trang"):
    // bật `pageTransition` (cả 2 kiểu có/không `mode: 'out-in'`) làm điều
    // hướng SPA giữa các trang bị TREO VĨNH VIỄN ở nội dung trang CŨ — xác
    // nhận bằng test tay nhiều lần, kể cả ở tab trình duyệt hoàn toàn mới
    // (loại trừ nguyên nhân cache/HMR): URL và tiêu đề `<title>` đổi đúng
    // sang trang mới, nhưng DOM bên trong `<main>` không bao giờ đổi theo.
    // Chưa xác định được nguyên nhân gốc trong thời gian cho phép (nghi vấn
    // liên quan tới cách `useAsyncData`/top-level await trong các trang kết
    // hợp với Suspense nội bộ của `<NuxtPage>`). Vì đây là bug NGHIÊM TRỌNG
    // hơn hẳn việc "thiếu hiệu ứng" (trang bị đơ hẳn không dùng được), đã
    // gỡ bỏ hoàn toàn để không làm hỏng trải nghiệm thật của khách truy cập.
    head: {
      htmlAttrs: { lang: 'vi' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,500;1,600&display=swap&subset=vietnamese'
        }
      ]
    }
  },

  runtimeConfig: {
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || 'dev-secret-change-in-production',
    dataDir: process.env.DATA_DIR || '',
    uploadsDir: process.env.UPLOADS_DIR || ''
  }
})
