import { ofetch } from 'ofetch'
import { useAuthStore } from '@/stores/auth'

export default defineNuxtPlugin((_nuxtApp) => {
  const authStore = useAuthStore()
  globalThis.$fetch = ofetch.create({
    onRequest ({ options }) {
      if (authStore.getToken != '') {
        options.headers = { Authorization: authStore.getToken }
      }
    },
    onRequestError ({ error }) {
      console.error(error)
    },
    onResponse ({ response }) {
      if (response.status == 401) {
        authStore.setToken('', true)
      }
      return
    },
  })
})