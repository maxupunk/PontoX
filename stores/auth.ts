import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
  }),
  getters: {
    getToken: (state) => {
      const tokenStorage = localStorage.getItem('pontox-token')
      if (tokenStorage) {
        state.token = tokenStorage
      }
      return state.token
    },
  },
  actions: {
    setToken(token: string, remember: boolean) {
      if (remember) {
        localStorage.setItem('pontox-token', token)
      }
      this.token = token
    },
    logout() {
      localStorage.removeItem('pontox-token')
      this.token = ''
    },
  },
})