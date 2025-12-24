// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-mongoose',
    '@nuxt/eslint',
  ],

  css: ['~/assets/css/main.css'],

  mongoose: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/thon-phe-tinh-khong',
    options: {},
    modelsDir: 'models',
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    public: {
      appName: 'Thôn Phệ Tinh Không',
    },
  },

  app: {
    head: {
      title: 'Thôn Phệ Tinh Không - Chinh Phục Vũ Trụ',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Game chiến lược không gian - Xây dựng đế chế, chinh phục vũ trụ' },
        { name: 'theme-color', content: '#0f172a' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap' },
      ],
    },
  },

  nitro: {
    experimental: {
      asyncContext: true,
      websocket: true,
    },
    imports: {
      dirs: ['./server/utils'],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
