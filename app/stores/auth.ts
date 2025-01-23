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
    setToken(token: string) {
      localStorage.setItem('pontox-token', token)
      this.token = token
    },
    async login(user: any) {
      const login: any = await $fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(user)
      })
      this.setToken(login.token)
      return login
    },
    logout() {
      localStorage.removeItem('pontox-token')
      this.token = ''
    },
  },
})