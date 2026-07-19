<script setup lang="ts">
import type { EventInfoBlock } from '../../server/utils/types'

definePageMeta({ middleware: 'page-visibility' })
useHead({ title: 'Thông Tin Lễ Cưới — Album Cưới' })

const { data: settings } = useSiteSettings()

function formattedCeremonyTime(info: EventInfoBlock | undefined) {
  return info?.ceremonyTime ? formatVietnameseDateTime(info.ceremonyTime) : ''
}

function googleMapsSearchUrl(info: EventInfoBlock | undefined) {
  if (!info?.venueAddress) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.venueAddress)}`
}

const families = computed(() => [
  { key: 'groom', label: 'Nhà Trai', info: settings.value?.eventInfo.groom },
  { key: 'bride', label: 'Nhà Gái', info: settings.value?.eventInfo.bride }
])

/** Nhà nào chưa nhập gì thì không hiện khối rỗng gây rối mắt cho khách */
function hasContent(info: EventInfoBlock | undefined) {
  return !!(info?.ceremonyTime || info?.venueName || info?.venueAddress)
}
</script>

<template>
  <div class="relative overflow-hidden">
    <section class="relative overflow-hidden px-6 pb-8 pt-32 text-center sm:pt-40">
      <h1 class="font-heading text-4xl text-text sm:text-5xl">Thông Tin Lễ Cưới</h1>
      <p class="mx-auto mt-3 max-w-xl text-text-muted">
        Rất mong được đón tiếp bạn trong ngày trọng đại của chúng tôi.
      </p>
    </section>

    <section class="mx-auto max-w-4xl px-6 pb-16">
      <div class="grid gap-8 sm:grid-cols-2">
        <template v-for="family in families" :key="family.key">
          <div
            v-if="hasContent(family.info)"
            v-reveal
            class="flex flex-col rounded-xl border border-secondary-light/40 bg-surface p-6 sm:p-8"
          >
            <p class="mb-5 text-center font-accent text-lg italic text-primary">{{ family.label }}</p>

            <div class="flex flex-col gap-5">
              <div class="flex items-start gap-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mt-0.5 h-6 w-6 shrink-0 text-primary">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" stroke-linecap="round" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-text-muted">Thời gian</p>
                  <p class="text-lg text-text">{{ formattedCeremonyTime(family.info) || 'Đang cập nhật' }}</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mt-0.5 h-6 w-6 shrink-0 text-primary">
                  <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <div>
                  <p class="text-sm font-medium text-text-muted">Địa điểm</p>
                  <p class="text-lg text-text">{{ family.info?.venueName || 'Đang cập nhật' }}</p>
                  <p v-if="family.info?.venueAddress" class="text-text-muted">
                    {{ family.info.venueAddress }}
                  </p>
                  <a
                    v-if="googleMapsSearchUrl(family.info)"
                    :href="googleMapsSearchUrl(family.info)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="mt-1 inline-block text-sm text-secondary underline underline-offset-2 hover:text-secondary/80"
                  >
                    Xem trên Google Maps
                  </a>
                </div>
              </div>
            </div>

            <div v-if="family.info?.mapEmbedUrl" class="mt-6 overflow-hidden rounded-lg">
              <iframe
                :src="family.info.mapEmbedUrl"
                title="Bản đồ địa điểm tổ chức"
                loading="lazy"
                class="h-64 w-full border-0"
                referrerpolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
