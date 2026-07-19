# Hướng dẫn Deploy — Album Cưới

Mục tiêu: website chạy trên 1 VPS Linux, tự động cập nhật mỗi khi bạn `git push` lên nhánh `main`.

**Chọn nhà cung cấp VPS:** ban đầu `spec.md` mục 16 đề xuất Oracle Cloud "Always Free" (miễn phí vĩnh viễn) — nhưng gói này bắt buộc xác minh bằng thẻ Visa/Mastercard quốc tế. Vì không có thẻ phù hợp, đã đổi sang **VPS Việt Nam trả phí, thanh toán chuyển khoản/MoMo** (không cần thẻ quốc tế) — vài lựa chọn giá tốt: **TinoHost, Vietnix, AZDIGI, iNET** (~80.000–200.000đ/tháng tuỳ nơi, giá thay đổi theo thời điểm nên kiểm tra trực tiếp trên website từng nhà cung cấp trước khi mua). Cấu hình nên chọn: **1 vCPU / 2GB RAM / 20GB SSD / Ubuntu 22.04** — dư sức cho website này (2GB RAM để `sharp` xử lý ảnh không bị thiếu bộ nhớ).

Toàn bộ phần cài đặt từ Bước 3 trở đi **giống hệt nhau bất kể mua VPS ở đâu** (đều là Linux VPS có SSH root) — chỉ Bước 2 (nơi mua + cách mở cổng mạng) là khác giữa các nhà cung cấp.

Làm theo đúng thứ tự các bước dưới đây — mỗi bước ghi rõ **làm ở đâu** (máy tính của bạn / trang quản trị VPS / SSH vào server).

---

## Bước 1 — Đẩy code lên GitHub *(làm trên máy tính của bạn)*

Repo Git đã được khởi tạo sẵn tại `D:\Dev\DamCuoi` (thư mục gốc, chứa cả `spec.md` lẫn `web/`). Thư mục `data/` và `uploads/` (ảnh + dữ liệu thật) đã bị loại khỏi Git — **không bao giờ** được đẩy 2 thư mục này lên GitHub, kể cả repo private.

1. Vào GitHub, lấy URL repo trống bạn đã tạo (dạng `https://github.com/ten-ban/damcuoi.git`).
2. Cho tôi biết URL đó, tôi sẽ giúp bạn gắn remote + commit + push (bước này cần bạn xác nhận vì sẽ đẩy code lên tài khoản của bạn).

Sau bước này, mỗi khi muốn cập nhật code, bạn chỉ cần yêu cầu tôi (hoặc tự chạy) `git add`, `git commit`, `git push` — GitHub Actions ở Bước 5 sẽ tự động deploy phần còn lại.

---

## Bước 2 — Mua VPS Việt Nam *(làm trên trình duyệt, website nhà cung cấp)*

1. Chọn 1 nhà cung cấp (TinoHost / Vietnix / AZDIGI / iNET...), đăng ký tài khoản bằng email/SĐT thật.
2. Mua gói VPS: **1 vCPU / 2GB RAM / 20GB SSD**, hệ điều hành **Ubuntu 22.04**, thanh toán qua chuyển khoản ngân hàng hoặc MoMo (không cần thẻ quốc tế).
3. Sau khi thanh toán, nhà cung cấp sẽ gửi qua email (hoặc hiển thị trong trang quản trị "VPS của tôi"):
   - **Địa chỉ IP** của VPS.
   - **Mật khẩu root** (hoặc cho tải file khoá SSH — tuỳ nơi). Nếu chỉ có mật khẩu root, vẫn dùng được bình thường, chỉ cần thay bước SSH ở dưới bằng `ssh root@<IP>` rồi nhập mật khẩu khi được hỏi (thay vì dùng `-i "duong-dan-khoa.key"`).
4. Ghi lại **địa chỉ IP** — đây là địa chỉ bạn dùng để SSH và để truy cập website tạm thời (chưa có domain).

### Mở cổng mạng

Hầu hết VPS Việt Nam **không chặn cổng như Oracle** (không có "Security List" riêng phải cấu hình) — cổng 3000 thường đã thông sẵn ra ngoài. Nếu sau khi làm xong Bước 3 mà không truy cập được từ trình duyệt, kiểm tra thêm firewall ngay trong Ubuntu (chạy trên VPS):
```bash
sudo ufw allow 3000/tcp
sudo ufw allow OpenSSH
sudo ufw enable    # chỉ bật nếu ufw đang tắt; nếu ufw đã bật sẵn có rule khác thì bỏ qua dòng này
```
Nếu nhà cung cấp bạn chọn CÓ màn hình cấu hình "Firewall"/"Security Group" riêng trong trang quản trị VPS (một số nơi có), thêm rule cho phép cổng TCP `3000` từ `0.0.0.0/0` tương tự cách làm với Oracle.

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

VPS trả phí không có rủi ro bị thu hồi tài khoản đột ngột như Oracle Always Free, nhưng vẫn nên có bản sao lưu **nằm ngoài VPS** để phòng trường hợp máy chủ gặp sự cố (hỏng ổ đĩa, quên gia hạn...). Gợi ý đơn giản nhất: cron job nén `~/damcuoi-data` mỗi ngày rồi đẩy lên Google Drive cá nhân qua `rclone`. Có thể nhờ tôi thiết lập chi tiết khi bạn sẵn sàng — không bắt buộc phải làm ngay.

---

## Tóm tắt việc cần làm NGAY để bắt đầu

1. ~~Cho tôi URL repo GitHub trống~~ **Đã xong** — code đã push lên `https://github.com/XuyenDoan/DamCuoi` nhánh `main`.
2. Bạn tự mua VPS Việt Nam theo Bước 2 (tôi không thể làm thay vì cần tài khoản/thanh toán của bạn).
3. Gửi tôi **địa chỉ IP** + **mật khẩu root (hoặc file khoá SSH)** của VPS — tôi hướng dẫn tiếp/giúp bạn chạy các lệnh ở Bước 3.
4. Sau khi server chạy được, làm Bước 4 để bật tự động deploy.
