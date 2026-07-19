// Cấu hình PM2 để giữ app Nuxt chạy nền trên server, tự khởi động lại nếu
// crash (spec.md mục 16.3). Chạy: `pm2 start ecosystem.config.cjs`.
// Biến môi trường (DATA_DIR, UPLOADS_DIR, ADMIN_SESSION_SECRET, PORT) đọc từ
// file `.env` đặt cùng thư mục này — Nitro tự nạp `.env` khi khởi động bản
// build production, không cần khai báo lại `env` ở đây.
module.exports = {
  apps: [
    {
      name: 'damcuoi',
      script: '.output/server/index.mjs',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M'
    }
  ]
}
