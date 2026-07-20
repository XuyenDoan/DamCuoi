<script setup lang="ts">
import type { Wish } from '../../server/utils/types'

definePageMeta({ middleware: 'page-visibility' })
useHead({ title: 'Lời Chúc — Album Cưới' })

const { data: wishes, refresh } = await useWishes()

/**
 * Lưới masonry (cân đối theo nội dung, thay cho `grid` cố định trước đây —
 * yêu cầu "khung không cố định, thu nhỏ/giãn theo độ dài lời chúc"). Tái
 * dùng `useMasonryColumns` đã có ở `album.vue` (thuật toán đẩy vào cột đang
 * thấp nhất) — composable đó cần `{width, height}` để ước lượng tỉ lệ.
 *
 * QUAN TRỌNG (bug thật đã gặp & fix): bản đầu spread thẳng `{...wish,
 * width: 1, height: estimateWishHeight(wish)}` — lúc đó `Wish` CHƯA có
 * field `width`/`height` thật nên an toàn. Sau khi thêm `width`/`height`
 * (kích thước ảnh gốc, lưu lúc upload) vào `Wish` để hiển thị đúng tỉ lệ
 * ảnh, cách spread này TRÙNG TÊN và GHI ĐÈ mất kích thước ảnh thật bằng số
 * ước lượng chiều cao thẻ — khiến `<img>` nhận `width=1 height=<số ước
 * lượng>` thay vì kích thước ảnh thật, ảnh vỡ tỉ lệ nghiêm trọng (đo thực
 * tế: 1 ảnh cao hàng chục nghìn px). Khắc phục: KHÔNG spread lên chính đối
 * tượng `Wish` nữa — bọc riêng `{ wish, width, height }` (width/height ở
 * đây CHỈ dùng nội bộ cho thuật toán cân bằng cột, tách biệt hoàn toàn
 * khỏi `wish.width`/`wish.height` thật của ảnh).
 */
interface WishMasonryItem {
  wish: Wish
  width: number
  height: number
}
const MESSAGE_CHARS_PER_LINE = 26
const MESSAGE_LINE_HEIGHT = 20
const MAX_MESSAGE_LINES = 6 // khớp `line-clamp-6` ở WishCard.vue
const CARD_BASE_HEIGHT = 70 // padding + tên + khoảng cách, ước lượng
// Ảnh giờ hiển thị ĐÚNG TỈ LỆ THẬT (không còn khung cao cố định — yêu cầu
// "giữ tỉ lệ ảnh, chỉ thu nhỏ") nên chiều cao ảnh mỗi thẻ khác nhau tuỳ ảnh
// dọc/ngang. Ước lượng = ASSUMED_CARD_WIDTH * (height/width thật của ảnh,
// lấy từ `wish.width`/`wish.height` lưu lúc upload) — khớp đúng tinh thần
// `useMasonryColumns` đã dùng cho ảnh Album (tỉ lệ gốc, không phải số cố
// định). ASSUMED_CARD_WIDTH chỉ là ước lượng độ rộng 1 cột ở màn hình vừa
// (không cần chính xác tuyệt đối, chỉ để SO SÁNH tương đối giữa các thẻ).
const ASSUMED_CARD_WIDTH = 260
const LEGACY_PHOTO_HEIGHT_FALLBACK = 200 // lời chúc CŨ có ảnh nhưng thiếu width/height (trước khi thêm field)

function estimateWishHeight(wish: Wish): number {
  const lines = Math.min(
    MAX_MESSAGE_LINES,
    Math.max(1, Math.ceil(wish.message.length / MESSAGE_CHARS_PER_LINE))
  )
  const textHeight = CARD_BASE_HEIGHT + lines * MESSAGE_LINE_HEIGHT

  if (!wish.photo) return textHeight
  if (wish.width && wish.height) {
    return ASSUMED_CARD_WIDTH * (wish.height / wish.width) + textHeight
  }
  return LEGACY_PHOTO_HEIGHT_FALLBACK + textHeight
}

const columnCount = useColumnCount()
const wishItems = computed<WishMasonryItem[]>(
  () => (wishes.value ?? []).map((w) => ({ wish: w, width: 1, height: estimateWishHeight(w) }))
)
const wishColumns = useMasonryColumns(wishItems, columnCount)

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

      <div v-else class="mx-auto flex max-w-6xl gap-4">
        <div v-for="(column, ci) in wishColumns" :key="ci" class="flex min-w-0 flex-1 flex-col gap-4">
          <WishCard
            v-for="(item, i) in column"
            :key="item.wish.id"
            v-reveal="(i % 8) * 50"
            :wish="item.wish"
            @click="selectedWish = item.wish"
          />
        </div>
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
