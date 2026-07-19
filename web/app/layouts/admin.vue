<script setup lang="ts">
/**
 * Layout riêng cho /admin/** — đơn giản, chức năng, không dùng header/footer
 * hướng khách mời của layout default (spec.md mục 15.5).
 */
</script>

<template>
  <div class="min-h-screen bg-bg">
    <slot />
  </div>
</template>
