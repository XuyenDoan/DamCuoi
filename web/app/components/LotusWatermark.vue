<script setup lang="ts">
/**
 * Đặt hoạ tiết hoa sen làm watermark nền cho 1 section.
 * Yêu cầu: section cha phải có class `relative overflow-hidden`.
 * Theo spec.md mục 5 & checklist 17.1: opacity 4-8%, z-index thấp nhất,
 * tối đa 2-3 vị trí mỗi màn hình — không lạm dụng thành "giấy dán tường".
 */
withDefaults(
  defineProps<{
    position?: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right' | 'center'
    tone?: 'primary' | 'secondary' | 'gold'
    size?: string
  }>(),
  { position: 'top-right', tone: 'secondary', size: 'w-72' }
)

const positionClasses: Record<string, string> = {
  'top-right': 'top-0 right-0 -translate-y-1/4 translate-x-1/4',
  'top-left': 'top-0 left-0 -translate-y-1/4 -translate-x-1/4',
  'bottom-left': 'bottom-0 left-0 translate-y-1/4 -translate-x-1/4',
  'bottom-right': 'bottom-0 right-0 translate-y-1/4 translate-x-1/4',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
}

const toneClasses: Record<string, string> = {
  primary: 'text-primary-light',
  secondary: 'text-secondary-light',
  gold: 'text-gold'
}
</script>

<template>
  <div
    class="pointer-events-none absolute -z-10 opacity-[0.06]"
    :class="[positionClasses[position], toneClasses[tone], size]"
    aria-hidden="true"
  >
    <LotusMotif class="h-auto w-full" />
  </div>
</template>
