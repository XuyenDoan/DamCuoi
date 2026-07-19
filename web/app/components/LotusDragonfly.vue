<script setup lang="ts">
/**
 * Chuồn chuồn line-art mảnh, cùng phong cách nét mỏng/màu currentColor với
 * LotusMotif/LotusLeaf. KHÔNG vẽ cánh đập nhanh kiểu hoạt hình (không hợp
 * tông thanh lịch của trang cưới) — cánh giữ tĩnh, chuyển động thật nằm ở
 * đường bay lượn chậm do component cha (LotusScene) điều khiển.
 *
 * QUAN TRỌNG (chỉnh lại lần 2 — bản đầu "chưa giống con chuồn chuồn lắm"):
 * bản trước dùng cánh hình ELIP TRÒN TRỊA + đầu chỉ là 1 CHẤM TRÒN — thiếu
 * đúng 2 đặc điểm nhận diện chuồn chuồn rõ nhất trong đời thực: (1) MẮT KÉP
 * to gần như chiếm hết đầu, (2) cánh THON DÀI dạng màng mỏng nhọn 2 đầu chứ
 * không bầu bĩnh như cánh bướm/cánh hoa. Vẽ lại: cánh dùng path hình thoi
 * thon nhọn (neo 1 đầu tại ngực, xoè ra chỉ về 1 phía — đúng cách cánh thật
 * gắn vào thân), thêm rõ đầu + ngực + 2 mắt kép, bụng kéo dài mảnh hơn.
 */
</script>

<template>
  <svg viewBox="0 0 80 30" class="lotus-dragonfly" aria-hidden="true" focusable="false">
    <!-- Cánh sau (đôi cánh dưới/sau) — thon dài, neo tại ngực phía sau 1 chút -->
    <g fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-opacity="0.32" stroke-width="0.5">
      <path d="M0,0 Q13,-4 26,0 Q13,4 0,0 Z" transform="translate(53,15) rotate(-32)" />
      <path d="M0,0 Q13,-4 26,0 Q13,4 0,0 Z" transform="translate(53,15) rotate(32) scale(1,-1)" />
    </g>
    <!-- Cánh trước — dài hơn, rõ hơn cánh sau -->
    <g fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-opacity="0.42" stroke-width="0.5">
      <path d="M0,0 Q16,-4.6 32,0 Q16,4.6 0,0 Z" transform="translate(57,15) rotate(-16)" />
      <path d="M0,0 Q16,-4.6 32,0 Q16,4.6 0,0 Z" transform="translate(57,15) rotate(16) scale(1,-1)" />
    </g>

    <!-- Bụng — dài, mảnh, thon nhỏ dần về đuôi, có đốt -->
    <path d="M4,15 Q30,13.6 55,15" fill="none" stroke="currentColor" stroke-opacity="0.85" stroke-width="1.8" stroke-linecap="round" />
    <path
      d="M4,15 Q30,13.6 55,15"
      fill="none"
      stroke="currentColor"
      stroke-opacity="0.95"
      stroke-width="0.55"
      stroke-linecap="round"
      stroke-dasharray="1.3 2.1"
    />

    <!-- Ngực (nơi cánh gắn vào) -->
    <ellipse cx="58" cy="15" rx="4.2" ry="3.2" fill="currentColor" fill-opacity="0.75" />

    <!-- Đầu + mắt kép — đặc điểm nhận diện rõ nhất của chuồn chuồn -->
    <ellipse cx="69" cy="15" rx="5.5" ry="4.4" fill="currentColor" fill-opacity="0.35" stroke="currentColor" stroke-opacity="0.5" stroke-width="0.5" />
    <circle cx="67.5" cy="12.4" r="2.3" fill="currentColor" fill-opacity="0.92" />
    <circle cx="67.5" cy="17.6" r="2.3" fill="currentColor" fill-opacity="0.92" />
  </svg>
</template>
