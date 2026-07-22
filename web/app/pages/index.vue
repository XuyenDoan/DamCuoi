<script setup lang="ts">
import DefaultHomeView from '../components/theme/DefaultHomeView.vue'
import EditorialHomeView from '../components/theme/EditorialHomeView.vue'
import CinematicHomeView from '../components/theme/CinematicHomeView.vue'
import GlassHomeView from '../components/theme/GlassHomeView.vue'
import BentoHomeView from '../components/theme/BentoHomeView.vue'
import KineticHomeView from '../components/theme/KineticHomeView.vue'

useHead({
  title: 'Album Cưới',
  meta: [
    {
      name: 'description',
      content: 'Album ảnh cưới — lưu giữ những khoảnh khắc đáng nhớ trong ngày trọng đại.'
    }
  ]
})

const theme = useWebsiteTheme()
</script>

<template>
  <DefaultHomeView v-if="theme === 'default'" />
  <EditorialHomeView v-else-if="theme === 'editorial'" />
  <CinematicHomeView v-else-if="theme === 'cinematic'" />
  <GlassHomeView v-else-if="theme === 'glass'" />
  <BentoHomeView v-else-if="theme === 'bento'" />
  <KineticHomeView v-else-if="theme === 'kinetic'" />
  <DefaultHomeView v-else />
</template>
