# Hướng dẫn Deploy — Album Cưới

Mục tiêu: website chạy trên 1 VM Oracle Cloud "Always Free", tự động cập nhật mỗi khi bạn `git push` lên nhánh `main`. Kiến trúc & lý do chọn Oracle Cloud xem `spec.md` mục 16.

Làm theo đúng thứ tự các bước dưới đây — mỗi bước ghi rõ **làm ở đâu** (máy tính của bạn / trình duyệt Oracle Cloud / SSH vào server).

---

## Bước 1 — Đẩy code lên GitHub *(làm trên máy tính của bạn)*

Repo Git đã được khởi tạo sẵn tại `D:\Dev\DamCuoi` (thư mục gốc, chứa cả `spec.md` lẫn `web/`). Thư mục `data/` và `uploads/` (ảnh + dữ liệu thật) đã bị loại khỏi Git — **không bao giờ** được đẩy 2 thư mục này lên GitHub, kể cả repo private.

1. Vào GitHub, lấy URL repo trống bạn đã tạo (dạng `https://github.com/ten-ban/damcuoi.git`).
2. Cho tôi biết URL đó, tôi sẽ giúp bạn gắn remote + commit + push (bước này cần bạn xác nhận vì sẽ đẩy code lên tài khoản của bạn).

Sau bước này, mỗi khi muốn cập nhật code, bạn chỉ cần yêu cầu tôi (hoặc tự chạy) `git add`, `git commit`, `git push` — GitHub Actions ở Bước 5 sẽ tự động deploy phần còn lại.

---

## Bước 2 — Tạo tài khoản & VM trên Oracle Cloud *(làm trên trình duyệt, oracle.com)*

1. Vào https://www.oracle.com/cloud/free/ → **Start for free**. Đăng ký bằng email thật, cần thẻ tín dụng/ghi nợ quốc tế để xác minh (Oracle không trừ tiền nếu ở trong hạn mức Always Free — spec.md mục 16.2).
2. Sau khi vào được **OCI Console**, vào menu ☰ → **Compute** → **Instances** → **Create Instance**.
3. Điền:
   - **Name**: `damcuoi-server` (tuỳ ý).
   - **Image**: chọn **Canonical Ubuntu 22.04**.
   - **Shape**: bấm "Change shape" → chọn **Ampere (ARM) → VM.Standard.A1.Flex** → để 2 OCPU / 12GB RAM (vẫn miễn phí, dư dùng; tối đa Always Free cho phép 4 OCPU/24GB nếu muốn để hết). Nếu khu vực bạn chọn báo hết chỗ ("Out of host capacity"), thử lại sau vài phút hoặc đổi sang shape AMD `VM.Standard.E2.1.Micro` (yếu hơn nhưng luôn còn chỗ).
   - **Add SSH keys**: chọn "Generate a key pair for me" rồi **bấm tải cả 2 file khoá về** (`ssh-key-....key` là khoá riêng tư — giữ kỹ, không chia sẻ, không commit lên Git).
4. Bấm **Create**. Đợi vài phút tới khi trạng thái là **Running**.
5. Ghi lại **Public IP Address** hiển thị trên trang instance — đây là địa chỉ bạn sẽ dùng để SSH và để truy cập website tạm thời (chưa có domain).

### Mở cổng mạng (bước rất hay bị quên — Oracle mặc định chặn hết trừ cổng 22)

1. Trên trang Instance vừa tạo, bấm vào tên **Subnet** → bấm vào **Default Security List**.
2. Bấm **Add Ingress Rules**, thêm 1 rule:
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: TCP
   - Destination Port Range: `3000`
3. Lưu lại.

---

## Bước 3 — Cài đặt server lần đầu *(SSH vào VM)*

Mở terminal trên máy bạn (PowerShell được), SSH vào VM bằng khoá đã tải ở Bước 2:

```bash
ssh -i "duong-dan-toi/ssh-key-xxxx.key" ubuntu@<PUBLIC_IP_CUA_BAN>
```

Từ đây, mọi lệnh chạy **trên server** (sau khi SSH vào):

```bash
# Cập nhật hệ thống + cài Node.js 22 (LTS) và git
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git
node -v   # kiểm tra đã cài xong

# Cài PM2 (giữ app chạy nền, tự khởi động lại nếu crash/reboot server)
sudo npm install -g pm2

# Tạo thư mục chứa dữ liệu thật, NẰM NGOÀI thư mục code (đúng kiến trúc spec.md mục 14.1)
mkdir -p ~/damcuoi-data/data ~/damcuoi-data/uploads

# Clone code từ GitHub (thay URL bằng repo của bạn)
git clone https://github.com/ten-ban/damcuoi.git ~/damcuoi
cd ~/damcuoi/web

# Cài dependencies + build production
npm ci
npm run build

# Tạo file .env cho production
cp .env.example .env
nano .env
```

