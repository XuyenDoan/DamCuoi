<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="var(--color-primary)" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
