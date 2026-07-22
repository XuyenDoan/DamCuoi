<script setup lang="ts">
definePageMeta({ middleware: 'page-visibility' })
useHead({ title: 'Thông Tin Lễ Cưới — Album Cưới' })

const { data: settings } = useSiteSettings()

const families = computed(() => [
  { key: 'groom', label: 'Nhà Trai', info: settings.value?.eventInfo.groom },
  { key: 'bride', label: 'Nhà Gái', info: settings.value?.eventInfo.bride }
])
</script>

<template>
  <div class="relative overflow-hidden">
    <section class="relative overflow-hidden px-6 pb-8 pt-32 text-center sm:pt-40">
      <h1 v-reveal="0" class="font-heading text-4xl text-text sm:text-5xl">Thông Tin Lễ Cưới</h1>
      <p v-reveal="80" class="mx-auto mt-3 max-w-xl text-text-muted">
        Rất mong được đón tiếp bạn trong ngày trọng đại của chúng tôi.
      </p>
    </section>

    <section class="mx-auto max-w-4xl px-6 pb-16">
      <div class="grid gap-8 sm:grid-cols-2">
        <template v-for="family in families" :key="family.key">
          <div
            v-if="hasEventContent(family.info)"
            v-reveal
            class="event-info-card flex flex-col rounded-xl border border-secondary-light/40 bg-surface p-6 sm:p-8"
          >
            <EventInfoCard :label="family.label" :info="family.info" />
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
