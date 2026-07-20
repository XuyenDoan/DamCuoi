<script setup lang="ts">
defineProps<{ title: string }>()

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  await navigateTo('/admin/login')
}
</script>

<template>
  <header class="border-b border-secondary-light/30 bg-surface">
    <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/admin"
          class="focus-ring rounded-sm font-heading text-lg text-text transition-colors duration-200 hover:text-primary"
          >Quản Trị</NuxtLink
        >
        <span class="text-text-muted">/</span>
        <h1 class="text-sm font-medium text-text-muted">{{ title }}</h1>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/"
          class="focus-ring rounded-sm text-sm text-text-muted transition-colors duration-200 hover:text-primary"
          >Xem trang web</NuxtLink
        >
        <button
          type="button"
          class="focus-ring rounded-sm text-sm text-text-muted transition-colors duration-200 hover:text-error"
          @click="logout"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  </header>
</template>
