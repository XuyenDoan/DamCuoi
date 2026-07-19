import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()]
  },

  app: {
    head: {
      htmlAttrs: { lang: 'vi' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,500;1,600&display=swap&subset=vietnamese'
        }
      ]
    }
  },

  runtimeConfig: {
    adminSessionSecret: process.env.ADMIN_SESSION_SECRET || 'dev-secret-change-in-production',
    dataDir: process.env.DATA_DIR || '',
    uploadsDir: process.env.UPLOADS_DIR || ''
  }
})
