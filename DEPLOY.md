# Hướng dẫn Deploy — Album Cưới

**Trạng thái: ĐÃ DEPLOY THÀNH CÔNG.** Website chạy trên gói Hosting cPanel của TinoHost (không phải VPS), tự động build + deploy mỗi khi push lên nhánh `main` qua GitHub Actions.

- Server: TinoHost cPanel hosting, IP `103.130.217.103`, user cPanel `gocnhati1`.
- Domain tạm: `gocnha.tino.page` (cấp kèm hosting — DNS có thể cần thời gian propagate hoặc cấu hình thêm, xem mục "Vấn đề đã biết" bên dưới).
- Repo: https://github.com/XuyenDoan/DamCuoi (nhánh `main`).

## Vì sao KHÔNG dùng kiến trúc VPS + PM2 như dự định ban đầu

`spec.md` mục 16 ban đầu đề xuất Oracle Cloud Always Free (VPS có quyền root). Thực tế triển khai gặp 2 thay đổi lớn:

1. **Không có thẻ Visa** để đăng ký Oracle Cloud → chuyển sang mua **Hosting cPanel** của TinoHost (thanh toán chuyển khoản/MoMo). Đây là gói **Hosting chia sẻ**, không phải VPS — không có quyền root, không dùng PM2/systemd được, phải dùng tính năng **"Setup Node.js App"** của cPanel (chạy qua CloudLinux Node.js Selector + Passenger).
2. **Không build được trực tiếp trên server** — đã xác nhận thật bằng thử nghiệm: engine Rust của `@tailwindcss/oxide` (dùng khi build Tailwind CSS v4) cố tạo thread pool và bị hệ điều hành từ chối `"OS can't spawn worker thread: Resource temporarily unavailable"` ngay cả khi giới hạn xuống 1 lõi CPU (`taskset -c 0`) — gói hosting giới hạn số tiến trình/luồng đồng thời rất thấp (giới hạn LVE của CloudLinux, không thấy được qua `ulimit`). → Giải pháp: **build ở GitHub Actions** (trong container `almalinux:8` để khớp glibc 2.28 với server — CentOS/CloudLinux 8 dùng glibc cũ hơn nhiều so với Ubuntu runner mặc định của GitHub, native binary như `sharp` build sai glibc sẽ không chạy được), rồi chỉ đẩy thư mục `.output` (đã build sẵn) lên server qua SSH.

## Kiến trúc deploy hiện tại

```
git push origin main
   → GitHub Actions (.github/workflows/deploy.yml)
      1. Chạy trong container almalinux:8 (khớp glibc server)
      2. Cài Node.js 20 + clone code
      3. npm ci --include=dev + npm run build
      4. Nén .output bằng tar, truyền qua SSH, giải nén vào server
      5. Gọi cloudlinux-selector restart để Passenger nạp bản mới
```

Trên server: `~/repo` là bản clone Git đầy đủ (để tham khảo/debug), nhưng **chỉ `~/repo/web/.output` được cập nhật tự động** qua CI — đây là phần thực sự chạy. `~/repo/web/.env` (không nằm trong Git) chứa `ADMIN_SESSION_SECRET`, `DATA_DIR=/home/gocnhati1/damcuoi-data/data`, `UPLOADS_DIR=/home/gocnhati1/damcuoi-data/uploads` — dữ liệu thật nằm ngoài `~/repo`, không bao giờ bị ghi đè khi deploy.

## Các lỗi thật đã gặp & cách khắc phục (để tham khảo nếu deploy lại/gặp lỗi tương tự)

