import { defineStore } from 'pinia'
import buildQueryString from '~/utils/buildQueryString'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: {} as any,
        users: [] as any[],
        usersList: [] as any[],
        pagination: {} as any,
    }),

    actions: {
        async fetchUsers(filter?: any) {
            if (this.pagination.hasMore === false) return
            if (this.pagination.page !== undefined) {
                this.pagination.page++
            } else {
                this.users = []
            }
            if (filter) {
                this.pagination = {
                    ...this.pagination,
                    ...filter
                }
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
            return await $fetch("/api/users/", {
                method: 'POST',
                body: JSON.stringify(data)
            }).then((response: any) => {
                if (response.data) {
                    this.users.push(response.data)
                }
                return response
            })
        },
        async updateUser(id: string, data: any) {
            return await $fetch("/api/users/" + id, {
                method: 'PUT',
                body: JSON.stringify(data)
            }).then((response: any) => {
                if (response.data) {
                    const index = this.users.findIndex((user: any) => user.id === response.data.id)
                    this.users[index] = response.data
                }
                return response
            })
        },
    },
})
