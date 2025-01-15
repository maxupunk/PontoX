import { defineStore } from 'pinia'
import buildQueryString from '~/utils/buildQueryString'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: {} as any,
        users: [] as any[],
        usersList: [] as any[],
        pagination: {} as any,
        search: '',
    }),

    actions: {
        async fetchUsers(reset?: any) {
            if (this.pagination.page !== undefined) {
                this.pagination.page++
            }

            if (reset) {
                this.pagination.page = 1
            }

            if (this.pagination.page === 1) {
                this.users = []
            }

            if (this.search) {
                this.pagination.search = this.search
            }
            const queryString = buildQueryString(this.pagination)
            return await $fetch(`/api/users${queryString}`).then((response: any) => {
                this.users = [...this.users, ...response.users]
                this.pagination = response.pagination
                return response.pagination
            })
        },
        async fetchList() {
            return await $fetch(`/api/users/list`).then((response: any) => {
                this.usersList = response.users
                return response.users
            })
        },
        async fetchUser(id: number) {
            return await $fetch("/api/users/" + id).then((response: any) => {
                this.user = response.user
            })
        },
        async createUser(data: any) {
            const response = await $fetch("/api/users/", {
                method: 'POST',
                body: JSON.stringify(data)
            })
            return response
        },
        async updateUser(id: string, data: any) {
            return await $fetch("/api/users/" + id, {
                method: 'PUT',
                body: JSON.stringify(data)
            })
        },
    },
})
