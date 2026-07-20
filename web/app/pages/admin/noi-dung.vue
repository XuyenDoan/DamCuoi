<script setup lang="ts">
import type { Settings } from '../../../server/utils/types'
import { MANAGED_PAGES } from '#shared/pages'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: 'Nội Dung Trang — Quản Trị' })

const { data: initialSettings } = await useSiteSettings()

const managedPages = MANAGED_PAGES

const form = ref<Settings>(
  initialSettings.value
    ? structuredClone(initialSettings.value)
    : {
        coupleNames: { bride: '', groom: '' },
        weddingDate: '',
        heroTagline: '',
        welcomeMessage: '',
        loveStory: [],
        eventInfo: {
          groom: { ceremonyTime: '', venueName: '', venueAddress: '', mapEmbedUrl: '' },
          bride: { ceremonyTime: '', venueName: '', venueAddress: '', mapEmbedUrl: '' }
        },
        footerText: '',
        pageBackgrounds: {},
        hiddenPages: []
      }
)

const groomCeremonyLocal = computed({
  get: () => isoToVietnamLocalInput(form.value.eventInfo.groom.ceremonyTime),
  set: (val: string) => {
    form.value.eventInfo.groom.ceremonyTime = vietnamLocalInputToIso(val)
  }
})

const brideCeremonyLocal = computed({
  get: () => isoToVietnamLocalInput(form.value.eventInfo.bride.ceremonyTime),
  set: (val: string) => {
    form.value.eventInfo.bride.ceremonyTime = vietnamLocalInputToIso(val)
  }
})

const isSaving = ref(false)
const saveState = ref<'idle' | 'success' | 'error'>('idle')
const saveError = ref('')

function addMilestone() {
  form.value.loveStory.push({
    id: `story_${Date.now()}`,
    year: '',
    title: '',
    content: '',
    photos: []
  })
}

function removeMilestone(index: number) {
  form.value.loveStory.splice(index, 1)
}

const editingMilestoneId = ref<string | null>(null)
const editingMilestone = computed(
  () => form.value.loveStory.find((m) => m.id === editingMilestoneId.value) ?? null
)

// ---- Ảnh nền riêng cho từng trang (không thuộc album nào) — rút gọn thành
// list + popup PageBackgroundEditModal (mục nâng cấp Admin) ----
const pageBgUploading = reactive<Record<string, boolean>>({})
const pageBgError = reactive<Record<string, string>>({})
const editingPageKey = ref<string | null>(null)
const editingPage = computed(() => managedPages.find((p) => p.key === editingPageKey.value) ?? null)

async function uploadPageBg(key: string, file: File) {
  pageBgError[key] = ''
  pageBgUploading[key] = true

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await $fetch<{ image: string }>(`/api/admin/page-background/${key}`, {
      method: 'POST',
      body: formData
    })
    form.value.pageBackgrounds[key] = res.image
  } catch (err: unknown) {
    pageBgError[key] =
      (err as { data?: { statusMessage?: string } })?.data?.statusMessage ||
      'Tải ảnh thất bại, vui lòng thử lại.'
  } finally {
    pageBgUploading[key] = false
  }
}

async function removePageBg(key: string) {
  pageBgUploading[key] = true
  try {
    await $fetch(`/api/admin/page-background/${key}`, { method: 'DELETE' })
    form.value.pageBackgrounds[key] = null
  } finally {
    pageBgUploading[key] = false
  }
}

function isPageHidden(key: string): boolean {
  return key !== 'home' && form.value.hiddenPages.includes(key)
}

function toggleHiddenPage(key: string, hidden: boolean) {
  const hiddenPages = form.value.hiddenPages
  const idx = hiddenPages.indexOf(key)
  if (hidden && idx === -1) hiddenPages.push(key)
  else if (!hidden && idx !== -1) hiddenPages.splice(idx, 1)
}

function moveMilestone(index: number, direction: -1 | 1) {
  const targetIndex = index + direction
  const items = form.value.loveStory
  if (targetIndex < 0 || targetIndex >= items.length) return

  const current = items[index]
  const target = items[targetIndex]
  if (!current || !target) return

  items[index] = target
  items[targetIndex] = current
}

