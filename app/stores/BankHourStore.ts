import { defineStore } from 'pinia'

export const useBankHourStore = defineStore('bankhour', {
    state: () => ({
        bankHour: {} as any,
        bankHours: [] as any[],
        bankUser: {
            user: {} as any,
            rows: [] as any[],
            total: 0 as number,
        } as any,
        bankUsers: [] as any[],
        hoursBalance: [] as any[],
        pagination: {} as any,
    }),

    actions: {
        async fetchBankHaurs() {
            if (this.pagination.hasMore === false) return
            if (this.pagination.page !== undefined) {
                this.pagination.page++
            } else {
                this.bankHours = []
            }
            const queryString = buildQueryString(this.pagination)
            return await $fetch(`/api/bankhour${queryString}`).then((response: any) => {
                this.bankHours = [...this.bankHours, ...response.data]
                this.pagination = response.pagination
                return response.pagination
            })
        },
        async fetchBankHaur(id: number) {
            return await $fetch("/api/bankhour/" + id).then((response: any) => {
                this.bankHour = response
            })
        },
        async fetchBankHaursUser(id: number) {
            return await $fetch(`/api/bankhour/user/${id}`).then((response: any) => {
                this.bankUser = response
            })
        },
        async create(data: any) {
            const response = await $fetch("/api/bankhour/", {
                method: 'POST',
                body: data
            })
            return response
        },
        async update(id: string, data: any) {
            return await $fetch("/api/bankhour/" + id, {
                method: 'PUT',
                body: data
            })
        },
        async delete(id: number) {
            return await $fetch("/api/bankhour/" + id, {
                method: 'DELETE',
            })
        },
        async fetchUsers() {
            return await $fetch(`/api/bankhour/user`).then((response: any) => {
                this.bankUsers = response
            })
        },
        async closeMonth(idUser: number, date: any): Promise<any> {
            return await $fetch(`/api/bankhour/user/${idUser}/close`, {
                method: 'POST',
                body: { date: date }
            })
        },
        /// repoerts
        async fetchHaursBalance() {
            return await $fetch("/api/reports/hoursBalance").then((response: any) => {
                this.hoursBalance = response
            })
        },
    },
})
