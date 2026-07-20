<script setup lang="ts">
import type { Wish } from '../../server/utils/types'

definePageMeta({ middleware: 'page-visibility' })
useHead({ title: 'Lời Chúc — Album Cưới' })

const { data: wishes, refresh } = await useWishes()

const isSubmitModalOpen = ref(false)
const justSubmitted = ref(false)

async function onWishSubmitted() {
  isSubmitModalOpen.value = false
  justSubmitted.value = true
  await refresh()
}

const selectedWish = ref<Wish | null>(null)
</script>

<template>
  <div class="relative overflow-hidden">
    <section class="relative overflow-hidden px-6 pb-8 pt-32 text-center sm:pt-40">
      <h1 v-reveal="0" class="font-heading text-4xl text-text sm:text-5xl">Lời Chúc</h1>
      <p v-reveal="80" class="mx-auto mt-3 max-w-xl text-text-muted">
        Gửi lời chúc phúc đến cô dâu và chú rể — mỗi lời nhắn đều là món quà quý giá.
      </p>
    </section>

    <section class="mx-auto max-w-xl px-6 pb-10 text-center">
      <div
        v-if="justSubmitted"
        class="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success"
      >
        Cảm ơn bạn đã gửi lời chúc! Lời chúc của bạn đã được đăng.
      </div>

      <button type="button" class="btn-primary" @click="isSubmitModalOpen = true">
        Gửi Lời Chúc
      </button>
    </section>

    <section class="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div v-if="!wishes || wishes.length === 0" class="py-16 text-center">
        <LotusMotif class="mx-auto h-16 w-16 text-secondary-light" />
        <p class="mt-6 text-text-muted">
          Chưa có lời chúc nào — hãy là người đầu tiên gửi lời chúc phúc!
        </p>
      </div>

      <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <button
          v-for="(wish, i) in wishes"
          :key="wish.id"
          v-reveal="(i % 12) * 40"
          type="button"
          class="focus-ring wish-card group flex flex-col overflow-hidden rounded-xl border border-secondary-light/40 bg-bg text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg active:scale-[0.98]"
          @click="selectedWish = wish"
        >
          <div class="flex aspect-square items-center justify-center overflow-hidden bg-surface">
            <img
              v-if="wish.photo"
              :src="`/uploads/${wish.photo}`"
              alt="Ảnh đính kèm lời chúc"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
            <LotusMotif v-else class="wish-card-icon h-10 w-10 text-secondary-light transition-colors duration-200 group-hover:text-primary" />
          </div>
          <div class="flex flex-1 flex-col gap-1 p-3">
            <p class="truncate font-heading text-sm text-text transition-colors duration-200 group-hover:text-primary">{{ wish.name }}</p>
            <p class="line-clamp-3 text-xs text-text-muted">{{ wish.message }}</p>
          </div>
        </button>
      </div>
    </section>

    <WishModal :wish="selectedWish" @close="selectedWish = null" />
    <WishSubmitModal
      :open="isSubmitModalOpen"
      @close="isSubmitModalOpen = false"
      @submitted="onWishSubmitted"
    />
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .wish-card,
  .wish-card-icon,
  .wish-card img {
    transition: none !important;
  }
}
</style>
