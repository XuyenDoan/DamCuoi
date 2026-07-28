<script setup lang="ts">
/**
 * Nền "màu nước ao sen" cho theme "Sen Màu Nước" (spec.md mục 39) — thay
 * `LotusScene` (line-art) khi theme này đang bật, dùng trong
 * `PageBackdrop.vue` (nền cố định `position: fixed`, phủ toàn site, không
 * riêng trang chủ). Kỹ thuật mảng màu mờ chồng lớp — cùng gốc với
 * `.aurora-blob` (theme Kính Mờ Ánh Sáng) nhưng TÔNG MÀU PHẤN DỊU (lam
 * nhạt/lavender/vàng bơ/xanh lá/hồng — lấy đúng từ 3 tranh màu nước tham
 * khảo) thay vì màu rực, và CHUYỂN ĐỘNG CHẬM HƠN NHIỀU (28–42s/chu kỳ so
 * với 16–22s của aurora) — nền này hiện ở MỌI TRANG, MỌI LÚC (không chỉ 1
 * hero), phải đủ tĩnh lặng để không gây xao nhãng khi đọc nội dung dài.
 *
 * QUAN TRỌNG — độ đục 22% mỗi mảng KHÔNG PHẢI số tuỳ ý: đã đo bằng công
 * thức tương phản WCAG thật (Python, `blend = alpha*wash + (1-alpha)*bg`)
 * cho kịch bản XẤU NHẤT — chữ `--color-text-muted`/`--color-primary`/
 * `--color-secondary`/`--color-gold` (4 màu ban đầu chỉ VỪA ĐỦ AAA trên nền
 * phẳng `--color-bg`) rơi đúng ngay tâm 1 mảng màu nước đậm nhất. Ở 22%,
 * kết quả xấu nhất đo được là 7.15:1 (vẫn ≥7:1 AAA) — thử ở độ đục cao hơn
 * (30–35%) từng khiến `--color-text-muted` tụt xuống ~6:1 (KHÔNG đạt AAA).
 * Không tự ý tăng opacity các mảng bên dưới nếu chưa đo lại bằng đúng công
 * thức này.
 */
</script>

<template>
  <div class="watercolor-wash" aria-hidden="true">
    <div class="wash-blob w-blue" />
    <div class="wash-blob w-lavender" />
    <div class="wash-blob w-yellow" />
    <div class="wash-blob w-sage" />
    <div class="wash-blob w-pink" />
  </div>
</template>

<style scoped>
.watercolor-wash {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--color-bg);
  overflow: hidden;
}
.wash-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.22;
  will-change: transform;
}
.w-blue {
  width: 42vw;
  height: 42vw;
  max-width: 560px;
  max-height: 560px;
  left: -8%;
  top: -6%;
  background: var(--wash-blue);
  animation: wash-a 34s ease-in-out infinite;
}
.w-lavender {
  width: 38vw;
  height: 38vw;
  max-width: 500px;
  max-height: 500px;
  right: -6%;
  top: 4%;
  background: var(--wash-lavender);
  animation: wash-b 40s ease-in-out infinite;
}
.w-yellow {
  width: 36vw;
  height: 36vw;
  max-width: 480px;
  max-height: 480px;
  left: 18%;
  top: 30%;
  background: var(--wash-yellow);
  animation: wash-c 36s ease-in-out infinite;
}
.w-sage {
  width: 40vw;
  height: 40vw;
  max-width: 520px;
  max-height: 520px;
  left: -4%;
  bottom: -10%;
  background: var(--wash-sage);
  animation: wash-a 42s ease-in-out infinite reverse;
}
.w-pink {
  width: 34vw;
  height: 34vw;
  max-width: 440px;
  max-height: 440px;
  right: 6%;
  bottom: -8%;
  background: var(--wash-pink);
  animation: wash-b 30s ease-in-out infinite reverse;
}
@keyframes wash-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(3%, 4%) scale(1.08); }
}
@keyframes wash-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-4%, 3%) scale(0.94); }
}
@keyframes wash-c {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(2%, -3%) scale(1.05); }
}
</style>
