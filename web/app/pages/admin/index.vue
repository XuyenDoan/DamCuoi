<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Bảng Điều Khiển — Quản Trị' })
</script>

<template>
  <div>
    <AdminTopbar title="Bảng điều khiển" />

    <div class="mx-auto max-w-5xl px-6 py-10">
      <h2 class="mb-6 font-heading text-2xl text-text">Chào mừng trở lại!</h2>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink
          to="/admin/noi-dung"
          class="focus-ring rounded-xl border border-secondary-light/40 p-6 transition-all duration-200 hover:border-primary/30 hover:bg-surface hover:shadow-sm active:scale-[0.98]"
        >
          <h3 class="font-heading text-lg text-text">Nội Dung Trang</h3>
          <p class="mt-1 text-sm text-text-muted">
            Sửa tên, lời ngỏ, câu chuyện tình yêu, thông tin lễ cưới
          </p>
        </NuxtLink>

        <NuxtLink
          to="/admin/anh"
          class="focus-ring rounded-xl border border-secondary-light/40 p-6 transition-all duration-200 hover:border-primary/30 hover:bg-surface hover:shadow-sm active:scale-[0.98]"
        >
          <h3 class="font-heading text-lg text-text">Quản Lý Ảnh</h3>
          <p class="mt-1 text-sm text-text-muted">
            Upload, sắp xếp, đặt ảnh bìa, duyệt ảnh khách gửi
          </p>
        </NuxtLink>

        <NuxtLink
          to="/admin/loi-chuc"
          class="focus-ring rounded-xl border border-secondary-light/40 p-6 transition-all duration-200 hover:border-primary/30 hover:bg-surface hover:shadow-sm active:scale-[0.98]"
        >
          <h3 class="font-heading text-lg text-text">Lời Chúc</h3>
          <p class="mt-1 text-sm text-text-muted">Ẩn hoặc xoá lời chúc không phù hợp</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/giao-dien"
          class="focus-ring rounded-xl border border-secondary-light/40 p-6 transition-all duration-200 hover:border-primary/30 hover:bg-surface hover:shadow-sm active:scale-[0.98]"
        >
          <h3 class="font-heading text-lg text-text">Giao Diện Website</h3>
          <p class="mt-1 text-sm text-text-muted">Chọn phong cách hiển thị cho toàn bộ trang công khai</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
