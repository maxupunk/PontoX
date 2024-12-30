import { defineStore } from 'pinia'
import buildQueryString from '~/utils/buildQueryString'

export const usePointStore = defineStore('point', {
    state: () => ({
        point: {} as any,
        points: [] as any[],
        pagination: {} as any,
        search: '',
    }),

    actions: {
        async fetchPoints(reset?: boolean) {
            if (this.pagination.page !== undefined) {
                this.pagination.page++
            }
            
            if (reset) {
                this.pagination.page = 1
            }

            if (this.pagination.page === 1) {
                this.points = []
            }

            if (this.search) {
                this.pagination.search = this.search
            }
            const queryString = buildQueryString(this.pagination)
            return await $fetch(`/api/points${queryString}`).then((response: any) => {
                this.points = [...this.points, ...response.data]
                this.pagination = response.pagination
                return response.pagination
            })
        },
        async fetchPoint(id: number) {
            this.point = await $fetch(`/api/points/${id}`)
        },
        async createPoint(point: any) {
            const response = await $fetch('/api/points', {
                method: 'POST',
                body: JSON.stringify(point),
            })
            return response
        },
        async updatePoint(point: any) {
            const response = await $fetch(`/api/points/${point.id}`, {
                method: 'PUT',
                body: JSON.stringify(point),
            })
            return response
        },
    },
})
