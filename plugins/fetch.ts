import { ofetch } from 'ofetch'
import { useAuthStore } from '@/stores/auth'

export default defineNuxtPlugin((_nuxtApp: any) => {
  const authStore = useAuthStore()
  globalThis.$fetch = ofetch.create({
    onRequest({ options }) {
      if (authStore.getToken !== '') {
        options.headers = {
          Authorization: authStore.getToken,
        }
      }
    },
    onRequestError({ error }) {
      console.error(error)
    },
    onResponse({ response }) {
      if (response.status === 401 || response.status === 302) {
        authStore.setToken('', true)
        if (_nuxtApp.$router) {
          _nuxtApp.$router.push('/login')
        } else {
          console.error('Router not available')
        }
      }
    },
  })
})