Trong `nano`, điền:
```
ADMIN_SESSION_SECRET=<chuỗi-ngẫu-nhiên-dài-tự-nghĩ-ra>
DATA_DIR=/home/ubuntu/damcuoi-data/data
UPLOADS_DIR=/home/ubuntu/damcuoi-data/uploads
PORT=3000
```
(Ctrl+O rồi Enter để lưu, Ctrl+X để thoát nano.)

**Quan trọng:** vì đây là lần chạy đầu, `data/settings.json` chưa tồn tại — hệ thống sẽ tự tạo giá trị mặc định (mật khẩu admin mặc định trống, xem `spec.md` mục 14.4/15.1) — vào ngay `/admin` để đặt mật khẩu admin đầu tiên sau khi chạy xong.

Chạy app bằng PM2:
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # copy lệnh nó in ra và chạy lại (để PM2 tự khởi động cùng server khi reboot)
```

Kiểm tra: mở trình duyệt vào `http://<PUBLIC_IP_CUA_BAN>:3000` — nếu thấy trang chủ Album Cưới là đã chạy thành công.

---

## Bước 4 — Tự động deploy khi push lên `main` *(GitHub + SSH)*

### 4.1 Tạo SSH key riêng cho GitHub Actions dùng để deploy

Trên server (đang SSH):
```bash
ssh-keygen -t ed25519 -f ~/.ssh/github-deploy -N ""
cat ~/.ssh/github-deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github-deploy        # copy toàn bộ nội dung in ra (bao gồm dòng BEGIN/END)
```

### 4.2 Thêm Secrets trên GitHub

Vào repo trên GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**, tạo 3 secret:

| Tên secret | Giá trị |
|---|---|
| `DEPLOY_HOST` | Public IP của VM |
| `DEPLOY_USER` | `ubuntu` |
| `DEPLOY_SSH_KEY` | Toàn bộ nội dung file `~/.ssh/github-deploy` (khoá riêng tư vừa tạo ở 4.1) |

File workflow `.github/workflows/deploy.yml` đã có sẵn trong repo (tự SSH vào server, `git pull` + `npm ci` + `npm run build` + `pm2 restart damcuoi` mỗi khi có push lên `main`) — không cần tạo thêm gì.

Từ giờ, mỗi lần bạn (hoặc tôi thay bạn) `git push` lên `main`, vào tab **Actions** trên GitHub sẽ thấy job "Deploy to production" chạy tự động và cập nhật server sau khoảng 1-2 phút.

---

## Bước 5 — Gắn tên miền + HTTPS *(làm sau, khi nào bạn mua domain)*

Hiện tại bạn dùng IP tạm nên bỏ qua bước này. Khi có domain, quay lại làm:
1. Trỏ bản ghi DNS loại `A` của domain về Public IP của VM.
2. Trên server: `sudo apt install -y caddy` (xem hướng dẫn cài Caddy chính thức theo Ubuntu tại caddyserver.com), rồi cấu hình `/etc/caddy/Caddyfile`:
   ```
   ten-mien-cua-ban.com {
       reverse_proxy localhost:3000
   }
   ```
   `sudo systemctl restart caddy` — Caddy tự lấy chứng chỉ HTTPS miễn phí (Let's Encrypt).
3. Mở thêm cổng 80 và 443 trong Security List (giống Bước 2), có thể đóng cổng 3000 lại sau khi Caddy chạy ổn (chỉ cho truy cập qua 80/443).

---

## Bước 6 — Backup định kỳ *(khuyến nghị mạnh, làm sau khi site đã chạy ổn)*

Vì Always Free có rủi ro bị Oracle thu hồi tài khoản (spec.md mục 16.2), nên có bản sao lưu **nằm ngoài VM**. Gợi ý đơn giản nhất: cron job nén `~/damcuoi-data` mỗi ngày rồi đẩy lên Google Drive cá nhân qua `rclone`. Có thể nhờ tôi thiết lập chi tiết khi bạn sẵn sàng — không bắt buộc phải làm ngay.

---

## Tóm tắt việc cần làm NGAY để bắt đầu

1. Cho tôi URL repo GitHub trống của bạn → tôi push code lên (Bước 1).
2. Bạn tự đăng ký Oracle Cloud + tạo VM theo Bước 2 (tôi không thể làm thay vì cần tài khoản/thẻ của bạn).
3. Gửi tôi Public IP của VM — tôi hướng dẫn tiếp/giúp bạn chạy các lệnh ở Bước 3 nếu cần.
4. Sau khi server chạy được, làm Bước 4 để bật tự động deploy.
