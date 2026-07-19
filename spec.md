# SPEC — Website Album Cưới (Wedding Gallery)

> Tài liệu phân tích & định hướng thiết kế cho website upload/chia sẻ hình cưới của hai vợ chồng.
> Tham khảo chính: [pic-time.com](https://www.pic-time.com) — nền tảng giao hình chuyên nghiệp cho photographer.
> Ngôn ngữ nội dung: **100% Tiếng Việt**.

## Quy tắc làm việc với AI Code (bắt buộc, mọi phiên làm việc)

- **Luôn trao đổi với chủ dự án bằng Tiếng Việt** trong mọi phản hồi (kể cả khi chủ dự án gõ tiếng Anh xen kẽ) — yêu cầu xác nhận rõ ràng, áp dụng từ đây trở đi cho toàn bộ dự án.
- Khi sửa code, nếu có gì chưa rõ thì hỏi lại trước khi làm.
- Sau khi sửa xong 1 phần việc, cập nhật lại file `spec.md` này cho khớp thực tế.
- Không tự ý `git commit`/`push` — chỉ làm khi chủ dự án yêu cầu rõ ràng bằng từ "deploy" (hoặc tương đương).

---

## 1. Tổng quan dự án

| Mục | Nội dung |
|---|---|
| Loại sản phẩm | Website cá nhân — Wedding Photo Gallery / Album cưới trực tuyến |
| Mục đích | Lưu trữ, trình chiếu và chia sẻ hình cưới của cô dâu & chú rể cho gia đình, bạn bè, khách mời |
| Đối tượng dùng | Chủ nhà (2 vợ chồng — quản trị, upload), khách mời/gia đình (xem, tải ảnh, có thể để lại lời chúc) |
| Ngôn ngữ | Tiếng Việt hoàn toàn (nội dung, nhãn nút, thông báo lỗi, meta SEO) |
| Cảm xúc mong muốn | Sang trọng, dịu dàng, ấm áp, riêng tư nhưng vẫn "wow" khi xem — giống trải nghiệm mở một cuốn album cưới cao cấp |
| Stack công nghệ (đã chốt) | **Nuxt 4** (Vue 3 + Nitro server) — gộp frontend + API ghi file JSON vào 1 app Node.js duy nhất (chi tiết mục 16). Ban đầu dự tính Nuxt 3, nhưng khi khởi tạo project `nuxi` cài bản ổn định mới nhất là Nuxt 4 — vẫn cùng nền Vue 3/Nitro, chỉ khác cấu trúc thư mục mặc định (`app/`), không đổi kiến trúc đã thống nhất |
| Hosting dự kiến (đã chốt) | **Oracle Cloud "Always Free" VPS** — có ổ đĩa bền vững, phù hợp kiến trúc lưu file JSON/ảnh (chi tiết mục 16) |
| Upload công khai | **Mở ngay từ đầu (MVP)**, không để giai đoạn 2 — khách mời gửi ảnh cần admin duyệt trước khi hiển thị công khai |

---

## 2. Phân tích thiết kế tham khảo — Pic-Time

Đã truy cập trực tiếp pic-time.com để rút ra các đặc điểm UX/UI có thể áp dụng:

### Điểm mạnh cần học theo
- **Hero full-bleed, tối giản chữ**: Trang chủ mở đầu bằng hình ảnh/video lớn chiếm toàn màn hình, tiêu đề ngắn gọn kiểu manifesto ("YOUR VISION, DELIVERED.") thay vì đoạn văn dài — tạo cảm giác điện ảnh ngay từ giây đầu.
- **Immersive gallery**: Ảnh được trình bày như một "trải nghiệm" (scroll-driven), không phải lưới ảnh khô cứng — ảnh lớn, đổi bố cục linh hoạt (full-width, 2 cột, 3 cột xen kẽ) để tạo nhịp điệu khi cuộn.
- **Chuyển động dẫn dắt cảm xúc**: Fade + slight scale-up khi ảnh xuất hiện, hiệu ứng scroll-reveal theo từng khối, không lạm dụng hiệu ứng — mỗi chuyển động đều có lý do (làm nổi bật khoảnh khắc).
- **Thanh điều hướng ẩn/hiện thông minh**: Nav bar tối giản, có thể trong suốt trên hero rồi chuyển nền đặc khi cuộn xuống.
- **Đề cao nội dung, giao diện lùi phía sau**: Chrome/UI rất mỏng (thin lines, nhiều khoảng trắng) để ảnh luôn là nhân vật chính.
- **Điểm nhấn cảm xúc bằng lời chứng thực**: Có khu vực trích lời người dùng thật, tạo tính xác thực và ấm áp.
- **Trải nghiệm mobile mượt**: Vì khách mời chủ yếu xem trên điện thoại, gallery co giãn tốt, thao tác chạm/vuốt tự nhiên.

### Những gì KHÔNG áp dụng (khác mục đích)
- Pic-Time là SaaS B2B cho photographer bán ảnh/album — có shop in ấn, upsell, nhiều CTA thương mại ("START FOR FREE", tính năng AI Search, Marketing Automations...). Website cưới của anh/chị là **trang cá nhân phi thương mại**, nên bỏ toàn bộ phần bán hàng, định giá, thương hiệu B2B.
- Tối giản hoá điều hướng: không cần menu nhiều tầng tính năng như Pic-Time, chỉ cần các mục cốt lõi (Trang chủ, Album ảnh, Video, Lời chúc, Thông tin cưới).

### Chuyển hoá thành ngôn ngữ thiết kế riêng
Giữ **cấu trúc trải nghiệm** (hero điện ảnh → cuộn khám phá ảnh theo nhịp → khoảnh khắc cảm xúc → lời chúc) nhưng thay:
- Tông màu trung tính/đen-trắng của Pic-Time → **hồng – xanh lá – trắng**, ấm và "Việt Nam" hơn.
- Thay hoạ tiết thương hiệu SaaS → **hoạ tiết hoa sen ẩn mờ** (watermark/pattern), gợi văn hoá cưới Việt.
- Thay tông chữ hiện đại thuần Latin → cặp font có hỗ trợ tốt **dấu tiếng Việt**.

---

## 3. Định hướng phong cách (Style Direction)

**Phong cách chủ đạo:** *Soft Elegance / Romantic Minimalism* — kết hợp:
- **Hero-Centric + Storytelling-Driven** (theo nhóm "Wedding/Event" trong hệ thống thiết kế): ảnh lớn dẫn chuyện, ít chữ, nhiều khoảng trắng.
- **Soft UI nhẹ nhàng**: bo góc mềm (12–20px), đổ bóng rất nhẹ (không dùng neumorphism nặng), viền mảnh thay vì khối.
- **Chất liệu hữu cơ**: hoạ tiết hoa sen dùng như lớp watermark mờ (opacity 4–8%) ở nền section, không cạnh tranh với ảnh thật.

**Tránh:**
- Màu hồng quá "kẹo" (candy pink) gây trẻ con — ưu tiên hồng rosy/dusty có độ trầm.
- Icon emoji 🌸💍 thay cho icon thật — dùng SVG line-art nhất quán.
- Hiệu ứng chuyển động chỉ để trang trí không có ý nghĩa (giảm hiệu năng, gây rối mắt trên mobile).

---

## 4. Bảng màu (Color Palette)

Màu chủ đạo theo yêu cầu: **Hồng – Xanh lá – Trắng**, tham chiếu nhóm "Wedding/Event Planning" và "Florist" trong hệ màu chuẩn, điều chỉnh cho hài hoà và đạt tương phản WCAG AA.

| Vai trò | Mã màu | Tên gợi ý | Dùng cho |
|---|---|---|---|
| Primary (Hồng chủ đạo) | `#DB2777` (đậm) / `#EC4899` (chuẩn) | Hồng Đào | Nút CTA chính, tiêu đề nhấn, active state |
| Primary Light | `#F9A8D4` | Hồng Phấn | Hover nhẹ, badge, highlight |
| Secondary (Xanh lá) | `#4D7C5F` | Xanh Lá Sen | Icon, đường viền nhấn, nút phụ, chi tiết hoạ tiết lá sen |
| Secondary Light | `#A7C4A0` | Xanh Bạc Hà Nhạt | Nền phụ, tag, divider |
| Nền chính | `#FFFFFF` | Trắng Ngà | Nền toàn trang |
| Nền phụ / Surface | `#FDF2F8` | Hồng Sữa | Nền section xen kẽ, card |
| Text chính | `#3F2A33` (nâu-hồng đậm, KHÔNG dùng đen thuần) | — | Tiêu đề, nội dung |
| Text phụ | `#7A6A70` | — | Caption, mô tả phụ |
| Vàng nhấn (tuỳ chọn, rất hạn chế) | `#C9A227` | Gold nhẹ | Chi tiết trang trí nhỏ (viền khung ảnh, icon "trân trọng") — dùng tiết kiệm, KHÔNG phải màu chủ đạo |
| Success | `#16A34A` | — | Thông báo tải ảnh thành công |
| Error | `#DC2626` | — | Lỗi form / upload thất bại |

**Nguyên tắc phối màu:**
- Nền tổng thể **trắng chiếm ~70%** diện tích để ảnh cưới nổi bật (ảnh mới là "nhân vật chính", không phải màu nền).
- Hồng và xanh lá không đặt cạnh nhau ở tỷ lệ 50/50 (dễ gây "giáng sinh"/chói) — xanh lá dùng làm điểm nhấn phụ (~15%), hồng làm điểm nhấn chính (~15%), còn lại là trắng/kem.
- Kiểm tra contrast: text chính `#3F2A33` trên nền trắng đạt >12:1 (AAA). Nút hồng đậm `#DB2777` với chữ trắng đạt ~4.6:1 (đạt AA cho text thường).
- Chế độ tối (nếu cần) không bắt buộc cho MVP — trang cưới ưu tiên nền sáng.

---

## 5. Hoạ tiết Hoa Sen (Lotus Motif)

Đây là **chi tiết bản sắc riêng** so với bản gốc pic-time.com — cần triển khai tinh tế:

- **Vị trí sử dụng:**
  - Watermark hoa sen line-art lặp lại (pattern) làm nền cho các section chuyển tiếp (opacity 4–8%, màu xanh lá nhạt `#A7C4A0` hoặc hồng phấn `#F9A8D4` tuỳ nền).
  - 1 bông sen line-art lớn làm chi tiết góc ở trang bìa (cover) hoặc footer — không đặt giữa nội dung.
  - Icon "cánh sen" nhỏ thay cho bullet point/divider giữa các mục trong timeline cưới.
- **Nguyên tắc:** Hoạ tiết luôn ở **lớp dưới cùng** (z-index thấp nhất), tuyệt đối không che chữ hay ảnh, không chuyển động giật (nếu có animation thì chỉ fade rất chậm, tôn trọng `prefers-reduced-motion`).
- **Định dạng:** SVG vector (không dùng ảnh raster/emoji) để nét mảnh, scale sắc nét mọi độ phân giải, dễ đổi màu theo theme.
- **Không lạm dụng:** tối đa 2–3 vị trí hoạ tiết hoa sen trên một màn hình, tránh làm rối mắt hoặc trông như giấy dán tường (**ngoại lệ có chủ đích:** nền toàn trang mô tả bên dưới — đây là hoạ tiết chính của cả trang khi không có ảnh nền, không tính vào giới hạn 2-3 vị trí).
- **Component `LotusMotif`** (SVG thuần, 8 cánh ngoài + 8 cánh trong + nhuỵ) có 3 chế độ:
  1. Tĩnh — dùng cho icon nhỏ, watermark góc (qua `LotusWatermark`).
  2. `animated` — tự vẽ nét 1 lần khi mount (stroke-dashoffset), dùng ở trang đăng nhập admin, empty-state...
  3. `bloomProgress` (0–1) — **búp hoa co lại ở tâm khi 0, nở dần khi tiến tới 1**, điều khiển từ ngoài. Cơ chế: cánh hoa vốn có gốc tại tâm (100,100) nên chỉ cần `transform: scale()` với `transform-origin` đặt tại tâm là ra đúng hiệu ứng búp↔nở tự nhiên, không cần vẽ 2 bộ SVG riêng.
  - Có thêm prop `filled` (tô mềm thay vì chỉ viền) — giữ lại vì vô hại, scene không còn dùng.
- **Component `LotusFlower`** — bông sen **nhìn nghiêng** vẽ theo tranh màu nước mẫu (đã nâng cấp qua 2 vòng: mandala 16 cánh → nghiêng 12 cánh → **nghiêng 18 cánh 4 lớp** hiện tại cho dày dặn/chân thật hơn). Gradient hồng 3 chặng (chóp `#DB2777`→`#EC4899`→gốc `#F9A8D4`, đúng bảng màu mục 4), **có gân cánh mảnh** dọc mỗi cánh, đài hoa xanh `#4D7C5F` ở chân, nhuỵ vàng `#C9A227` lộ ra khi cánh trước mở quá nửa. Gradient id sinh bằng `useId()` nên nhiều bông cùng trang không xung đột (đã verify).
- **Component `LotusFlowerTop`** — bông sen **cánh kép nhìn trực diện từ trên xuống**, vẽ lại theo ảnh chụp thực tế do chủ dự án cung cấp: **4 vòng cánh THUÔN NHỌN đồng tâm, tổng 36 cánh** (6/8/10/12 cánh từ trong ra ngoài) — hẹp ở gốc, phình ở khoảng 60% chiều dài, thon nhọn dần về chóp (dáng cánh sen thật, KHÔNG phải hình bầu dục tròn kiểu mẫu đơn — đã đổi ở yêu cầu chỉnh lần 7). Mỗi cánh có **gân giữa mảnh** (1 nét cong nhẹ từ gốc tới gần chóp). Gốc cánh đặt đúng theo **bán kính riêng của từng vòng** nên các vòng thực sự XẾP CHỒNG LỚP giống ảnh thật. **Lệch tự nhiên không đối xứng tuyệt đối** (yêu cầu chỉnh lần 7 — hoa thật không đều tăm tắp): mỗi cánh có góc xoay lệch ngẫu nhiên ổn định ±5° và kích thước lệch ±8% (seed theo chỉ số cánh, không đổi giữa các lần render). Màu **lệch rõ rệt** giữa 4 vòng (không mờ dần liên tục): trắng kem gần trong suốt (`#FDF2F8`) → hồng phấn (`#F9A8D4`) → hồng vừa (`#F472B6`) → hồng đậm (`#DB2777`) ở viền vòng ngoài cùng. **Gương sen ở tâm** (yêu cầu chỉnh lần 9 — thay hẳn hướng "nhị hoa mảnh" đã thử ở lần 8, xem lỗi #5/#6 bên dưới): đĩa vàng-xanh bán kính 13 đơn vị (gradient tâm `#E4D98A` → viền `#93A25A`) với **16 lỗ hạt** (`#5B6B3A`, 6 hạt vòng trong bán kính ~5.5–6.1 + 10 hạt vòng ngoài bán kính ~9.5–10.1, xếp lệch pha kiểu tổ ong) — mô phỏng đúng "gương sen"/đài hạt sen thật, đặc điểm dễ nhận diện nhất của hoa sen nhìn từ trên xuống. To dần theo bloom, sàn scale **giống hệt công thức của cánh** (0.14) để không lệch tỉ lệ lúc còn là búp.
  - **Lỗi thật #3 đã gặp & fix (yêu cầu chỉnh lần 8 — "vẫn thấy vòng tròn màu trắng, không thấy cánh"):** phần tâm hoa bản trước là 1 đĩa tròn phẳng màu vàng be rất nhạt (`#EAD98C`) + 8 chấm hạt bán kính 1.3 trên nền viewBox 200 đơn vị — quá nhỏ để nhận ra ở kích thước hiển thị thực tế, mắt chỉ thấy đĩa nền nhạt gần như trắng, không đọc được là "nhuỵ/đài sen". Khắc phục: bỏ hẳn đĩa nền phẳng, thay bằng **cụm nhị hoa dạng tua toả tia** (xem trên) — chi tiết có cấu trúc rõ ràng (tua + đầu phấn) thay vì 1 mảng màu đặc, dễ nhận diện ở mọi kích thước hiển thị.
  - **Lỗi thật #5 đã gặp & fix (yêu cầu chỉnh lần 9 — sau khi thêm nhị hoa ở lỗi #3, vẫn "chưa thấy nhụy đâu, vẫn còn vòng tròn màu trắng"):** cụm nhị hoa vừa thêm có kích thước quá nhỏ so với viewBox 200 đơn vị (chấm tâm bán kính 1.6, tua dài 6.5–9.7, đầu phấn bán kính 1.7–2.6) — khi hoa hiển thị ở cỡ trang trí nền thực tế (~100–200px trên màn hình) thì các chi tiết này co lại còn **dưới 1 pixel, gần như vô hình**, để lộ lại khoảng trống nhạt ở tâm giống hệt lỗi #3. Khắc phục: **phóng to cụm nhị ~3 lần** (chấm tâm bán kính 4, tua dài 16–23, đầu phấn bán kính 5–7.2, nét tua dày 1.3) sao cho tua nhị vươn tới bán kính ~31 đơn vị — phủ kín và lấn ra ngoài cả vòng cánh trong cùng (bán kính 4–28) — đã verify bằng đo `getBBox`/thuộc tính SVG thực tế qua DOM (không dùng screenshot vì công cụ chụp ảnh trình duyệt không ổn định trong môi trường này). **Quy tắc rút ra:** khi thêm chi tiết trang trí nhỏ vào SVG có viewBox lớn, phải tính kích thước theo **tỉ lệ hiển thị thực tế trên màn hình**, không chỉ theo tỉ lệ tương đối trong viewBox — chi tiết "trông hợp lý" trên giấy vẽ 200 đơn vị vẫn có thể vô hình khi hoa chỉ chiếm vài chục pixel thật.
  - **Lỗi thật #6 đã gặp & fix (yêu cầu chỉnh lần 9 — sau khi phóng to nhị hoa ở lỗi #5, "nhụy nằm bên ngoài so với hoa" + "vẫn còn vòng tròn màu trắng"):** 2 vấn đề cùng lúc. (a) Cụm nhị hoa dùng `podScale` với **sàn 0.5** (không bao giờ nhỏ hơn nửa cỡ) trong khi cánh hoa dùng sàn **0.14** — lúc hoa còn ở giai đoạn búp/mới hiện (bloomProgress thấp), cánh co lại gần sát tâm (bán kính gốc cánh trong cùng 4×0.14≈0.56) nhưng cụm nhị vẫn to gần bằng nửa kích thước đầy đủ, khiến nhị trông như 1 khối rời nằm NGOÀI cụm cánh tí hon thay vì nằm giữa hoa. (b) Ở hoa nở đầy đủ, gân cánh (nét trắng/hồng nhạt mảnh) của các cánh vòng trong cùng hội tụ về đúng tâm hoa tạo hiệu ứng hình sao/chữ thập màu trắng, cộng thêm nhị vàng mảnh khó nổi bật trên nền đó → mắt vẫn đọc ra "vòng tròn trắng" ở tâm dù nhị đã hiện diện. **Khắc phục:** bỏ hẳn hướng "nhị hoa mảnh" (đã thử 2 lần đều hỏng vì bản chất là chi tiết quá mảnh/dễ vỡ hình ở quy mô trang trí), thay bằng **GƯƠNG SEN** — 1 khối đặc (đĩa gradient vàng-xanh + 16 lỗ hạt), không có thành phần mảnh nào để "biến mất" hay "lệch tỉ lệ": (1) không bị gân cánh át màu vì là khối đặc lớn, không phải nét mảnh; (2) `podScale` đổi sang dùng **đúng công thức 0.14 + 0.86×ease** giống hệt cánh nên luôn tỉ lệ khớp với cánh ở mọi giai đoạn nở, không còn hiện tượng "nhị lớn hơn tương đối so với cánh lúc còn búp". **Quy tắc rút ra:** chi tiết trang trí ở tâm 1 cụm hoạ tiết co-nở theo tỉ lệ phải dùng **chung 1 công thức scale** với các thành phần xung quanh nó — sàn scale khác nhau giữa các bộ phận của cùng 1 đối tượng sẽ gây lệch tỉ lệ tương đối rõ rệt ở các trạng thái trung gian (không chỉ ở 2 đầu mút 0 và 1).
  - **Lỗi thật #6b đã gặp & fix (ngay sau #6 — "nhụy hoa còn nằm cách xa, chưa nằm trong hoa"):** đổi sang gương sen ở lỗi #6 vẫn định vị sai vì thẻ `<g>` chứa gương sen gán **CÙNG LÚC 2 loại transform**: thuộc tính SVG `transform="translate(100 100)"` (để đưa vào đúng tâm hoa) VÀ CSS `style="transform: scale(...)"` (để co-nở theo bloom) trên **CHUNG 1 thẻ**. Theo hành vi CSS Transforms trên SVG, khi 1 phần tử có cả CSS `transform` lẫn thuộc tính XML `transform`, **CSS ghi đè hoàn toàn thuộc tính XML chứ không cộng dồn** — nên lệnh `translate(100 100)` mất tác dụng, gương sen chỉ còn scale quanh gốc (0,0) của viewBox (góc trên-trái), lệch hẳn khỏi tâm hoa nơi các cánh hội tụ về. Đã verify bằng `getComputedStyle().transform` cho ra ma trận không có thành phần dịch chuyển (`matrix(0.14,0,0,0.14,0,0)`), xác nhận đúng lỗi. **Khắc phục:** tách thành 2 thẻ `<g>` lồng nhau — `<g transform="translate(100 100)">` (chỉ SVG attribute, không CSS) bọc ngoài `<g class="lotus-pod-top" :style="scale(...)">` (chỉ CSS, không SVG attribute). Verify lại bằng đo `getBoundingClientRect()` thực tế trên cả 5 bông hoa trong trang: tâm gương sen lệch tâm khung SVG **0.0%** ở mọi bông. **Quy tắc bắt buộc bổ sung:** KHÔNG BAO GIỜ gán cả thuộc tính SVG `transform` và CSS `style="transform"` trên CÙNG 1 thẻ — nếu cần vừa định vị (translate/rotate cố định) vừa co-nở động theo state, phải tách ra 2 thẻ `<g>` lồng nhau, mỗi thẻ chỉ dùng 1 loại transform.
  - **Lỗi thật #4 đã gặp & fix (hydration mismatch khi thêm nhị hoa):** hàm sinh số giả-ngẫu-nhiên ban đầu dùng `Math.sin(seed * 12.9898) * 43758.5453` (kỹ thuật "sin-noise" phổ biến trong shader) — nhưng `Math.sin`/`Math.cos` **không được đặc tả ECMAScript đảm bảo cho kết quả giống hệt bit-cuối giữa các engine JS khác nhau** (Node.js server vs V8 trong trình duyệt), gây lệch toạ độ cỡ ~10⁻¹² giữa HTML server-render và client-render → Vue báo lỗi hydration mismatch thật (verify bằng tab trắng mới, không phải log tồn đọng). **Khắc phục & quy tắc bắt buộc:** mọi hàm giả-ngẫu-nhiên dùng cho nội dung render ở SSR phải CHỈ dùng phép toán số nguyên đặc tả chính xác tuyệt đối (`^`, `>>>`, `Math.imul`) — không dùng `Math.sin`/`Math.cos`/`Math.random` cho mục đích này.
  - **Lỗi thật #1 đã gặp & fix (yêu cầu chỉnh lần 5 — "chỉ thấy 1 vòng tròn trắng, không thấy cánh"):** bản đầu dùng CSS `transform: rotate() translate(0,-Rpx) scale()` để đẩy mỗi cánh ra xa tâm theo bán kính riêng — `translate()` theo đơn vị `px` lồng trong phần tử SVG có `viewBox` bị diễn giải sai lệch tỉ lệ giữa các trình duyệt thực tế, đẩy toàn bộ cánh ra ngoài vùng nhìn thấy, chỉ còn đài hoa hiển thị. **Cách khắc phục đúng:** bán kính từng vòng được **bake thẳng vào toạ độ tuyệt đối của path** (không dùng `translate` nữa), mỗi cánh chỉ còn `rotate()` (SVG attribute, an toàn) + `scale()` (CSS, không có đơn vị độ dài nên không bị lỗi tương tự) — đúng cơ chế đã kiểm chứng hoạt động ở `LotusMotif`/`LotusFlower`. **Quy tắc bắt buộc cho code sau này:** không dùng CSS `transform: translate(...px)` trên phần tử con của `<svg viewBox>` để định vị theo bán kính/khoảng cách — chỉ dùng `rotate()`/`scale()` (không đơn vị) trong CSS, hoặc bake toạ độ trực tiếp vào path/SVG attribute transform nếu cần dịch chuyển.
  - **Lỗi thật #2 đã gặp & fix (yêu cầu chỉnh lần 6 — sau khi sửa lỗi #1, vẫn "chỉ thấy vòng tròn trắng mờ, không thấy cánh" dù cánh đã render đúng vị trí):** bản 6 vòng/66 cánh quá dày — quá nhiều cánh nhỏ nhạt màu chồng lấn khít nhau khiến chúng hoà lẫn thành 1 đĩa tròn mờ đồng nhất, chỉ còn viền cánh (nhiều nét trùng nhau tạo thành các vòng tròn mảnh) là phân biệt được bằng mắt — không phải bug kỹ thuật mà là vấn đề THIẾT KẾ THỊ GIÁC (mật độ quá cao + tương phản màu quá thấp). Khắc phục: giảm còn 4 vòng/32 cánh, tông màu giữa các vòng lệch mạnh, viền cánh đậm hơn (`stroke-opacity` 0.15 → 0.35), xen kẽ `fill-opacity` giữa các cánh liền kề.
  - **Chỉnh thẩm mỹ (yêu cầu chỉnh lần 7 — "chưa giống hoa sen thật"):** hình cánh **tròn/bầu dục kiểu mẫu đơn** (dù đã sửa lỗi #1/#2) vẫn không đúng đặc trưng SEN, trông giống hoa cúc/mẫu đơn hơn. Đổi hẳn sang dáng cánh **thuôn nhọn** (hẹp gốc → phình giữa → nhọn chóp), thêm gân cánh, tăng lên **36 cánh** (6/8/10/12) và thêm **lệch góc/cỡ ngẫu nhiên ổn định theo seed** (không đối xứng tăm tắp) để trông tự nhiên như hoa thật thay vì hoạ tiết hình học đều đặn.
- **Hiệu ứng nở kiểu slow-motion (cả 2 loại bông):** không nở đều cả bông — MỖI CÁNH có `stagger` (mốc bắt đầu trễ riêng: lớp/vành ngoài mở trước → lớp trong ôm nhuỵ mở sau cùng) + `transition-duration` riêng (850–1250ms, lệch nhau) + easing đuôi chậm (`cubic-bezier(0.22, 0.8, 0.3, 1)` + ease-out cubic trong JS). Búp (`bloomProgress = 0`): cánh chụm sát tâm/thẳng đứng nhưng vẫn hé nhẹ để thấy lớp cánh chồng nhau như búp sen thật.
- **Component `LotusLeaf`** — lá sen tròn nhìn từ trên, **mép LƯỢN SÓNG** (11 gợn, tạo bằng path Q-curve sinh trong JS) mềm mại như lá thật thay vì hình tròn cứng, **gradient toả tâm** (sáng ở rốn → xanh đậm ra mép), gân lá cong toả từ rốn, khuyết chữ V đặc trưng. Pha 2 sắc xanh secondary / secondary-light xen kẽ.
- **Component `LotusScene`** — khung cảnh ao sen phủ **TOÀN TRANG**, vẽ lại bằng SVG vector (không dùng ảnh có sẵn vì bản quyền + không điều khiển được animation từng cánh):
  - **8 bông (3 nghiêng + 5 trực diện)**, kích thước LỚN, rải khắp trang ở nhiều độ cao: bông nghiêng neo đáy trên cuống cong (`bottom` đa dạng, có cây mọc từ bệ cao `bottom: 30vh`), bông trực diện **trôi nổi** ở nhiều vị trí trên/giữa/dưới như sen trên mặt nước nhìn từ trên.
  - **Mỗi bông có đúng 1 lá sen đi kèm** (yêu cầu chỉnh lần 5, rồi tinh chỉnh lại cách đặt vị trí ở lần chỉnh sau — xem dưới) — lá gắn trực tiếp vào từng object bông (`leaf: {size?, tone, offsetX?, rotate?}`), tổng 8 lá khớp 1-1 với 8 bông.
  - **Vị trí lá theo TỪNG LOẠI góc nhìn** (yêu cầu chỉnh riêng): 
    - **Bông trực diện (nhìn từ trên xuống)**: lá đặt CĂN GIỮA đúng tâm bông (`left-1/2 top-1/2` + `translate(-50%,-50%)`, đã verify bằng đo tâm 2 phần tử trùng nhau tuyệt đối), kích thước lá luôn = `topLeafSize(f) = f.size * 0.9` lần bán kính công thức lá (`*9` so với `*6` của hoa) — tự động lớn hơn hoa theo đúng 1 tỉ lệ nhất quán dù bông to hay nhỏ, để viền lá ló ra quanh mép cánh — đúng ảnh hoa sen nổi trên lá thật nhìn từ trên xuống. Lá render TRƯỚC hoa trong DOM nên luôn nằm DƯỚI hoa khi xếp chồng.
    - **Bông nghiêng (nhìn ngang, có cuống)**: lá đặt NGAY TẠI GỐC CUỐNG (chỗ cuống "chạm mặt nước") — neo `bottom-0` bên trong cùng khối với hoa+cuống, dịch xuống theo % chiều cao lá + lệch ngang `offsetX` (%, mỗi bông khác nhau, không đối xứng tăm tắp) + xoay nhẹ `rotate` (độ) cho tự nhiên, render SAU cuống trong DOM nên đè lên đoạn cuống dưới cùng — mô phỏng đúng ảnh thật: cuống sen mọc cạnh/xuyên qua 1 tán lá nổi ngay chỗ nó chạm nước, không phải lá bay lơ lửng cạnh hoa như bản cũ. **Lá được ÉP DẸT theo chiều dọc** (`scaleY(0.42)` — yêu cầu chỉnh tiếp: "chưa hài hoà" vì `LotusLeaf` vốn vẽ lá nhìn thẳng từ trên nên đặt cạnh bông NHÌN NGANG bị lệch phối cảnh) — biến hình tròn thành elip dẹt (tỉ lệ rộng:cao ~1.85:1, đã verify), mô phỏng đúng kỹ thuật minh hoạ kinh điển cho 1 mặt phẳng ngang (mặt nước) nhìn từ góc ngang tầm mắt, khớp góc nhìn với hoa. **Lỗi thật đã gặp & fix**: 2 bông nghiêng đặt sát mép trái/phải (`bottom: '0'`) sau khi thêm lá bị đẩy xuống ("dịch xuống % chiều cao") đã đẩy lá ra NGOÀI viewport, bị lớp `overflow-hidden` cắt mất phần dưới ("lá sen bị che") — xác nhận bằng đo `getBoundingClientRect().bottom > innerHeight`. Khắc phục: nâng `bottom` của 2 bông này lên `19vh`/`17vh` (thay vì `0`) đủ chỗ cho lá không bị cắt, đã verify hết clip ở cả desktop 1280px lẫn mobile 375px.
  - **Đã bỏ 2 bông nhỏ từng đặt sát mép trái (15%) và mép phải (90%)** — 2 bông này (loại nghiêng, búp trên cuống cao) gây chồng lấn với lá có sẵn theo phản ánh thực tế; không tìm được vị trí thay thế hợp lý hơn nên xoá hẳn theo đúng phương án dự phòng chủ dự án cho phép ("nếu không tìm được thì xoá đi"), còn lại 8 bông.
  - Mỗi bông có `appearAt` (tiến độ cuộn khi hiện đầy đủ) + cửa sổ nở `bloomStart`/`bloomEnd` riêng. **Lúc tải trang**: 2 bông thấy ngay (1 bông nghiêng lớn nở sẵn ~3/4 + 1 bông trực diện lớn mới hé — kèm lá tương ứng); cuộn xuống thì 6 bông + lá còn lại hiện dần và nở dần trong cửa sổ khác nhau nên không bao giờ nở đồng loạt.
  - Tôn trọng `prefers-reduced-motion`: tắt transition, hiện sẵn toàn bộ hoa đã nở.
  - **Component `WaterRipple`** (yêu cầu bổ sung: "hiệu ứng mặt nước", rồi "bổ sung thêm mặt nước" ở lần chỉnh sau) — nhiều lớp gợn sóng ngang mảnh (đường SVG hình sin) đặt ở dải **`42vh`** dưới cùng màn hình (tăng từ `28vh` ban đầu — yêu cầu "bổ sung thêm"), mỗi lớp là 1 chu kỳ sóng LẶP LẠI 2 LẦN cạnh nhau (chiều rộng SVG = 200%) rồi animate `translateX(0 → -50%)` liên tục — do nửa sau giống hệt nửa đầu nên mắt không nhận ra điểm nối, tạo cảm giác trôi ngang vô hạn mượt mà. **5 lớp** gợn sóng tốc độ/hướng khác nhau (34s/40s/46s/52s/60s, xen kẽ chiều xuôi/ngược) rải đều khắp chiều cao dải (không dồn hết ở đáy) + 1 lớp **gradient phủ màu nước** (`from-secondary-light/10 via-secondary-light/4 to-transparent`) tạo cảm giác cả 1 VÙNG NƯỚC thay vì chỉ vài đường kẻ mảnh. Độ mờ nhẹ để không cạnh tranh với nội dung. Tôn trọng `prefers-reduced-motion` (tắt hẳn animation).
  - **Component `LotusDragonfly`** (yêu cầu bổ sung: "vài con chuồn chuồn bay") — line-art mảnh cùng phong cách nét mỏng/`currentColor` với `LotusMotif`/`LotusLeaf`. **Chủ động KHÔNG vẽ cánh đập nhanh kiểu hoạt hình** — không hợp tông thanh lịch, chậm rãi của trang cưới; cánh giữ tĩnh, chuyển động thật nằm ở đường BAY LƯỢN CHẬM do `LotusScene` điều khiển: 3 chuồn chuồn, mỗi con theo 1 trong 3 kiểu `@keyframes` bay lượn vòng lớn riêng (`dragonfly-fly-a/b/c`, biên độ tính bằng `vw`/`vh` để ổn định theo màn hình), chu kỳ 26–32s, `ease-in-out`, lệch `animation-delay` âm để không đồng bộ. Tôn trọng `prefers-reduced-motion` (đứng yên).
    - **Chỉnh lại lần 2 (phản hồi thật: "chưa giống con chuồn chuồn lắm")**: bản đầu dùng cánh hình ELIP TRÒN TRỊA (giống cánh hoa/cánh bướm hơn cánh màng mỏng của chuồn chuồn) + đầu chỉ là 1 CHẤM TRÒN đơn — thiếu đúng 2 đặc điểm nhận diện chuồn chuồn rõ nhất: **mắt kép to** và **cánh thon dài nhọn 2 đầu**. Vẽ lại: cánh dùng `<path>` hình thoi thon nhọn (`M0,0 Q16,-4.6 32,0 Q16,4.6 0,0 Z`) neo 1 đầu tại ngực rồi xoè ra CHỈ VỀ 1 PHÍA (đúng cách cánh thật gắn vào thân, khác bản trước dùng ellipse tâm tại điểm neo nên xoè ra CẢ 2 phía không tự nhiên); thêm rõ khối ngực riêng (`ellipse` nơi cánh gắn vào) + đầu hình oval với **2 vòng tròn mắt kép** đặt gần nhau chiếm phần lớn đầu (đặc điểm dễ nhận nhất); bụng kéo dài mảnh hơn, thon nhỏ dần về đuôi.
- **Component `PageBackdrop`** (mục 15.2) — nền toàn trang, `position: fixed` phủ hết viewport, nằm sau nội dung, dùng cho **cả 5 trang công khai**: hiện ảnh nền riêng (mờ ~14% opacity) nếu admin đã chọn, hoặc `LotusScene` (bọc `opacity-60`) nếu chưa chọn ảnh — tiến độ chung gắn theo tỉ lệ cuộn trang (`scrollY / (scrollHeight - innerHeight)`). Component `LotusWatermark` (góc nhỏ, tĩnh) vẫn dùng ở footer.

---

## 6. Typography

Yêu cầu bắt buộc: **font phải hỗ trợ đầy đủ bộ dấu tiếng Việt** (subset Vietnamese trên Google Fonts), tránh vỡ dấu/ dính dấu.

| Vai trò | Font đề xuất | Lý do |
|---|---|---|
| Heading / Tiêu đề lớn (tên cô dâu chú rể, ngày cưới) | **Playfair Display** hoặc **Cormorant Garamond** (serif) | Nét thanh-đậm tương phản, cảm giác thiệp cưới sang trọng; cả hai đều có subset Vietnamese đầy đủ |
| Body / Nội dung, nút, form | **Be Vietnam Pro** hoặc **Inter** | Sans-serif rõ ràng, tối ưu đọc tiếng Việt trên mobile, nhiều độ đậm (300–700) |
| Accent / Chữ ký, trích dẫn lời chúc (dùng tiết kiệm) | **Marcellus** hoặc script nhẹ như **Cormorant** italic | Gợi cảm giác viết tay/thiệp mời — chỉ dùng cho câu ngắn, KHÔNG dùng cho đoạn văn dài (khó đọc) |

**Type scale gợi ý (base 16px):**
`12 / 14 / 16 / 18 / 24 / 32 / 48 / 64px` — heading lớn nhất (tên cô dâu chú rể ở hero) có thể lên 64–96px trên desktop, giảm còn 32–40px trên mobile.

**Quy tắc:**
- Line-height 1.5–1.6 cho body, 1.2–1.3 cho heading serif lớn.
- Không dùng chữ script/viết tay cho đoạn văn dài hoặc thông báo lỗi — chỉ dùng sans-serif cho các phần chức năng (form, nút, thông báo).
- Cỡ chữ tối thiểu 16px trên mobile để tránh iOS auto-zoom khi focus vào input.

---

## 7. Sơ đồ trang (Sitemap) & Cấu trúc nội dung

URL cụ thể (đã chốt khi code, dùng slug tiếng Việt không dấu để dễ đọc trên thanh địa chỉ):

```
Trang chủ (Cover / Hero)                              → /  (LUÔN LUÔN hiển thị, không có công tắc ẩn/hiện — mục 18)
 ├─ Tên CHÚ RỂ & CÔ DÂU (thứ tự đã đổi ở mục 18.8) + ngày cưới (đếm ngược) trên nền mờ (ảnh nền riêng hoặc hoa sen — mục 15.2)
 ├─ Lời ngỏ ngắn (1-2 câu) + CTA "Xem Album Ảnh"
 └─ Section "Câu Chuyện Của Chúng Tôi" (đã CHUYỂN từ /thong-tin sang đây — mục 18.4), ngay dưới CTA, trên footer

Album Ảnh (Gallery)                                   → /album
 ├─ Bộ lọc theo album
 ├─ Lưới masonry CÂN BẰNG THẬT (thuật toán greedy shortest-column, không còn dùng CSS `columns-*` — mục 18.2), click mở lightbox full-screen (vuốt trái/phải trên mobile)
 ├─ PHÂN TRANG phía client (24 ảnh/trang — mục 18.2)
 └─ Nút "Tải ảnh này" trên từng ảnh (tải lẻ) + "Tải toàn bộ Album" (zip)

Video Cưới (nếu có)                                   → nhúng trong /thong-tin hoặc /album, không tách trang riêng
 └─ Nhúng video highlight (player tuỳ chỉnh tối giản)

Khách Mời Tải Ảnh Lên                                 → /gui-anh
(Upload — mở công khai ngay từ đầu, có kiểm duyệt trước khi public)
 ├─ Form nhập tên người gửi (không bắt buộc tài khoản)
 ├─ Kéo-thả / chọn nhiều ảnh, hiển thị tiến trình upload
 ├─ Giới hạn dung lượng/loại file (VD: mỗi ảnh ≤15MB, chỉ nhận jpg/png/webp)
 └─ Trạng thái: đang tải / thành công (chờ duyệt) / lỗi (kèm hướng dẫn khắc phục)

Lời Chúc (Guestbook)                                  → /loi-chuc
 ├─ Lưới CARD vuông (ảnh đại diện + tên + trích đoạn rút gọn `line-clamp-3` — mục 18.3, thay cho list dọc cũ)
 ├─ Bấm vào card mở POPUP (WishModal) xem toàn bộ nội dung
 └─ Form gửi lời chúc mới

Thông Tin Lễ Cưới (tuỳ chọn)                          → /thong-tin
 └─ Thời gian, địa điểm (bản đồ nhúng) — KHÔNG còn "Câu chuyện tình yêu" (đã chuyển sang Trang chủ, mục 18.4)

Trang Quản Trị (Admin — riêng cho 2 vợ chồng)         → /admin
 ├─ Đăng nhập
 ├─ Nội dung trang: chữ + ảnh nền riêng & bật/tắt hiển thị từng trang (dạng list + popup — mục 18.5/18.7), Câu chuyện tình yêu multi-ảnh (dạng list + popup — mục 18.5/18.6), nút Lưu sticky
 ├─ Quản lý album (upload, sắp xếp, xoá)
 ├─ Duyệt ảnh khách gửi lên (nếu cần kiểm duyệt trước khi public)
 └─ Xem/quản lý lời chúc
```

**Điều hướng chính (header):** sinh ĐỘNG từ `MANAGED_PAGES` (shared/pages.ts), lọc bỏ trang đang bị admin tắt hiển thị (mục 18.7) — trước đây là mảng hard-code riêng biệt, đã hợp nhất để tránh lệch dữ liệu. Trang chủ luôn có mặt, không thể tắt. **`/admin` cố tình KHÔNG đặt trong nav chính** — chỉ có 1 link nhỏ, mờ ở footer, vì đây là lối vào riêng cho 2 vợ chồng, không phải thứ khách mời cần thấy nổi bật (tách biệt hành động quản trị khỏi điều hướng khách — checklist `destructive-nav-separation`).

---

## 8. Trải nghiệm chuyển động (Motion / Animation Guide)

Lấy cảm hứng nhịp điệu "cuộn khám phá" của Pic-Time nhưng tiết chế hơn cho một trang cá nhân:

| Khu vực | Hiệu ứng | Thời lượng | Ghi chú |
|---|---|---|---|
| Nền toàn trang (`PageBackdrop`+`LotusScene`, cả 5 trang) | Ao sen phủ toàn trang: 10 bông (nghiêng + trực diện nhìn từ trên) + 6 lá rải khắp trang; vài bông hiện sẵn (có bông còn búp) lúc tải, cuộn xuống thì thêm bông hiện + nở dần; từng cánh mở lệch nhịp kiểu slow-motion (stagger + duration riêng); hoặc ảnh nền mờ tĩnh nếu admin đã chọn ảnh | Liên tục theo scroll (opacity 700ms, mỗi cánh hoa 850–1250ms, easing đuôi chậm) | `position: fixed`, không di chuyển khi cuộn; đổi trang (SPA nav) reset về đầu |
| Section reveal khi cuộn | Fade + scale nhẹ (0.97 → 1) theo từng khối ảnh, stagger 30–50ms/ảnh | 300–400ms | Dùng IntersectionObserver (`v-reveal`); ngừng lặp lại khi đã hiện |
| Lightbox mở ảnh | Scale-fade từ vị trí ảnh gốc (shared element) | ≤400ms | Tôn trọng spatial continuity |
| Nút / thẻ tương tác | Scale 0.97–1.02 khi nhấn (press feedback) | 150ms | Áp dụng transform/opacity, không animate width/height |
| Upload tiến trình | Progress bar mượt + icon check thành công | — | Không dùng spinner chặn thao tác quá 1s mà không có phản hồi |

**Bắt buộc:** tôn trọng `prefers-reduced-motion` — tắt hiệu ứng scroll-reveal phức tạp, giữ lại fade cơ bản.

---

## 9. UX & Khả năng tiếp cận (Accessibility)

- Tương phản màu văn bản/nền đạt tối thiểu 4.5:1 (đã kiểm ở mục 4).
- Toàn bộ nút chức năng (tải ảnh, mở lightbox, đóng modal) có `aria-label` rõ ràng bằng tiếng Việt — không chỉ icon.
- Vùng chạm tối thiểu 44×44px cho mọi nút trên mobile (khách mời chủ yếu dùng điện thoại).
- Alt text tiếng Việt mô tả cho ảnh quan trọng (ảnh bìa, ảnh đại diện từng mục) — ảnh trong lưới gallery lớn có thể dùng alt ngắn gọn kiểu "Ảnh cưới — Lễ thành hôn".
- Không disable zoom (`user-scalable=no` không được dùng) — khách lớn tuổi cần phóng to để xem ảnh/đọc chữ.
- Empty state có hướng dẫn (VD: "Album đang được cập nhật, quay lại sau nhé!" thay vì màn hình trắng trơn).
- Form lời chúc/upload: validate khi rời trường (on blur), thông báo lỗi ngay dưới ô nhập bằng tiếng Việt rõ nguyên nhân + cách sửa (VD: "Ảnh vượt quá 10MB, vui lòng chọn ảnh nhỏ hơn").

---

## 10. Responsive & Hiệu năng

- Thiết kế **mobile-first**: đa số khách mời xem trên điện thoại qua link chia sẻ (Zalo/Facebook).
- Breakpoint chuẩn: 375 / 768 / 1024 / 1440px.
- Ảnh cưới là nội dung nặng nhất → bắt buộc:
  - Nén & phục vụ định dạng WebP/AVIF, có bản responsive (srcset).
  - Lazy-load ảnh dưới màn hình đầu tiên.
  - Khai báo width/height hoặc aspect-ratio để tránh giật layout (CLS) khi ảnh tải.
  - Thumbnail độ phân giải thấp trước, ảnh gốc chỉ tải khi mở lightbox hoặc bấm tải về.
- Tính năng "Tải toàn bộ Album" nên nén phía server (zip theo lô) để tránh treo trình duyệt khách.

---

## 11. Ghi chú kỹ thuật & phạm vi tính năng (gợi ý MVP)

**MVP (bắt buộc để ra mắt):**
- Trang chủ + Album ảnh (xem, lightbox, tải ảnh) + đa ngôn ngữ chỉ tiếng Việt.
- Trang quản trị để 2 vợ chồng upload/sắp xếp ảnh **và chỉnh sửa nội dung chữ** (chi tiết ở mục 15).
- **Khách mời upload ảnh công khai** (đã xác nhận mở ngay từ đầu, không để giai đoạn 2) — bắt buộc kèm giới hạn dung lượng/loại file + admin duyệt trước khi ảnh public (mục 15.3).
- Sổ lời chúc (guestbook).
- Lưu trữ dữ liệu bằng file JSON theo kiến trúc mục 14.
- Responsive đầy đủ mobile/desktop.

**Giai đoạn 2 (mở rộng, không bắt buộc cho MVP):**
- Video cưới, đếm ngược ngày cưới, bản đồ địa điểm.
- Captcha chống bot / rate-limit theo IP cho form upload — đã trao đổi, hiện chưa bật ngay vì bạn chỉ chọn lớp bảo vệ bắt buộc (giới hạn file + duyệt thủ công); nếu sau này bị spam ảnh rác, đây là việc bổ sung nhanh, không cần đổi kiến trúc.

**Cân nhắc bảo mật/riêng tư:**
- Nếu không muốn công khai hoàn toàn, cân nhắc bảo vệ bằng mật khẩu chung hoặc link riêng tư (không index bởi Google — thêm `noindex`).
- Vì upload công khai mở từ đầu và chưa có captcha/rate-limit, admin cần chủ động kiểm tra mục "Duyệt ảnh khách gửi" thường xuyên hơn trong giai đoạn đầu để tránh nội dung rác tồn đọng.

---

## 12. Tóm tắt định hướng thiết kế (Design System nhanh)

```
Style       : Soft Elegance / Romantic Minimalism (Hero-Centric + Storytelling-Driven)
Primary     : #DB2777 (Hồng Đào)      — CTA, nhấn chính
Secondary   : #4D7C5F (Xanh Lá Sen)   — icon, viền, chi tiết
Neutral BG  : #FFFFFF / #FDF2F8       — nền chính / nền phụ
Text        : #3F2A33 (chính) / #7A6A70 (phụ)
Heading Font: Playfair Display (serif, có dấu Việt)
Body Font   : Be Vietnam Pro (sans, có dấu Việt)
Motif       : Hoa sen line-art, watermark mờ 4-8% opacity, z-index thấp nhất
Motion      : Fade + scale nhẹ, stagger 30-50ms, tôn trọng reduced-motion
Layout      : Mobile-first, ảnh full-bleed, nhiều khoảng trắng, ảnh là trọng tâm
```

---

## 13. Đối chiếu Spec với Pic-Time.com & Yêu cầu của bạn (Verification)

Đã truy cập lại pic-time.com và rà soát toàn bộ spec so với (a) trang tham khảo và (b) các yêu cầu gốc bạn đưa ra. Kết quả:

| Yêu cầu / Đặc điểm tham khảo | Đã đưa vào Spec ở đâu | Trạng thái |
|---|---|---|
| Hero full-bleed, tối giản chữ, cảm giác điện ảnh (Pic-Time) | Mục 2 (Điểm mạnh), Mục 7 (Sitemap → Trang chủ), Mục 8 (Motion Hero) | ✅ Khớp |
| Immersive gallery, bố cục linh hoạt, cuộn theo nhịp (Pic-Time) | Mục 2, Mục 7 (Album Ảnh), Mục 8 (Section reveal) | ✅ Khớp |
| Chuyển động có ý nghĩa, không lạm dụng (Pic-Time) | Mục 3 (Tránh), Mục 8 (Motion Guide) | ✅ Khớp |
| Trải nghiệm mobile mượt (Pic-Time) | Mục 10 (Responsive & Hiệu năng) | ✅ Khớp |
| Loại bỏ phần thương mại B2B không phù hợp (khác Pic-Time) | Mục 2 (Những gì KHÔNG áp dụng) | ✅ Đã loại bỏ đúng hướng |
| Nội dung 100% tiếng Việt | Mục 1, Mục 6 (font hỗ trợ dấu Việt), toàn bộ ví dụ trong spec đều viết tiếng Việt | ✅ Khớp |
| Tông màu hồng – xanh lá – trắng | Mục 4 (Bảng màu) | ✅ Khớp |
| Hình ảnh hoa sen ẩn mờ mờ | Mục 5 (Hoạ tiết Hoa Sen) | ✅ Khớp |
| Deploy công khai cho mọi người truy cập trong tương lai | **Mới bổ sung — Mục 16 (Deploy & Hosting)** | ✅ Đã bổ sung |
| Trang quản trị chỉnh sửa được ảnh **và chữ** hiển thị trên web | **Mới bổ sung — Mục 15 (Đặc tả trang Quản trị)** — bản gốc mục 11 chỉ nói "upload/sắp xếp ảnh", chưa có phần sửa chữ | ✅ Đã bổ sung, khắc phục thiếu sót |
| Dữ liệu/cài đặt lưu qua file text trong thư mục làm việc | **Mới bổ sung — Mục 14 (Kiến trúc lưu trữ dữ liệu)** | ✅ Đã bổ sung |
| Checklist để AI code tuân theo | **Mới bổ sung — Mục 17 (Checklist tổng hợp)** | ✅ Đã bổ sung |

**Kết luận đối chiếu:** Bản spec trước đó đã bám sát tinh thần Pic-Time (trải nghiệm ảnh làm trung tâm, chuyển động có chủ đích, mobile-first) và đúng các yêu cầu về màu sắc/hoạ tiết/ngôn ngữ. Ba khoảng trống được phát hiện khi đối chiếu (deploy công khai, admin sửa chữ, lưu trữ file text) đã được bổ sung ở các mục 14–17 bên dưới.

---

## 14. Kiến trúc lưu trữ dữ liệu (File-based "Database" bằng JSON)

**Quyết định:** Dùng file **JSON** (vẫn là file text thuần, mở/sửa được bằng Notepad) thay vì `.txt` chuỗi tự do — vì dữ liệu có cấu trúc (danh sách ảnh, album, lời chúc) cần key-value rõ ràng để AI code đọc/ghi chính xác, tránh lỗi parse khi dữ liệu phức tạp dần. Đây là lựa chọn bạn đã xác nhận.

### 14.1 Cấu trúc thư mục dữ liệu

```
/data/
 ├─ settings.json        # Toàn bộ nội dung chữ + cấu hình hiển thị site (xem 14.2)
 ├─ albums.json           # Danh sách album (Vu Quy, Thành Hôn, Tiệc Cưới, Pre-wedding...)
 ├─ photos.json           # Danh sách ảnh: id, tên file, thuộc album nào, thứ tự, caption, trạng thái duyệt
 ├─ wishes.json            # Lời chúc từ khách mời
 ├─ admin.json             # Mật khẩu admin (đã hash), KHÔNG bao giờ commit lên git công khai
 └─ backups/               # Bản sao lưu tự động (xem mục 16.4)

/uploads/
 ├─ originals/             # Ảnh gốc (đã nén cơ bản)
 ├─ thumbnails/             # Ảnh thu nhỏ tự sinh khi upload (dùng cho lưới gallery)
 ├─ pending/                # Ảnh khách gửi lên, chờ admin duyệt trước khi vào originals/
 └─ backgrounds/            # Ảnh nền riêng cho từng trang (không thuộc photos.json/album nào — mục 15.2)
```

### 14.2 Ví dụ schema `settings.json` (nội dung chữ admin chỉnh được)

```json
{
  "coupleNames": { "groom": "Tên Chú Rể", "bride": "Tên Cô Dâu" },
  "weddingDate": "2026-12-20",
  "heroTagline": "Câu giới thiệu ngắn hiển thị ở trang bìa",
  "welcomeMessage": "Đoạn lời ngỏ hiển thị dưới hero",
  "loveStory": [
    { "year": "2020", "title": "Lần đầu gặp gỡ", "content": "..." }
  ],
  "eventInfo": {
    "groom": {
      "ceremonyTime": "2026-12-20T09:00:00+07:00",
      "venueName": "Tên địa điểm nhà trai",
      "venueAddress": "Địa chỉ đầy đủ",
      "mapEmbedUrl": ""
    },
    "bride": {
      "ceremonyTime": "2026-12-20T14:00:00+07:00",
      "venueName": "Tên địa điểm nhà gái",
      "venueAddress": "Địa chỉ đầy đủ",
      "mapEmbedUrl": ""
    }
  },
  "footerText": "Cảm ơn đã đồng hành cùng chúng tôi",
  "pageBackgrounds": {
    "home": null,
    "album": "backgrounds/bg_album_ab12cd34ef.webp",
    "gui-anh": null,
    "loi-chuc": null,
    "thong-tin": null
  }
}
```

`pageBackgrounds` là object động, key khớp với danh sách trang khai báo ở `web/shared/pages.ts` (mục 15.2) — không thuộc `photos.json`/album nào. Giá trị `null` ở 1 trang nghĩa là trang đó đang hiện hoạ tiết hoa sen thay cho ảnh (`PageBackdrop`, mục 5).

### 14.3 Ví dụ schema `photos.json`

```json
{
  "photos": [
    {
      "id": "photo_0007",
      "filename": "originals/photo_0007.webp",
      "thumbnail": "thumbnails/photo_0007.webp",
      "albumId": "album_le-thanh-hon",
      "caption": "Khoảnh khắc trao nhẫn",
      "order": 3,
      "uploadedBy": "admin",
      "status": "published",
      "createdAt": "2026-07-10T10:00:00+07:00"
    }
  ]
}
```

### 14.4 Nguyên tắc ghi file an toàn (bắt buộc AI code tuân theo)

- **Ghi nguyên tử (atomic write):** luôn ghi ra file tạm `*.tmp` trước, sau đó `rename` đè lên file thật — tránh file JSON bị hỏng nếu server crash giữa lúc ghi.
- **Khoá ghi (write lock) đơn giản:** vì chỉ có 1–2 admin thao tác cùng lúc, dùng cơ chế lock file (`*.lock`) hoặc hàng đợi ghi tuần tự trong code — không cần hệ quản trị CSDL đầy đủ.
- **Validate trước khi ghi:** parse thử JSON sau khi build nội dung mới, nếu lỗi thì huỷ ghi và giữ nguyên file cũ.
- **ID ổn định:** mỗi ảnh/album/lời chúc có `id` dạng chuỗi cố định (không dùng index mảng làm id) để tránh lệch dữ liệu khi xoá/sắp xếp lại.
- **Không lưu thông tin nhạy cảm dạng plain text:** mật khẩu admin trong `admin.json` phải hash (bcrypt/argon2), không lưu chuỗi thô.
- **Tách dữ liệu khỏi mã nguồn:** thư mục `/data` và `/uploads` KHÔNG nằm trong Git repo công khai (thêm vào `.gitignore`), tránh lộ ảnh riêng tư/mật khẩu khi push code.
- **Quy ước ngày giờ (bổ sung khi code):** Mọi tính toán liên quan `weddingDate`/đếm ngược đều PIN CỨNG theo giờ Việt Nam (`Asia/Ho_Chi_Minh`), không dùng timezone mặc định của máy chủ/trình duyệt — tránh lỗi hydration mismatch giữa server (SSR) và client khi 2 bên chạy ở múi giờ khác nhau (đã gặp và fix thực tế khi code trang chủ). Hàm dùng chung nằm ở `web/app/utils/date.ts`.
- **Lỗi quan trọng đã gặp & fix — cookie session không tự chuyển tiếp khi SSR:** Nuxt SSR không tự động chuyển cookie của request gốc sang các lệnh gọi `$fetch` nội bộ chạy trong `useAsyncData`/middleware phía server. Hậu quả thực tế: trang admin hoạt động bình thường khi điều hướng bằng link trong app (SPA navigation), nhưng **tải lại trang (F5) hoặc mở thẳng URL sẽ bị đá về trang đăng nhập dù đã đăng nhập**, hoặc trang hiện sai "chưa có dữ liệu" dù dữ liệu tồn tại. Khắc phục: mọi nơi gọi API `/api/admin/*` bên trong `useAsyncData` hoặc route middleware (tức là code chạy được ở SSR) đều PHẢI dùng `useRequestFetch()` thay vì `$fetch` trơn. Đã áp dụng ở `app/middleware/admin-auth.ts` và toàn bộ trang trong `app/pages/admin/`. Đây là quy ước bắt buộc cho mọi trang admin thêm sau này.
- **Lỗi đã gặp & fix — `archiver@8` đổi API so với tài liệu/@types cũ:** Package `archiver` bản 8.x (bản được cài vào dự án) đã bỏ hoàn toàn API factory function cũ `archiver('zip', options)` mà `@types/archiver` và hầu hết tài liệu trên mạng còn mô tả — bản mới export class `ZipArchive` (kế thừa `Transform` stream) thay vào đó, dùng `new ZipArchive(options)`. Dùng sai API cũ gây lỗi runtime `archiver is not a function` dù build/TypeScript không báo lỗi. Wrapper đúng đã đặt ở `web/server/utils/archiverLoader.ts` (hàm `createZipArchive()`) — code khác không tự ý `import archiver from 'archiver'` theo kiểu cũ.

---

## 15. Đặc tả trang Quản trị (Admin CMS)

Yêu cầu cốt lõi: admin (2 vợ chồng) chỉnh sửa được **cả ảnh lẫn mọi nội dung chữ hiển thị trên web**, không cần sửa code.

### 15.1 Đăng nhập
- Mật khẩu chung đơn giản (đã xác nhận), lưu dạng hash trong `admin.json`.
- Có giới hạn số lần nhập sai (VD: khoá tạm 5 phút sau 5 lần sai) để chống dò mật khẩu vì site sẽ public.
- Phiên đăng nhập (session) hết hạn sau một khoảng thời gian không hoạt động.

### 15.2 Quản lý Nội dung Chữ (Content Editor) — phần MỚI theo yêu cầu
Một màn hình "Chỉnh sửa nội dung" ánh xạ trực tiếp tới `settings.json`, chia theo từng khối tương ứng với sitemap ở mục 7:

| Khối chỉnh sửa | Trường dữ liệu | Hiển thị ở |
|---|---|---|
| Trang bìa | Tên cô dâu, tên chú rể, ngày cưới, câu tagline hero | Trang chủ |
| **Ảnh nền từng trang** | **1 ảnh nền riêng cho mỗi trang công khai (xem chi tiết bên dưới)** | Cả 5 trang công khai |
| Lời ngỏ | Đoạn văn ngắn | Trang chủ |
| Câu chuyện tình yêu | Danh sách mốc thời gian (năm, tiêu đề, nội dung) — thêm/xoá/sắp xếp được | Thông tin lễ cưới |
| Thông tin lễ cưới | Giờ, địa điểm, địa chỉ, link bản đồ | Thông tin lễ cưới |
| Footer | Lời cảm ơn cuối trang | Toàn site |

#### Ảnh nền từng trang (bổ sung theo yêu cầu — thay thế "Ảnh bìa" bản trước)

Ban đầu chỉ trang chủ có ảnh bìa; nay **mỗi trang công khai có 1 ảnh nền riêng, độc lập với nhau**:

- **Danh sách trang động:** khai báo tại `web/shared/pages.ts` (dùng chung server + client, key/label/path). Content Editor **tự sinh** 1 khối upload cho mỗi phần tử trong danh sách này — thêm/bớt 1 trang trong tương lai chỉ cần sửa file này, KHÔNG cần sửa UI admin hay API. Hiện có 5 trang: Trang chủ, Album Ảnh, Gửi Ảnh, Lời Chúc, Thông Tin Lễ Cưới.
- **Chỉ upload ảnh riêng** (không có lựa chọn "chọn từ Album" nữa — đã bỏ so với thiết kế ban đầu của tính năng ảnh bìa, để tránh 1 ảnh có người vừa lên Album công khai vừa bị làm mờ 90% thành nền, và để giao diện quản lý không phình to khi nhân với 5 trang). Ảnh KHÔNG thuộc album/`photos.json` nào, KHÔNG hiện trong trang Album Ảnh công khai.
- Lưu ở `/uploads/backgrounds/` (tách biệt hoàn toàn khỏi `originals/`/`thumbnails/`/`pending/`), đặt tên file duy nhất mỗi lần upload (tránh cache nhầm ảnh cũ), tự xoá file ảnh nền cũ của đúng trang đó khi upload ảnh mới hoặc khi xoá — không tích tụ file rác.
- **Hiển thị (đã xác nhận với chủ dự án):** ảnh nền mờ nhẹ (~14% opacity) phía sau nội dung, `position: fixed` (không di chuyển khi cuộn trang), áp dụng đồng nhất cho **cả 5 trang kể cả trang chủ** — trang chủ không còn kiểu hero sáng + lớp phủ tối như bản trước.
- **Không chọn ảnh nào** → trang đó tự hiện hoạ tiết hoa sen hồng nhạt, to gần hết màn hình, bắt đầu ở dạng búp và **nở dần theo tỉ lệ cuộn trang** (component `PageBackdrop`, chi tiết mục 5/8).
- **Chỉ áp dụng cho trang công khai** — trang quản trị (`/admin/**`, layout riêng) không có `PageBackdrop`, giữ giao diện đơn giản/chức năng theo mục 15.5.
- Mỗi trường có preview trực tiếp (xem trước thay đổi trước khi lưu) để tránh sai lỗi chính tả tiếng Việt/dấu câu khi hiển thị công khai.
- Nút "Lưu thay đổi" ghi đè `settings.json` theo nguyên tắc atomic write ở mục 14.4.

### 15.3 Quản lý Ảnh (Media Manager)
- Upload nhiều ảnh cùng lúc (kéo-thả), tự sinh thumbnail khi upload.
- Gán ảnh vào album, kéo-thả sắp xếp lại thứ tự (`order` field).
- Sửa caption từng ảnh.
- Xoá ảnh (có xác nhận trước khi xoá — destructive action).
- **Duyệt ảnh khách gửi lên:** danh sách ảnh trong `pending/`, admin bấm "Duyệt" (chuyển sang `originals/`, status `published`) hoặc "Từ chối" (xoá khỏi `pending/`).
- **Lớp bảo vệ khi upload công khai (đã xác nhận):** giới hạn dung lượng mỗi ảnh (VD: 15MB) + chỉ nhận đúng định dạng ảnh (jpg/png/webp) + bắt buộc qua hàng chờ `pending/` để admin duyệt trước khi public. Captcha và rate-limit theo IP **chưa bật ở bản đầu** (đã trao đổi với chủ dự án) — vì vậy admin nên kiểm tra mục duyệt ảnh thường xuyên hơn trong giai đoạn đầu ra mắt.
- **Không còn liên quan tới ảnh nền/ảnh bìa:** tính năng chọn ảnh làm nền các trang nay hoàn toàn tách biệt, quản lý riêng ở mục 15.2 (Content Editor → "Ảnh nền từng trang") bằng cách upload ảnh riêng, KHÔNG còn chọn từ ảnh trong Album Ảnh nữa — xoá 1 ảnh trong Media Manager không còn ảnh hưởng gì tới ảnh nền của bất kỳ trang nào.

### 15.4 Quản lý Lời chúc
- Danh sách lời chúc, admin có thể ẩn/xoá lời chúc không phù hợp trước khi hiển thị công khai (kiểm duyệt nhẹ).

### 15.5 Yêu cầu UX cho Admin
- Giao diện admin có thể đơn giản/khác tông với site công khai (ưu tiên rõ ràng, chức năng hơn là thẩm mỹ), nhưng vẫn tiếng Việt 100%, dùng chung font body.
- Mọi hành động phá huỷ (xoá ảnh, từ chối ảnh khách gửi, xoá lời chúc) đều có hộp thoại xác nhận.
- Thông báo rõ ràng "Đã lưu thành công" / "Lưu thất bại, thử lại" sau mỗi thao tác ghi file.

---

## 16. Deploy & Hosting

> **CẬP NHẬT — ĐÃ DEPLOY THẬT (khác kế hoạch ban đầu bên dưới):** vì không có thẻ Visa/Mastercard quốc tế để đăng ký Oracle Cloud, dự án đã chuyển sang **Hosting cPanel của TinoHost** (thanh toán chuyển khoản/MoMo), deploy tự động qua **GitHub Actions** (build trong container `almalinux:8` để khớp glibc với server, vì server không đủ tài nguyên để tự build — xem chi tiết đầy đủ, các lỗi thật đã gặp và cách khắc phục tại **`DEPLOY.md`** ở gốc repo). Phần mô tả Oracle Cloud bên dưới giữ lại làm tài liệu tham khảo/phương án dự phòng nếu sau này đổi hosting.

**Kế hoạch ban đầu (không còn áp dụng, xem ghi chú trên):** Stack **Nuxt 3** (Vue 3, gộp frontend + API vào 1 app Node.js), deploy trên **Oracle Cloud Infrastructure (OCI) — gói "Always Free"**. Đây là lựa chọn thoả cả 2 điều kiện: (1) miễn phí thật/vĩnh viễn, (2) có ổ đĩa bền vững đúng như kiến trúc lưu file JSON + ảnh ở mục 14.

### 16.1 Vì sao KHÔNG dùng Vercel/Netlify (serverless mặc định)
Các nền tảng này chạy code dạng serverless function — hệ thống file là **tạm thời/chỉ đọc**, mọi file ghi lúc runtime sẽ **mất khi function khởi động lại**. Ảnh và JSON của bạn sẽ biến mất bất ngờ → không phù hợp với kiến trúc lưu trữ đã chọn ở mục 14. Đây là lý do loại phương án này ngay từ đầu.

### 16.2 Oracle Cloud Always Free — những điều cần biết trước khi đăng ký
- **Tài nguyên miễn phí vĩnh viễn** (không phải dùng thử có hạn): có thể chọn 1 VM ARM (Ampere A1 — tối đa 4 OCPU/24GB RAM, dư sức cho website cá nhân) hoặc 2 VM AMD nhỏ hơn (1 OCPU/1GB mỗi máy), kèm ổ đĩa Block Volume bền vững tổng cộng 200GB miễn phí — thoải mái cho ảnh cưới.
- **Cần thẻ tín dụng/ghi nợ quốc tế để đăng ký** (dùng để xác minh danh tính, Oracle cam kết không trừ tiền nếu ở trong hạn mức Always Free) — đây là rào cản phổ biến nhất, cần chuẩn bị trước.
- **Rủi ro cần biết:** một số người dùng phản ánh tài khoản Always Free bị Oracle tạm khoá/thu hồi nếu hệ thống nghi ngờ gian lận hoặc tài khoản không hoạt động lâu — nên: (a) dùng thông tin đăng ký thật, (b) không để server "chết" quá lâu, (c) **luôn có bản backup tải về nơi khác** (mục 16.5) để không mất trắng dữ liệu nếu tài khoản gặp sự cố.
- **Phương án dự phòng nếu đăng ký Oracle không thành công:** chuyển sang VPS giá rẻ trả phí (~$4–6/tháng, VD DigitalOcean/Vultr/Vietnix) — kiến trúc code không cần đổi gì, chỉ đổi nơi deploy.

### 16.3 Các bước triển khai ở tầng hạ tầng (thực hiện khi tới lúc deploy thật, không phải bây giờ)
1. Đăng ký tài khoản Oracle Cloud, tạo instance Always Free (khuyến nghị chọn Ampere A1 nếu khu vực còn slot — hay hết chỗ, có thể cần thử lại vài lần hoặc đổi region).
2. Cài Node.js + PM2 (giữ app Nuxt chạy nền, tự khởi động lại nếu crash) trên VM.
3. Cài **Caddy** làm reverse proxy — tự động cấp HTTPS miễn phí (Let's Encrypt) chỉ với vài dòng cấu hình, đơn giản hơn Nginx cho người mới.
4. Mở port 80/443 trên Oracle Cloud Security List (mặc định Oracle chặn hết, phải tự mở — điểm dễ bị quên nhất khi mới dùng OCI).
5. Trỏ domain riêng (nếu có) về IP tĩnh của VM.

### 16.4 Thiết kế "thuận tiện cho việc deploy" ngay từ khi code (áp dụng ngay hôm nay)
- **Tách cấu hình khỏi code:** đường dẫn thư mục `/data`, `/uploads`, cổng chạy server... đọc từ biến môi trường (`.env`), không hard-code — để dễ đổi khi chuyển server (kể cả khi phải chuyển từ Oracle sang VPS trả phí dự phòng).
- **Đường dẫn tương đối, không phụ thuộc hệ điều hành:** vì đang code trên Windows nhưng deploy lên Linux (Oracle VM chạy Linux) — dùng thư viện path chuẩn của Node.js (không hard-code dấu `\`).
- **Chỉ mục công cụ tìm kiếm:** vì đây là album riêng tư, thêm thẻ `noindex` hoặc bảo vệ bằng mật khẩu xem (khác với mật khẩu admin) nếu không muốn Google index — quyết định này cần xác nhận thêm khi triển khai thật.
- **Giới hạn tài nguyên:** giới hạn dung lượng upload mỗi ảnh (VD: 15MB) và cảnh báo sớm khi ổ đĩa gần đầy (dù Always Free có 200GB, ảnh khách gửi công khai không kiểm soát dung lượng tổng có thể tích luỹ nhanh).

### 16.5 Sao lưu (Backup) — đặc biệt quan trọng với hosting miễn phí
Vì tài khoản Always Free có rủi ro bị thu hồi (mục 16.2), backup **không được lưu trên cùng VM**:
- Cron job chạy định kỳ (VD: mỗi ngày) nén `/data` + `/uploads` thành file zip có timestamp.
- Bản zip phải được đẩy ra **ngoài VM** — VD: Google Drive cá nhân qua rclone, hoặc gửi về email — vì nếu Oracle thu hồi tài khoản, backup nằm trong `/data/backups/` trên cùng VM sẽ mất theo.
- Giữ tối đa N bản backup gần nhất (VD: 14 ngày) để không phình dung lượng.

---

## 17. Checklist tổng hợp — dùng cho AI Code khi triển khai

> Mục đích: đây là danh sách kiểm tra bắt buộc mà AI/lập trình viên phải rà lại **trước khi báo cáo hoàn thành** bất kỳ phần nào của website. Đánh dấu ✅ từng mục khi đã làm đúng, không tự ý bỏ qua mục nào mà không xác nhận với chủ dự án.

### 17.1 Checklist Thiết kế & Giao diện
- [ ] Màu sắc dùng đúng bảng ở mục 4 (không tự thêm màu ngoài palette trừ semantic success/error).
- [ ] Không đặt hồng và xanh lá cạnh nhau tỷ lệ 50/50 trên cùng một khối.
- [ ] Font heading và body đúng như mục 6, có load subset tiếng Việt.
- [ ] Hoạ tiết hoa sen chỉ ở lớp nền (opacity 4–8%, z-index thấp nhất), không che nội dung.
- [ ] Không dùng emoji làm icon — icon là SVG line-art.
- [ ] Ảnh luôn là trọng tâm — UI/chrome mỏng, nhiều khoảng trắng.

### 17.2 Checklist Nội dung Tiếng Việt
- [ ] Toàn bộ text hiển thị (nút, nhãn, thông báo lỗi, meta title/description, alt ảnh) đều bằng tiếng Việt có dấu đầy đủ.
- [ ] Không còn placeholder tiếng Anh còn sót lại (Lorem ipsum, "Submit", "Loading"...).
- [ ] Kiểm tra font render đúng dấu tiếng Việt trên cả heading và body, không bị vỡ/dính dấu.

### 17.3 Checklist Accessibility
- [ ] Tương phản chữ/nền đạt tối thiểu 4.5:1 cho text thường.
- [ ] Mọi nút icon-only có `aria-label` tiếng Việt.
- [ ] Vùng chạm tối thiểu 44×44px trên mobile.
- [ ] Không disable zoom trên viewport meta.
- [ ] Form validate on-blur, thông báo lỗi nêu rõ nguyên nhân + cách sửa bằng tiếng Việt.
- [ ] Tôn trọng `prefers-reduced-motion`.

### 17.4 Checklist Hiệu năng & Responsive
- [ ] Ảnh dùng WebP/AVIF + responsive srcset + lazy-load dưới màn hình đầu.
- [ ] Khai báo width/height hoặc aspect-ratio cho mọi ảnh (chống CLS).
- [ ] Test đủ breakpoint 375/768/1024/1440px, không có horizontal scroll.
- [ ] Trang chủ (hero) tải nhanh — ảnh hero được tối ưu riêng, không chờ toàn bộ gallery load xong.

### 17.5 Checklist Lưu trữ Dữ liệu (JSON file-based)
- [ ] Ghi file theo nguyên tắc atomic write (ghi `.tmp` rồi rename) — không ghi trực tiếp đè lên file gốc.
- [ ] Có validate JSON hợp lệ trước khi ghi đè, ghi thất bại thì giữ nguyên file cũ.
- [ ] `id` của ảnh/album/lời chúc là chuỗi cố định, không dùng index mảng.
- [ ] `admin.json` chỉ lưu mật khẩu dạng hash, không lưu plain text.
- [ ] `/data` và `/uploads` nằm trong `.gitignore`, không commit lên git công khai.
- [ ] Có cơ chế backup tự động theo mục 16.4.

### 17.6 Checklist Trang Quản trị (Admin)
- [ ] Đăng nhập bằng mật khẩu chung, có giới hạn số lần nhập sai.
- [ ] Có màn hình sửa MỌI nội dung chữ liệt kê ở mục 15.2, lưu đúng vào `settings.json`.
- [ ] Mục "Ảnh nền từng trang" tự sinh đúng số khối theo `shared/pages.ts` — thêm/bớt trang trong file đó phải tự phản ánh ở UI mà không cần sửa code UI.
- [ ] Media Manager cho phép upload, sắp xếp, đổi caption, xoá ảnh (KHÔNG liên quan gì tới ảnh nền các trang — 2 hệ thống tách biệt hoàn toàn).
- [ ] Có luồng duyệt/từ chối ảnh khách gửi lên (nếu bật tính năng upload công khai).
- [ ] Mọi hành động xoá/từ chối đều có hộp thoại xác nhận trước khi thực thi.
- [ ] Có thông báo rõ ràng "Lưu thành công" / "Lưu thất bại" sau mỗi thao tác ghi dữ liệu.

### 17.7 Checklist Deploy
- [ ] Cấu hình đường dẫn/cổng đọc từ biến môi trường (`.env`), không hard-code.
- [ ] Đường dẫn file dùng thư viện path chuẩn của Node.js, không hard-code dấu `\` của Windows (vì deploy lên Linux/Oracle Cloud).
- [ ] Đã mở port 80/443 trên Oracle Cloud Security List (mặc định bị chặn — dễ bị quên).
- [ ] HTTPS được bật qua Caddy (Let's Encrypt tự động).
- [ ] Giới hạn dung lượng upload mỗi ảnh, có cảnh báo khi ổ đĩa gần đầy.
- [ ] Backup tự động đã chạy thử ít nhất 1 lần thành công **và đã xác minh đẩy được ra ngoài VM** (Google Drive/email) trước khi công bố site cho khách mời — không lưu backup trên cùng VM vì tài khoản Always Free có rủi ro bị thu hồi (mục 16.2).

---

## 18. Nâng cấp lớn đợt 2 — Responsive, Album, Lời chúc, Câu chuyện tình yêu, Ẩn/hiện trang

Đợt nâng cấp toàn diện theo yêu cầu của chủ dự án, triển khai theo đúng thứ tự phụ thuộc kỹ thuật (không phải thứ tự liệt kê gốc): responsive trước (nền tảng), rồi Album/Lời chúc/Câu chuyện tình yêu (nội dung), rồi Admin (công cụ quản lý các nội dung đó), rồi tính năng ẩn/hiện trang, cuối cùng đổi thứ tự tên (thay đổi hiển thị xuyên suốt, làm sau để không phải sửa lại nhiều nơi).

### 18.1 Responsive toàn site
- **`LotusScene.vue`**: kích thước hoa/lá trước đây tính thẳng bằng `rem` cố định (lá to nhất `27rem`≈432px) — trên mobile 375px, 1 chiếc lá đã rộng hơn cả màn hình, bị lớp `overflow-hidden` cha cắt xén thô (không tạo thanh cuộn ngang vì nằm trong `fixed`, nhưng vẫn là lỗi thị giác thật — xác nhận bằng đo `getBoundingClientRect()`). Khắc phục: hàm `clampSize(remMultiplier, vwMultiplier)` trả về CSS `min(REMrem, VWvw)` — màn hẹp thì `vw` nhỏ hơn nên áp dụng (tự thu nhỏ theo tỉ lệ), màn rộng thì `rem` nhỏ hơn nên giữ đúng kích thước gốc.
- **`main.css`**: thêm `overflow-x: hidden` cho `html` (an toàn tuyệt đối chống thanh cuộn ngang ngoài ý muốn). **Lỗi thật đã gặp & fix**: bản đầu dùng `overflow-x: clip` — khi trục còn lại (`overflow-y`) vẫn là `visible`, một số engine không áp dụng đúng quy tắc "trục kia tự chuyển sang `auto`", khiến CẢ TRANG MẤT KHẢ NĂNG CUỘN DỌC. Đổi sang `hidden` (chuẩn, được hỗ trợ đúng ở mọi trình duyệt) khắc phục hoàn toàn. **Lỗi thật thứ 2 liên quan**: từng đặt `overflow-x: hidden` ở CẢ `html` LẪN `body` — khi cả 2 cùng có overflow non-visible, `body` tự trở thành 1 scroll container RIÊNG tách khỏi `window`, khiến `window.scrollTo`/cuộn chuột không còn tác dụng lên viewport thật. Chỉ đặt ở `html`, không lặp lại ở `body`.
- Toàn bộ 5 trang public + trang admin đã verify bằng đo `document.documentElement.scrollWidth === window.innerWidth` thực tế ở 375×812 / 768×1024 / 1280×800 — không còn tràn ngang ở đâu.

### 18.2 Album ảnh — masonry cân bằng thật + phân trang
- **`useMasonryColumns.ts`** (composable mới): thay CSS `columns-*` (phân bổ theo THỨ TỰ ĐỌC, không theo chiều cao thực tế → để lại khoảng trống lớn ở cột cuối khi ảnh tỉ lệ chênh lệch) bằng thuật toán **greedy shortest-column**: mỗi ảnh được đẩy vào cột đang thấp nhất, ước lượng chiều cao từ tỉ lệ `height/width` gốc (đã có sẵn trong `Photo`, không cần gọi thêm API). Đã verify thực tế: 4 cột ở desktop cao **bằng nhau tuyệt đối** (844.3125px mỗi cột).
- **Số cột theo breakpoint**: `useColumnCount()` — 2 (mobile) / 3 (`sm`) / 4 (`lg`), qua `window.matchMedia`.
- **Phân trang client-side**: `PAGE_SIZE = 24`, cắt từ `filteredPhotos` bằng `computed`. Quyết định KHÔNG đổi API `photos.get.ts` — toàn bộ ảnh published vốn đã fetch 1 lần (metadata nhẹ, không phải file ảnh), đổi sang phân trang server sẽ tốn round-trip mỗi lần đổi trang mà lợi ích không đáng kể ở quy mô ảnh cưới cá nhân.
- **`PhotoPager.vue`** (component mới): nút Prev/Next + "Trang X/Y", tự ẩn nếu ≤1 trang, style tái dùng `.btn-outline`.
- Lightbox (`PhotoLightbox`) giờ thao tác trên `pagedPhotos` (ảnh trong TRANG hiện tại) thay vì toàn bộ `filteredPhotos`, để next/prev không nhảy xuyên trang gây khó hiểu.

### 18.3 Lời chúc — grid card + popup
- Đổi từ `<ul class="flex flex-col gap-6">` (list dọc, mỗi lời chúc chiếm nhiều chỗ) sang grid card vuông `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`: ảnh đại diện (`aspect-square`, fallback icon `LotusMotif` nếu không có ảnh) + tên + nội dung rút gọn `line-clamp-3`.
- **`WishModal.vue`** (component mới): popup xem toàn bộ nội dung khi bấm vào card, `Teleport to="body"`, đóng bằng Escape/click nền/nút X.
- **`useFocusTrap.ts`** (composable mới): tách logic bẫy focus + Escape + khoá cuộn nền từ `PhotoLightbox.vue` (vốn viết riêng) thành composable dùng chung cho cả `WishModal`, `PageBackgroundEditModal`, `LoveStoryEditModal` — tránh lặp code bẫy focus ở 4 nơi khác nhau.

### 18.4 Di chuyển "Câu Chuyện Của Chúng Tôi" sang Trang chủ
- **`LoveStorySection.vue`** (component mới): trích nguyên khối timeline từ `thong-tin.vue` (giữ nguyên `v-reveal`, badge năm, `LotusMotif` phân cách), gắn vào `index.vue` ngay dưới CTA "Xem Album Ảnh". `thong-tin.vue` chỉ còn phần "Thông tin lễ cưới".
- Bổ sung: mỗi mốc nếu có ảnh (`milestone.photos`) hiện 1 dải thumbnail ngang (`flex gap-2 overflow-x-auto`), bấm vào mở `PhotoLightbox` DÙNG CHUNG (không viết lightbox riêng).
- `PhotoLightbox.vue` đổi prop type từ `Photo[]` sang **`LightboxPhoto`** (interface mới, tối thiểu `id/filename/width/height/caption?`) — dùng chung được cho cả ảnh Album lẫn ảnh mốc thời gian. Thêm prop `showDownload` (mặc định `true`) vì ảnh mốc thời gian không có endpoint tải riêng như ảnh Album.

### 18.5 Tối ưu Admin — `noi-dung.vue`
- **Nút Lưu sticky**: `class="sticky bottom-4 z-10 ..."` — luôn nhìn thấy khi cuộn form dài 400+ dòng, không cần kéo xuống cuối.
- **"Ảnh nền từng trang"** rút gọn từ khối lớn/trang (~69 dòng) thành 1 dòng/trang (thumbnail nhỏ + tên + trạng thái), bấm mở **`PageBackgroundEditModal.vue`** (component mới, ở `components/admin/`) — popup chứa preview lớn, nút tải/đổi/xoá (logic cũ chuyển nguyên vào modal) **+ gộp luôn công tắc ẩn/hiện trang** (mục 18.7) để tránh phình thêm 1 khu vực UI riêng.
- **"Câu chuyện tình yêu"** rút gọn tương tự thành list (thumbnail ảnh đầu + năm + tiêu đề rút gọn + nút lên/xuống/xoá), bấm mở **`LoveStoryEditModal.vue`** (component mới) — xem mục 18.6.

### 18.6 Câu chuyện tình yêu — nhiều ảnh/mốc
- **Schema**: `LoveStoryMilestone` thêm field `photos: LightboxPhoto[]` (dữ liệu cũ không có field này → mọi nơi đọc PHẢI fallback `?? []`, đã áp dụng ở `LoveStorySection.vue` và `settings.put.ts`).
- **API mới**: `POST /api/admin/love-story-photo` (nhận NHIỀU file cùng lúc qua field `files`, nén `webp quality 85, max-width 1600`, lưu `uploads/love-story/`, trả `LightboxPhoto[]`, KHÔNG ghi `settings.json` — gắn vào đúng mốc + lưu thật vẫn qua `PUT /api/settings` khi bấm "Lưu thay đổi", giữ nguyên tắc "1 chỗ ghi settings.json duy nhất"); `DELETE /api/admin/love-story-photo/:id` (xoá file vật lý).
- **`LoveStoryEditModal.vue`**: 3 input year/title/content + upload nhiều ảnh (`<input type="file" multiple>`) + preview grid 4 cột + nút xoá từng ảnh (gọi API xoá + splice mảng cục bộ ngay, không cần đợi lưu form mới dọn file rác).
- Đã verify full-cycle: upload → lưu → F5 → dữ liệu còn nguyên trong `settings.json`; xoá ảnh → xác nhận file vật lý trong `uploads/love-story/` cũng bị xoá theo (không chỉ biến mất khỏi UI).

### 18.7 Ẩn/Hiện từng trang
- **Schema**: `Settings.hiddenPages: string[]` (mảng key trang đang ẩn, mặc định `[]`). `settings.put.ts` lọc chỉ giữ key hợp lệ + KHÔNG BAO GIỜ cho `'home'` lọt vào (Trang chủ bắt buộc luôn hiện — quyết định đã chốt với chủ dự án, không có công tắc cho Trang chủ).
- **`shared/pages.ts`**: thêm `isHideablePageKey(key)` = `isManagedPageKey(key) && key !== 'home'`.
- **`layouts/default.vue`**: `navLinks` đổi từ mảng hard-code RIÊNG BIỆT (từng lệch khỏi `MANAGED_PAGES` dùng cho ảnh nền) sang `computed` sinh từ `MANAGED_PAGES`, lọc theo `hiddenPages` — hợp nhất 2 nguồn dữ liệu trang trùng lặp, tự cập nhật ngay khi admin đổi (settings reactive, không cần F5).
- **`middleware/page-visibility.ts`** (named middleware mới, KHÔNG phải global — chỉ gắn cho 4 trang public ngoài Trang chủ qua `definePageMeta({ middleware: 'page-visibility' })`): đọc `useSiteSettings()`, nếu `pageKeyFromPath(to.path)` nằm trong `hiddenPages` → `navigateTo('/')`. Verify: redirect hoạt động cả khi F5 trực tiếp vào URL đã ẩn (SSR), không chỉ khi điều hướng SPA.
- Toggle UI gộp vào `PageBackgroundEditModal.vue` (mục 18.5) — không tạo màn hình admin riêng.

### 18.8 Đổi thứ tự tên hiển thị (chú rể trước, cô dâu sau)
- CHỈ đổi thứ tự HIỂN THỊ trong template (`index.vue` hero, `layouts/default.vue` wordmark header, preview + form trong `admin/noi-dung.vue`) — field `bride`/`groom` trong `types.ts`/`data/settings.json` GIỮ NGUYÊN tên, không migrate dữ liệu (tránh việc không cần thiết, đây thuần là vấn đề trình bày).
- Đã grep lại toàn repo sau khi sửa để xác nhận không sót chỗ nào còn hiển thị thứ tự cũ.

### 18.9 Component/route mới tổng hợp (đợt nâng cấp này)
`useMasonryColumns.ts`, `PhotoPager.vue`, `useFocusTrap.ts`, `WishModal.vue`, `LoveStorySection.vue`, `admin/PageBackgroundEditModal.vue`, `admin/LoveStoryEditModal.vue`, `middleware/page-visibility.ts`, API `admin/love-story-photo.post.ts` + `admin/love-story-photo/[id].delete.ts`.

## 19. Nâng cấp lớn đợt 3 — Thông tin 2 nhà, popup Lời chúc, hoạt ảnh Album, nền hoa sen sống động hơn

### 19.1 Thông tin lễ cưới tách 2 nhà (nhà trai / nhà gái)
- **Schema** (`server/utils/types.ts`): `EventInfoBlock { ceremonyTime, venueName, venueAddress, mapEmbedUrl }`; `Settings.eventInfo` đổi từ 1 khối duy nhất thành `{ groom: EventInfoBlock; bride: EventInfoBlock }` — nhà trai luôn hiển thị TRƯỚC, nhà gái SAU (đã chốt với chủ dự án).
- **Migrate dữ liệu cũ tự động khi đọc** (`server/utils/store.ts`, hàm `migrateSettings`): dữ liệu `settings.json` cũ (trước khi tách 2 nhà) có `eventInfo` là 1 khối phẳng `{ceremonyTime, venueName, ...}` — khi đọc thấy khối đó CHƯA có `groom`/`bride`, tự động gán nguyên trạng thành thông tin **nhà trai**, để trống nhà gái (quyết định đã xác nhận với chủ dự án, giữ nguyên dữ liệu đã nhập trước đó thay vì xoá). Migrate chạy ở cả `settingsStore.read()` và `settingsStore.update()`, không cần chạy script migrate riêng trên production — lần ghi tiếp theo tự lưu đúng schema mới.
- `settings.put.ts`: validate/sanitize riêng từng khối `groom`/`bride` qua `sanitizeEventInfoBlock()` (tái dùng logic trích link nhúng Google Maps từ `<iframe>` đã có).
- `admin/noi-dung.vue`: 2 fieldset riêng biệt "Thông tin lễ cưới — Nhà trai" / "— Nhà gái" (2 computed `groomCeremonyLocal`/`brideCeremonyLocal` cho input `datetime-local`), đặt nối tiếp nhau, nhà trai trước.
- `thong-tin.vue`: hiển thị dạng `grid sm:grid-cols-2` (1 cột trên mobile, 2 cột desktop), mỗi nhà 1 card riêng có nhãn "Nhà Trai"/"Nhà Gái"; nhà nào chưa nhập gì (`hasContent()` false) thì ẨN HẲN card đó thay vì hiện khối rỗng gây rối mắt.

### 19.2 Popup gửi lời chúc + hiệu ứng thẻ hiển thị
- Form gửi lời chúc (tên, nội dung, ảnh đính kèm — giữ NGUYÊN field/logic) tách khỏi luồng chính của trang, chuyển vào `components/WishSubmitModal.vue` — Teleport to body, dùng lại `useFocusTrap` (như `WishModal.vue` xem chi tiết), có `Transition` fade + trượt nhẹ khi mở/đóng. Trang `loi-chuc.vue` giờ chỉ còn 1 nút "Gửi Lời Chúc" mở popup này; state `isSubmitModalOpen` + banner "Cảm ơn..." giữ nguyên hành vi cũ (hiện sau khi gửi thành công, đóng popup).
- Thẻ lời chúc trong lưới hiển thị: thêm hiệu ứng hover nhẹ (nâng nhẹ `-translate-y-1`, đổ bóng, ảnh zoom nhẹ `scale-110`, icon hoa sen xoay nhẹ khi không có ảnh) — tất cả tắt dưới `prefers-reduced-motion`.

### 19.3 Album ảnh — hoạt ảnh chuyển trang + hover
- Lưới masonry bọc trong `<Transition name="page-swap" mode="out-in">` khoá theo `page` — đổi trang phân trang fade + trượt nhẹ (10px) thay vì đổi tức thì.
- Hover ảnh: đổi từ `hover:scale-[1.03]` đơn giản sang `group-hover:scale-110` (500ms) kèm `hover:shadow-xl` trên nút bọc ảnh — rõ ràng hơn, vẫn mượt.

### 19.4 Nền hoa sen sống động hơn (`LotusScene.vue`, `LotusDragonfly.vue`, `LotusBird.vue` mới, `WaterRipple.vue`, `FallingPetal.vue` mới)
- **Hoa to hơn**: hằng số `FLOWER_SCALE = 1.18` nhân vào mọi phép tính kích thước hoa (side + top) và lá đi kèm trong `clampSize(...)` — không đổi vị trí/bố cục, chỉ tăng kích thước đều toàn bộ.
- **Chuồn chuồn**: tăng từ 3 lên 5 con, kích thước lớn hơn (`clampSize(d.size*6, d.size*7.8)` thay vì `*5/*6.5`). `LotusDragonfly.vue` vẽ lại lần 3: 2 điểm neo cánh trước/sau tách biệt dọc thân (đúng silhouette hình X đặc trưng), đầu to + 2 mắt kép gần chạm nhau. Bổ sung **đập cánh**: mỗi cánh có 1 `<g>` lồng bên trong (không phải `<g>` định vị có sẵn — tránh CSS animation ghi đè mất transform định vị) animate `scaleY` co lại giữa chu kỳ 0.22s, tắt dưới `prefers-reduced-motion`.
- **Chim bay mới** (`LotusBird.vue`): line-art cùng phong cách, thân/đầu/mỏ/đuôi rõ, 2 cánh đập bằng `rotate` quanh điểm vai (khác cơ chế `scaleY` của chuồn chuồn — cánh chim đập là động tác xoay, không phải rung màng cánh), chu kỳ 0.42s. 3 con, kích thước lớn hơn hẳn chuồn chuồn để phân biệt.
- **Đậu trên hoa** (cả chuồn chuồn lẫn chim): không dùng JS/state machine — 1 vài con dùng `flyPattern` kiểu `land-*` có keyframe CSS bay lượn rồi quay về ĐÚNG `translate(0,0)` (vị trí neo) và GIỮ NGUYÊN vài % chu kỳ trước khi lặp lại; neo (`left`/`top`) của những con này đặt TRÙNG toạ độ 1 bông hoa có sẵn trong mảng `flowers`/cây hoa trong scene → đoạn giữ nguyên đó nhìn như đang đậu trên đúng bông hoa đó. Cánh vẫn tiếp tục đập nhẹ lúc "đậu" (đơn giản hoá có chủ đích, chấp nhận được vì côn trùng/chim thật cũng hay khẽ rung cánh lúc đậu).
- **Mặt nước rõ hơn**: tăng `stroke-opacity` toàn bộ 5 lớp gợn sóng trong `WaterRipple.vue` (khoảng +30-50% so với trước), bỏ `overflow-hidden` ở div gốc (không cần nữa vì các lớp ancestor `LotusScene`/`PageBackdrop` đã clip sẵn) để cánh hoa rơi có thể rơi từ phía trên dải nước xuống mà không bị cắt cụt.
- **Lá/cánh hoa rơi tạo gợn sóng lõm tõm** (`FallingPetal.vue` mới, 4 instance trong `WaterRipple.vue`): wrapper neo CỐ ĐỊNH đúng điểm rơi trúng mặt nước; bên trong 2 phần tử con cùng `animation-duration`/`animation-delay` (đồng bộ nhịp) nhưng animate độc lập — (1) cánh hoa rơi từ phía trên xuống đúng điểm neo rồi biến mất (`petal-fall`), (2) vòng tròn gợn sóng nằm im vô hình, chỉ phóng to + mờ dần đúng lúc cánh hoa chạm tới cuối chu kỳ (`petal-splash`).

### 19.5 Component mới tổng hợp (đợt nâng cấp này)
`WishSubmitModal.vue`, `LotusBird.vue`, `FallingPetal.vue`.

---

*Tài liệu này là bước phân tích & định hướng thiết kế, đã chốt đầy đủ: stack **Nuxt 3**, hosting **Oracle Cloud Always Free**, upload công khai **mở từ đầu** với lớp bảo vệ bắt buộc (giới hạn file + admin duyệt, chưa bật captcha/rate-limit). Sẵn sàng chuyển sang bước dựng code theo design system (mục 1–12) và checklist (mục 17). Việc còn treo lại, chỉ cần xác nhận khi tới lúc deploy thật (không chặn việc bắt đầu code): (1) có gắn tên miền riêng hay dùng IP/subdomain tạm, (2) có bật `noindex`/mật khẩu xem công khai hay để site mở hoàn toàn.*
