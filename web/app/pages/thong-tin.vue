<script setup lang="ts">
definePageMeta({ middleware: 'page-visibility' })
useHead({ title: 'Thông Tin Lễ Cưới — Album Cưới' })

const { data: settings } = useSiteSettings()

const formattedCeremonyTime = computed(() => {
  const iso = settings.value?.eventInfo.ceremonyTime
  return iso ? formatVietnameseDateTime(iso) : ''
})

const googleMapsSearchUrl = computed(() => {
  const address = settings.value?.eventInfo.venueAddress
  if (!address) return ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
})
</script>

<template>
  <div class="relative overflow-hidden">
    <section class="relative overflow-hidden px-6 pb-8 pt-32 text-center sm:pt-40">
      <h1 class="font-heading text-4xl text-text sm:text-5xl">Thông Tin Lễ Cưới</h1>
      <p class="mx-auto mt-3 max-w-xl text-text-muted">
        Rất mong được đón tiếp bạn trong ngày trọng đại của chúng tôi.
      </p>
    </section>

    <section class="mx-auto max-w-2xl px-6 pb-16">
      <div class="rounded-xl border border-secondary-light/40 bg-surface p-6 sm:p-8">
        <div class="flex flex-col gap-5">
          <div class="flex items-start gap-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mt-0.5 h-6 w-6 shrink-0 text-primary">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 10h18" stroke-linecap="round" />
            </svg>
            <div>
              <p class="text-sm font-medium text-text-muted">Thời gian</p>
              <p class="text-lg text-text">{{ formattedCeremonyTime || 'Đang cập nhật' }}</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mt-0.5 h-6 w-6 shrink-0 text-primary">
              <path d="M12 21s-7-6.5-7-11a7 7 0 1114 0c0 4.5-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <div>
              <p class="text-sm font-medium text-text-muted">Địa điểm</p>
              <p class="text-lg text-text">{{ settings?.eventInfo.venueName || 'Đang cập nhật' }}</p>
              <p v-if="settings?.eventInfo.venueAddress" class="text-text-muted">
                {{ settings.eventInfo.venueAddress }}
              </p>
              <a
                v-if="googleMapsSearchUrl"
                :href="googleMapsSearchUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-1 inline-block text-sm text-secondary underline underline-offset-2 hover:text-secondary/80"
              >
                Xem trên Google Maps
              </a>
            </div>
          </div>
        </div>

        <div v-if="settings?.eventInfo.mapEmbedUrl" class="mt-6 overflow-hidden rounded-lg">
          <iframe
            :src="settings.eventInfo.mapEmbedUrl"
            title="Bản đồ địa điểm tổ chức"
            loading="lazy"
            class="h-72 w-full border-0"
            referrerpolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  </div>
</template>
