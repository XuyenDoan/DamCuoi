<script setup lang="ts">
/**
 * Trang lỗi tuỳ chỉnh (404/500...) — thay cho trang lỗi mặc định của Nuxt,
 * giữ đúng ngôn ngữ thiết kế của site (hoa sen, khung thẻ, nút primary) để
 * không phá vỡ trải nghiệm nếu khách bấm nhầm link.
 */
const props = defineProps<{ error: { statusCode: number; statusMessage?: string } }>()

const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() => (isNotFound.value ? 'Không tìm thấy trang' : 'Đã có lỗi xảy ra'))
const message = computed(() =>
  isNotFound.value
    ? 'Trang bạn tìm không tồn tại hoặc đã được di chuyển. Có thể đường liên kết đã bị gõ sai.'
    : 'Rất tiếc, đã có sự cố ngoài ý muốn. Vui lòng thử lại hoặc quay về trang chủ.'
)

function backHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface px-6">
    <div class="w-full max-w-sm rounded-xl border border-secondary-light/40 bg-bg p-8 text-center">
      <LotusMotif class="mx-auto h-12 w-12 text-primary" />
      <p class="mt-4 font-heading text-2xl text-text">{{ title }}</p>
      <p class="mt-2 text-sm text-text-muted">{{ message }}</p>
      <button type="button" class="btn-primary mt-6" @click="backHome">Về trang chủ</button>
    </div>
  </div>
</template>
