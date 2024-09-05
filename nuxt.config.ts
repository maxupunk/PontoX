// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devtools: { enabled: false },
  telemetry: false,
  ssr: false,
  future: {
    compatibilityVersion: 4,
  },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    (_options: any, nuxt: any) => {
      nuxt.hooks.hook('vite:extendConfig', (config: any) => {
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    '@pinia/nuxt'
  ],
  plugins: [
    '~/plugins/fetch.ts'
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  compatibilityDate: '2024-08-15',
  runtimeConfig: {
    bdUrl: process.env.DATABASE_URL
  },
})