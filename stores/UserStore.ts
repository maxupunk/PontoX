import { defineStore } from 'pinia'
import { snackbarShow } from "~/composables/useUi"

export const useUserStore = defineStore('user', {
    state: () => ({
        user: {} as any,
        users: [] as any[],
    }),

    actions: {
        async fetchUsers() {
            return await $fetch("/api/users/").then((response: any) => {
                this.users = response.users
            }).catch((error: any) => {
                snackbarShow(error, 'error')
            })
        },
    },
})
