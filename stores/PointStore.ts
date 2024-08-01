import { defineStore } from 'pinia'

export const usePointStore = defineStore('point', {
    state: () => ({
        point: {} as any,
        points: [] as any[],
    }),

    actions: {
        async fetchPoints() {
            const response = await $fetch('/api/points')
            this.points = response.points
        },
        async fetchPoint(id: number) {
            const response = await $fetch(`/api/points/${id}`)
            this.point = response.point
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
