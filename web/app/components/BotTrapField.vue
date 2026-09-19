<script setup lang="ts">
/**
 * Ô "honeypot" chống bot: người thật không nhìn thấy và không điền, còn bot
 * tự động điền mọi ô nhập. Ẩn bằng cách đẩy ra ngoài màn hình (không dùng
 * `display: none` — bot thông minh bỏ qua ô bị ẩn kiểu đó) + `aria-hidden` /
 * `tabindex="-1"` để người dùng bàn phím và trình đọc màn hình không bao giờ
 * chạm vào. Xem `useBotTraps.ts` và `server/utils/antiSpam.ts`.
 */
const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="bot-trap" aria-hidden="true">
    <label>
      Website (vui lòng để trống)
      <input v-model="model" type="text" name="website" tabindex="-1" autocomplete="off" />
    </label>
  </div>
</template>

<style scoped>
.bot-trap {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
