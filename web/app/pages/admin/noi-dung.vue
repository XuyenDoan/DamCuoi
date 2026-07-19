<script setup lang="ts">
import type { Settings } from '../../../server/utils/types'
import { MANAGED_PAGES } from '../../../shared/pages'

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
        eventInfo: { ceremonyTime: '', venueName: '', venueAddress: '', mapEmbedUrl: '' },
        footerText: '',
        pageBackgrounds: {},
        hiddenPages: []
      }
)

const ceremonyLocal = computed({
  get: () => isoToVietnamLocalInput(form.value.eventInfo.ceremonyTime),
  set: (val: string) => {
    form.value.eventInfo.ceremonyTime = vietnamLocalInputToIso(val)
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
                class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-64"
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
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
            class="flex items-center gap-3 rounded-lg border border-secondary-light/30 bg-surface p-3 text-left transition-colors hover:bg-surface/70"
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
                <span v-if="page.key !== 'home' && form.hiddenPages.includes(page.key)" class="text-error"> · Đang ẩn</span>
              </p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4 shrink-0 text-text-muted">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </fieldset>

        <AdminPageBackgroundEditModal
          v-if="editingPage"
          :page="editingPage"
          :background="form.pageBackgrounds[editingPage.key] ?? null"
          :uploading="pageBgUploading[editingPage.key] ?? false"
          :error="pageBgError[editingPage.key] ?? ''"
          :hidden="form.hiddenPages.includes(editingPage.key)"
          @upload="(file) => uploadPageBg(editingPage!.key, file)"
          @remove="removePageBg(editingPage!.key)"
          @update:hidden="(value) => toggleHiddenPage(editingPage!.key, value)"
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
              class="w-full resize-none rounded-lg border border-secondary-light/60 px-4 py-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              class="flex flex-1 items-center gap-3 text-left"
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
                class="flex h-9 w-9 items-center justify-center text-text-muted hover:text-primary disabled:opacity-30"
                :disabled="i === 0"
                aria-label="Di chuyển lên"
                @click="moveMilestone(i, -1)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </button>
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center text-text-muted hover:text-primary disabled:opacity-30"
                :disabled="i === form.loveStory.length - 1"
                aria-label="Di chuyển xuống"
                @click="moveMilestone(i, 1)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" class="h-4 w-4"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
              </button>
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center text-text-muted hover:text-error"
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
          v-if="editingMilestone"
          :milestone="editingMilestone"
          @close="editingMilestoneId = null"
        />

        <!-- Thông tin lễ cưới -->
        <fieldset class="flex flex-col gap-4 rounded-xl border border-secondary-light/40 p-6">
          <legend class="px-2 font-heading text-lg text-text">Thông tin lễ cưới</legend>

          <div>
            <label for="ceremony-time" class="mb-2 block text-sm font-medium text-text">
              Giờ tổ chức (giờ Việt Nam)
            </label>
            <input
              id="ceremony-time"
              v-model="ceremonyLocal"
              type="datetime-local"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:w-72"
              style="min-height: 44px"
            />
          </div>

          <div>
            <label for="venue-name" class="mb-2 block text-sm font-medium text-text">Tên địa điểm</label>
            <input
              id="venue-name"
              v-model="form.eventInfo.venueName"
              type="text"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              style="min-height: 44px"
            />
          </div>

          <div>
            <label for="venue-address" class="mb-2 block text-sm font-medium text-text">Địa chỉ</label>
            <input
              id="venue-address"
              v-model="form.eventInfo.venueAddress"
              type="text"
              class="w-full rounded-lg border border-secondary-light/60 px-4 py-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              style="min-height: 44px"
            />
          </div>

          <div>
            <label for="map-embed" class="mb-2 block text-sm font-medium text-text">
              Link nhúng Google Maps (không bắt buộc)
            </label>
            <textarea
              id="map-embed"
              v-model="form.eventInfo.mapEmbedUrl"
              rows="2"
              placeholder="https://www.google.com/maps/embed?... hoặc dán cả đoạn <iframe>"
              class="w-full resize-none rounded-lg border border-secondary-light/60 px-4 py-3 text-text placeholder:text-text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              class="w-full resize-none rounded-lg border border-secondary-light/60 px-4 py-3 text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
          <NuxtLink to="/" target="_blank" class="text-secondary underline underline-offset-2">
            trang chủ
          </NuxtLink>.
        </p>
      </aside>
    </div>
  </div>
</template>
