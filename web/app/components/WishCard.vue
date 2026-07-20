<script setup lang="ts">
import type { Wish } from '../../server/utils/types'

/**
 * Thẻ 1 lời chúc trong lưới masonry ở `loi-chuc.vue` (rà soát UI theo yêu
 * cầu chủ dự án):
 * - KHÔNG còn ảnh mặc định (LotusMotif) cho lời chúc không có ảnh đính kèm
 *   — chỉ hiện nội dung, không có khối ảnh nào cả (trước đây luôn có khối
 *   ảnh vuông chiếm phần lớn thẻ dù không có ảnh thật).
 * - Ảnh đính kèm (nếu có) hiển thị ĐÚNG TỈ LỆ GỐC, không ép khung cố định
 *   (`h-36`/`aspect-square`/`object-cover` như trước — luôn CẮT MẤT 1 phần
 *   ảnh để lấp đầy khung). Yêu cầu chủ dự án: "giữ tỉ lệ ảnh, chỉ thu nhỏ
 *   thôi" — đúng chuẩn các trang testimonial/photo-wall cao cấp (Pinterest,
 *   Senja Wall of Love...) vì đây là ảnh cá nhân/tình cảm của khách mời,
 *   cắt mất góc ảnh (mặt người...) là trải nghiệm tệ. Dùng `w-full h-auto`
 *   (không `object-fit`) + truyền `width`/`height` gốc (lưu lúc upload ở
 *   `server/api/wishes.post.ts`) vào thẻ `<img>` để trình duyệt biết trước
 *   tỉ lệ, tránh giật layout (CLS) trong lúc ảnh đang tải.
 * - Nội dung dài quá 6 dòng tự cắt (`line-clamp-6`, trình duyệt tự thêm
 *   "…") — bấm vào thẻ mở `WishModal` xem đầy đủ, không đổi hành vi cũ.
 *   QUAN TRỌNG (bug thật đã gặp & fix): `line-clamp` chỉ cắt được SAU KHI
 *   nội dung đã xuống dòng — nếu nội dung là 1 chuỗi liền không có khoảng
 *   trắng (VD gõ lặp ký tự không dấu cách, link dài...), trình duyệt mặc
 *   định KHÔNG tự ngắt giữa từ nên toàn bộ tràn ra thành 1 dòng dài, khiến
 *   `line-clamp` không có gì để cắt (hiển thị tràn hết ra ngoài thay vì bị
 *   giới hạn 6 dòng). Đã thêm `break-words` (CSS `overflow-wrap: break-word`)
 *   để buộc ngắt xuống dòng khi gặp chuỗi không có điểm ngắt tự nhiên, đảm
 *   bảo `line-clamp` luôn hoạt động đúng với MỌI loại nội dung.
 * - Thẻ không có ảnh: thêm dấu ngoặc kép lớn mờ ở góc (thay cho khối ảnh
 *   trống) — gợi ý thiết kế "testimonial card" của các trang cao cấp, để
 *   thẻ không-ảnh vẫn có điểm nhấn thị giác thay vì chỉ là 1 khối chữ trơn.
 *
 * QUAN TRỌNG (phản hồi thật: "nhiều lời chúc nằm sát nhau khó phân biệt,
 * đề xuất viền dày/đổi màu"): viền dày hoặc đổi màu viền RIÊNG cho từng
 * thẻ dễ gây rối mắt khi cả trăm thẻ xếp cạnh nhau (không phải hướng các
 * UI cao cấp hay chọn — dễ nhìn "loè loẹt"). Thay bằng kỹ thuật phổ biến
 * hơn ở UI cao cấp (Stripe, Notion, Material Design): TÁCH BIỆT BẰNG ĐỘ
 * NỔI (elevation) — bóng đổ nhẹ THƯỜNG TRỰC (`shadow-sm`, trước đây chỉ có
 * lúc hover) khiến mỗi thẻ trông như đang "nổi" tách khỏi nền và tách khỏi
 * thẻ liền kề, tinh tế hơn hẳn việc tô viền đậm/màu sặc sỡ.
 */
defineProps<{ wish: Wish }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="focus-ring wish-card group flex w-full flex-col overflow-hidden rounded-xl border border-secondary-light/40 bg-bg text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg active:scale-[0.98]"
    @click="$emit('click')"
  >
    <div v-if="wish.photo" class="w-full shrink-0 bg-surface">
      <img
        :src="`/uploads/${wish.photo}`"
        :width="wish.width ?? undefined"
        :height="wish.height ?? undefined"
        alt="Ảnh đính kèm lời chúc"
        loading="lazy"
        class="h-auto w-full transition-transform duration-200 ease-out group-hover:scale-[1.03]"
      />
    </div>

    <div class="relative flex flex-1 flex-col gap-1.5 p-4">
      <span
        v-if="!wish.photo"
        aria-hidden="true"
        class="pointer-events-none absolute -top-2 left-3 select-none font-heading text-6xl leading-none text-primary/10"
      >
        &ldquo;
      </span>
      <p class="relative font-heading text-sm text-text transition-colors duration-200 group-hover:text-primary">
        {{ wish.name }}
      </p>
      <p class="relative line-clamp-6 whitespace-pre-line break-words text-sm leading-relaxed text-text-muted">
        {{ wish.message }}
      </p>
    </div>
  </button>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .wish-card,
  .wish-card img {
    transition: none !important;
  }
}
</style>
