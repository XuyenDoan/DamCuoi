<script setup lang="ts">
import DefaultHomeView from '../components/theme/DefaultHomeView.vue'
import EditorialHomeView from '../components/theme/EditorialHomeView.vue'
import CinematicHomeView from '../components/theme/CinematicHomeView.vue'

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
  <CinematicHomeView v-else />
</template>