1. **`npm config get omit` trả về `dev`** — cấu hình npm mặc định trên môi trường Node.js Selector của TinoHost bỏ qua toàn bộ `devDependencies` (kể cả `npm install --save-dev` đích danh cũng bị bỏ qua âm thầm, không báo lỗi). Khắc phục: luôn thêm cờ `--include=dev` khi cài đặt nếu build ở môi trường tương tự.
2. **`OS can't spawn worker thread`** khi build Tailwind CSS v4 trên server — giới hạn LVE/CloudLinux, không sửa được từ phía user thường. Khắc phục: build ở nơi khác (GitHub Actions), chỉ deploy bản đã build.
3. **glibc không khớp** — CloudLinux 8 dùng glibc 2.28, GitHub Actions `ubuntu-latest` mặc định dùng glibc rất mới (~2.39) → native binary (`sharp`, `@tailwindcss/oxide`) build trên Ubuntu sẽ lỗi khi chạy trên server. Khắc phục: build trong `container: almalinux:8` (glibc khớp).
4. **`RollupError: Could not resolve "../shared/pages.ts"`** — import tương đối (`../../shared/pages`) xuyên ranh giới thư mục `app/`/`server/`/`shared/` chạy được ở dev server nhưng fail khi Nitro build production thật (chưa từng test build production trong suốt quá trình code, chỉ dùng dev server + typecheck). Khắc phục: dùng alias `#shared/...` do Nuxt 4 tự cấu hình cho thư mục `shared/`, không dùng đường dẫn tương đối xuyên thư mục.
5. **`rsync: command not found`** trên server — hosting chia sẻ không có sẵn `rsync` và không có quyền cài. Khắc phục: dùng `tar` nén rồi truyền qua pipe SSH (`tar -czf - ... | ssh ... "tar -xzf - ..."`) — `tar`/`gzip` luôn có sẵn trên mọi hệ Linux.
6. **`Identity file ~/.ssh/... not accessible`** trong GitHub Actions — dấu `~` bên trong 1 biến shell (`SSH_OPTS="-i ~/.ssh/..."`) KHÔNG được bash tự thay bằng home directory (tilde expansion chỉ áp dụng khi gõ trực tiếp ở đầu 1 từ, không áp dụng cho giá trị bên trong biến). Khắc phục: dùng `$HOME` thay vì `~` bên trong mọi biến shell.
7. **`Host key verification failed`** — `ssh-keyscan` chạy trong container CI không đáng tin cậy. Khắc phục: dùng `-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null` cho pipeline CI tự động (chấp nhận được vì IP server cố định, khai báo qua secret).

## Cách deploy khi có code mới

Chỉ cần `git push` lên `main` — GitHub Actions tự lo phần còn lại. Theo dõi tại: https://github.com/XuyenDoan/DamCuoi/actions

Muốn chạy tay 1 lần (không cần push code mới): vào tab Actions → workflow "Deploy to production" → **Run workflow**.

## GitHub Secrets cần thiết (đã thiết lập)

| Secret | Giá trị |
|---|---|
| `DEPLOY_HOST` | `103.130.217.103` |
| `DEPLOY_USER` | `gocnhati1` |
| `DEPLOY_SSH_KEY` | Private key riêng cho deploy (đã tạo, đã authorize trong cPanel → SSH Access → Manage SSH Keys) |

## Vấn đề đã biết / việc cần làm tiếp

- **Domain `gocnha.tino.page` chưa phân giải được (DNS)** — server chạy bình thường (đã xác nhận qua IP trực tiếp), chỉ là tên miền tạm chưa trỏ đúng. Có thể cần đợi thêm hoặc liên hệ TinoHost hỗ trợ. Nếu có domain riêng, làm theo hướng dẫn trỏ DNS trong phần "Gắn tên miền" bên dưới.
- **Chưa có HTTPS riêng cho domain thật** (mới chỉ test qua IP) — cPanel có sẵn AutoSSL, thường tự cấp khi domain đã phân giải đúng, kiểm tra ở cPanel → SSL/TLS Status.
- **Chưa thiết lập backup định kỳ** — dữ liệu (`~/damcuoi-data`) nằm ngoài Git, nên sao lưu định kỳ ra ngoài server (VD: JetBackup có sẵn trong cPanel, hoặc cron + rclone đẩy lên Google Drive).
- **Chưa đặt mật khẩu admin lần đầu** — vào `https://gocnha.tino.page/admin` (hoặc qua IP tạm) để thiết lập.
