<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Đăng Nhập Quản Trị' })

const password = ref('')
const error = ref('')
const isSubmitting = ref(false)

async function onSubmit() {
  isSubmitting.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    await navigateTo('/admin')
  } catch (err: unknown) {
    error.value =
      (err as { data?: { statusMessage?: string } })?.data?.statusMessage ||
      'Đăng nhập thất bại, vui lòng thử lại.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-surface px-6">
    <div class="w-full max-w-sm rounded-xl border border-secondary-light/40 bg-bg p-8">
      <div class="mb-6 text-center">
        <LotusMotif class="mx-auto h-12 w-12 text-primary" />
        <h1 class="mt-4 font-heading text-2xl text-text">Đăng Nhập Quản Trị</h1>
        <p class="mt-1 text-sm text-text-muted">Dành riêng cho cô dâu &amp; chú rể</p>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <div>
          <label for="admin-password" class="mb-2 block text-sm font-medium text-text">
            Mật khẩu
          </label>
          <input
            id="admin-password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-base text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            style="min-height: 44px"
          />
        </div>

        <p v-if="error" role="alert" class="text-sm text-error">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Đang kiểm tra...' : 'Đăng nhập' }}
        </button>

        <NuxtLink
          to="/"
          class="focus-ring rounded-sm text-center text-sm text-text-muted transition-colors duration-200 hover:text-primary"
        >
          ← Về trang chủ
        </NuxtLink>
      </form>
    </div>
  </div>
</template>