async function save() {
  isSaving.value = true
  saveState.value = 'idle'
  saveError.value = ''
  try {
    await $fetch('/api/settings', { method: 'PUT', body: form.value })
    saveState.value = 'success'
  } catch (err: unknown) {
    saveState.value = 'error'
    saveError.value =
      (err as { data?: { statusMessage?: string } })?.data?.statusMessage ||
      'Lưu thất bại, vui lòng thử lại.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div>
    <AdminTopbar title="Nội dung trang" />

    <div class="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[1.4fr_1fr]">
      <form class="flex flex-col gap-10" @submit.prevent="save">
        <!-- Trang bìa -->
        <fieldset class="flex flex-col gap-4 rounded-xl border border-secondary-light/40 p-6">
          <legend class="px-2 font-heading text-lg text-text">Trang bìa</legend>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label for="groom-name" class="mb-2 block text-sm font-medium text-text">
                Tên chú rể <span class="text-error">*</span>
              </label>
              <input
                id="groom-name"
                v-model="form.coupleNames.groom"
                type="text"
                required
                class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                style="min-height: 44px"
              />
            </div>
            <div>
              <label for="bride-name" class="mb-2 block text-sm font-medium text-text">
                Tên cô dâu <span class="text-error">*</span>
              </label>
              <input
                id="bride-name"
                v-model="form.coupleNames.bride"
                type="text"
                required
                class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                style="min-height: 44px"
              />
            </div>
          </div>

          <div>
            <label for="wedding-date" class="mb-2 block text-sm font-medium text-text">Ngày cưới</label>
            <input
              id="wedding-date"
              v-model="form.weddingDate"
              type="date"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-64"
              style="min-height: 44px"
            />
            <p class="mt-1 text-xs text-text-muted">Dùng để tính đếm ngược ở trang chủ.</p>
          </div>

          <div>
            <label for="hero-tagline" class="mb-2 block text-sm font-medium text-text">
              Câu tagline hero
            </label>
            <input
              id="hero-tagline"
              v-model="form.heroTagline"
              type="text"
              placeholder="VD: Chúng tôi sắp kết hôn"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text placeholder:text-text-muted/60 transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              style="min-height: 44px"
            />
          </div>

        </fieldset>

        <!-- Ảnh nền từng trang + hiển thị/ẩn trang -->
        <fieldset class="flex flex-col gap-2 rounded-xl border border-secondary-light/40 p-6">
          <legend class="px-2 font-heading text-lg text-text">Ảnh nền &amp; hiển thị từng trang</legend>
          <p class="mb-2 text-xs text-text-muted">
            Bấm vào 1 dòng để đổi ảnh nền hoặc bật/tắt hiển thị trang đó trên website.
          </p>

          <button
            v-for="page in managedPages"
            :key="page.key"
            type="button"
            class="focus-ring flex items-center gap-3 rounded-lg border border-secondary-light/30 bg-surface p-3 text-left transition-all duration-200 hover:border-primary/30 hover:bg-surface/70 active:scale-[0.99]"
            @click="editingPageKey = page.key"
          >
            <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-secondary-light/40 bg-bg">
              <img
                v-if="form.pageBackgrounds[page.key]"
                :src="`/uploads/${form.pageBackgrounds[page.key]}`"
                alt=""
                class="h-full w-full object-cover"
              />
              <LotusMotif v-else class="h-5 w-5 text-primary-light" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-text">{{ page.label }}</p>
              <p class="text-xs text-text-muted">
                {{ form.pageBackgrounds[page.key] ? 'Ảnh riêng' : 'Hoạ tiết hoa sen' }}
              </p>
            </div>

            <!-- Badge trạng thái hiển thị — trước đây chỉ có chữ nhỏ "· Đang ẩn"
                 khi trang bị ẩn, KHÔNG hiện gì khi trang đang hiển thị, nên khó
                 nhận biết ngay trạng thái từng trang (phát hiện khi rà soát UI
                 admin). Dùng lại đúng mẫu màu badge đã có ở trang "Lời chúc"
                 (bg-success/10 + text-success / bg-error/10 + text-error) để
                 nhất quán trong toàn bộ admin, kèm icon mắt cho trực quan hơn. -->
            <span
              v-if="page.key === 'home'"
              class="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary-light/20 px-2.5 py-1 text-xs font-medium text-secondary"
            >
              Luôn hiển thị
            </span>
            <span
              v-else
              class="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              :class="isPageHidden(page.key) ? 'bg-error/10 text-error' : 'bg-success/10 text-success'"
            >
              <svg
                v-if="isPageHidden(page.key)"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-3 w-3 shrink-0"
                aria-hidden="true"
              >
                <path d="M3 3l18 18M10.58 10.58a2 2 0 102.83 2.83M9.88 4.24A9.77 9.77 0 0112 4c5 0 9 4 10 8a17.6 17.6 0 01-1.67 2.68M6.1 6.1C3.87 7.65 2.29 9.86 2 12c.42 1.64 1.35 3.16 2.62 4.42" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-3 w-3 shrink-0"
                aria-hidden="true"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {{ isPageHidden(page.key) ? 'Đã ẩn' : 'Đang hiển thị' }}
            </span>

            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4 shrink-0 text-text-muted">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </fieldset>

        <AdminPageBackgroundEditModal
          :open="editingPageKey !== null"
          :page="editingPage"
          :background="editingPage ? (form.pageBackgrounds[editingPage.key] ?? null) : null"
          :uploading="editingPage ? (pageBgUploading[editingPage.key] ?? false) : false"
          :error="editingPage ? (pageBgError[editingPage.key] ?? '') : ''"
          :hidden="editingPage ? form.hiddenPages.includes(editingPage.key) : false"
          @upload="(file) => editingPage && uploadPageBg(editingPage.key, file)"
          @remove="editingPage && removePageBg(editingPage.key)"
          @update:hidden="(value) => editingPage && toggleHiddenPage(editingPage.key, value)"
          @close="editingPageKey = null"
        />

        <!-- Lời ngỏ -->
        <fieldset class="flex flex-col gap-4 rounded-xl border border-secondary-light/40 p-6">
          <legend class="px-2 font-heading text-lg text-text">Lời ngỏ</legend>
          <div>
            <label for="welcome-message" class="mb-2 block text-sm font-medium text-text">
              Đoạn văn hiển thị dưới hero
            </label>
            <textarea
              id="welcome-message"
              v-model="form.welcomeMessage"
              rows="3"
              class="w-full resize-none rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </fieldset>

        <!-- Câu chuyện tình yêu -->
        <fieldset class="flex flex-col gap-2 rounded-xl border border-secondary-light/40 p-6">
          <legend class="px-2 font-heading text-lg text-text">Câu chuyện tình yêu</legend>

          <div
            v-for="(milestone, i) in form.loveStory"
            :key="milestone.id"
            class="flex items-center gap-2 rounded-lg border border-secondary-light/30 bg-surface p-3"
          >
            <button
              type="button"
              class="focus-ring flex flex-1 items-center gap-3 rounded-md text-left"
              @click="editingMilestoneId = milestone.id"
            >
              <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-secondary-light/40 bg-bg">
                <img
                  v-if="milestone.photos[0]"
                  :src="`/uploads/${milestone.photos[0].filename}`"
                  alt=""
                  class="h-full w-full object-cover"
                />
                <LotusMotif v-else class="h-5 w-5 text-primary-light" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-text">{{ milestone.year || 'Chưa có năm' }}</p>
                <p class="truncate text-xs text-text-muted">{{ milestone.title || 'Chưa có tiêu đề' }}</p>
              </div>
            </button>

            <div class="flex shrink-0 items-center gap-1">
              <button
                type="button"
                class="focus-ring flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors duration-200 hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="i === 0"
                aria-label="Di chuyển lên"
                @click="moveMilestone(i, -1)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </button>
              <button
                type="button"
                class="focus-ring flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors duration-200 hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="i === form.loveStory.length - 1"
                aria-label="Di chuyển xuống"
                @click="moveMilestone(i, 1)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </button>
              <button
                type="button"
                class="focus-ring flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors duration-200 hover:bg-error/10 hover:text-error"
                aria-label="Xoá mốc này"
                @click="removeMilestone(i)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          </div>

          <button type="button" class="btn-outline mt-2 self-start" @click="addMilestone">
            + Thêm mốc thời gian
          </button>
        </fieldset>

        <AdminLoveStoryEditModal
          :open="editingMilestoneId !== null"
          :milestone="editingMilestone"
          @close="editingMilestoneId = null"
        />

        <!-- Thông tin lễ cưới nhà trai -->
        <fieldset class="flex flex-col gap-4 rounded-xl border border-secondary-light/40 p-6">
          <legend class="px-2 font-heading text-lg text-text">Thông tin lễ cưới — Nhà trai</legend>

          <div>
            <label for="groom-ceremony-time" class="mb-2 block text-sm font-medium text-text">
              Giờ tổ chức (giờ Việt Nam)
            </label>
            <input
              id="groom-ceremony-time"
              v-model="groomCeremonyLocal"
              type="datetime-local"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-72"
              style="min-height: 44px"
            />
          </div>

          <div>
            <label for="groom-venue-name" class="mb-2 block text-sm font-medium text-text">Tên địa điểm</label>
            <input
              id="groom-venue-name"
              v-model="form.eventInfo.groom.venueName"
              type="text"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              style="min-height: 44px"
            />
          </div>

          <div>
            <label for="groom-venue-address" class="mb-2 block text-sm font-medium text-text">Địa chỉ</label>
            <input
              id="groom-venue-address"
              v-model="form.eventInfo.groom.venueAddress"
              type="text"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              style="min-height: 44px"
            />
          </div>

          <div>
            <label for="groom-map-embed" class="mb-2 block text-sm font-medium text-text">
              Link nhúng Google Maps (không bắt buộc)
            </label>
            <textarea
              id="groom-map-embed"
              v-model="form.eventInfo.groom.mapEmbedUrl"
              rows="2"
              placeholder="https://www.google.com/maps/embed?... hoặc dán cả đoạn <iframe>"
              class="w-full resize-none rounded-lg border border-secondary-light/60 px-4 py-3 text-text placeholder:text-text-muted/60 transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p class="mt-1 text-xs text-text-muted">
              Lấy từ Google Maps → Chia sẻ → Nhúng bản đồ. Dán nguyên cả đoạn mã (kể cả thẻ &lt;iframe&gt;) hoặc chỉ link trong thuộc tính src đều được — hệ thống tự nhận diện và trích đúng link khi lưu.
            </p>
          </div>
        </fieldset>

        <!-- Thông tin lễ cưới nhà gái -->
        <fieldset class="flex flex-col gap-4 rounded-xl border border-secondary-light/40 p-6">
          <legend class="px-2 font-heading text-lg text-text">Thông tin lễ cưới — Nhà gái</legend>

          <div>
            <label for="bride-ceremony-time" class="mb-2 block text-sm font-medium text-text">
              Giờ tổ chức (giờ Việt Nam)
            </label>
            <input
              id="bride-ceremony-time"
              v-model="brideCeremonyLocal"
              type="datetime-local"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-72"
              style="min-height: 44px"
            />
          </div>

          <div>
            <label for="bride-venue-name" class="mb-2 block text-sm font-medium text-text">Tên địa điểm</label>
            <input
              id="bride-venue-name"
              v-model="form.eventInfo.bride.venueName"
              type="text"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              style="min-height: 44px"
            />
          </div>

          <div>
            <label for="bride-venue-address" class="mb-2 block text-sm font-medium text-text">Địa chỉ</label>
            <input
              id="bride-venue-address"
              v-model="form.eventInfo.bride.venueAddress"
              type="text"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              style="min-height: 44px"
            />
          </div>

          <div>
            <label for="bride-map-embed" class="mb-2 block text-sm font-medium text-text">
              Link nhúng Google Maps (không bắt buộc)
            </label>
            <textarea
              id="bride-map-embed"
              v-model="form.eventInfo.bride.mapEmbedUrl"
              rows="2"
              placeholder="https://www.google.com/maps/embed?... hoặc dán cả đoạn <iframe>"
              class="w-full resize-none rounded-lg border border-secondary-light/60 px-4 py-3 text-text placeholder:text-text-muted/60 transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p class="mt-1 text-xs text-text-muted">
              Lấy từ Google Maps → Chia sẻ → Nhúng bản đồ. Dán nguyên cả đoạn mã (kể cả thẻ &lt;iframe&gt;) hoặc chỉ link trong thuộc tính src đều được — hệ thống tự nhận diện và trích đúng link khi lưu.
            </p>
          </div>
        </fieldset>

        <!-- Footer -->
        <fieldset class="flex flex-col gap-4 rounded-xl border border-secondary-light/40 p-6">
          <legend class="px-2 font-heading text-lg text-text">Footer</legend>
          <div>
            <label for="footer-text" class="mb-2 block text-sm font-medium text-text">
              Lời cảm ơn cuối trang
            </label>
            <textarea
              id="footer-text"
              v-model="form.footerText"
              rows="2"
              class="w-full resize-none rounded-lg border border-secondary-light/60 px-4 py-3 text-text transition-colors duration-200 hover:border-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </fieldset>

        <div
          class="sticky bottom-4 z-10 mt-2 flex items-center gap-4 rounded-full border border-secondary-light/40 bg-bg/95 px-5 py-3 shadow-lg backdrop-blur"
        >
          <button type="submit" class="btn-primary" :disabled="isSaving">
            {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
          <p v-if="saveState === 'success'" role="status" class="text-sm text-success">
            Đã lưu thành công
          </p>
          <p v-else-if="saveState === 'error'" role="alert" class="text-sm text-error">
            {{ saveError }}
          </p>
        </div>
      </form>

      <!-- Xem trước -->
      <aside class="h-fit rounded-xl border border-secondary-light/40 bg-surface p-6 lg:sticky lg:top-6">
        <p class="mb-4 text-xs font-medium uppercase tracking-wide text-text-muted">Xem trước trang bìa</p>
        <div class="rounded-lg bg-bg p-6 text-center">
          <p v-if="form.heroTagline" class="font-accent text-sm italic text-text-muted">
            {{ form.heroTagline }}
          </p>
          <h2 class="mt-2 font-heading text-2xl text-text">
            {{ form.coupleNames.groom || 'Chú Rể' }}
            <span class="text-primary">&amp;</span>
            {{ form.coupleNames.bride || 'Cô Dâu' }}
          </h2>
          <p v-if="form.weddingDate" class="mt-2 text-xs uppercase tracking-widest text-text-muted">
            {{ formatVietnameseDate(form.weddingDate) }}
          </p>
          <p v-if="form.welcomeMessage" class="mt-3 text-sm text-text-muted">
            {{ form.welcomeMessage }}
          </p>
        </div>
        <p class="mt-3 text-xs text-text-muted">
          Ảnh nền từng trang xem ở mục "Ảnh nền từng trang" bên dưới, hoặc xem trực tiếp trên
          <NuxtLink
            to="/"
            target="_blank"
            class="focus-ring rounded-sm text-secondary underline underline-offset-2 transition-colors duration-200 hover:text-primary"
          >
            trang chủ
          </NuxtLink>.
        </p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/*
  Chống lỗi CSS Grid/Flex mặc định: item con không tự co xuống dưới
  "min-content" (min-width: auto mặc định của flex/grid item) — phát hiện
  thật khi rà soát responsive admin: input `datetime-local`/`date` lồng
  trong nhiều tầng flex (form -> fieldset -> hàng label/input -> nút trong
  hàng) khiến CẢ TRANG bị tràn ngang thật ở màn hình hẹp (đã đo scrollWidth
  thực tế bằng Playwright: tràn ~49px ở viewport 320px — không phải cảm
  giác, đã xác nhận bằng getBoundingClientRect). Chỉ cần đặt lại
  `min-width: 0` đúng các tầng flex/grid lồng nhau này (đã xác định chính
  xác bằng cách đo/bisect từng tầng — form, fieldset, hàng label/input, nút
  trong hàng "Câu chuyện tình yêu") để mọi phần tử tự co đúng theo container
  thay vì giữ nguyên kích thước nội dung tối thiểu. Đã verify hết tràn ở
  320/340/375px sau khi thêm.
*/
form,
form > fieldset,
form > fieldset > div,
form > fieldset > div > button,
aside {
  min-width: 0;
}
</style>
