import { defineStore } from 'pinia'
import buildQueryString from '~/utils/buildQueryString'
import blobToBase64 from '~/utils/blobToBase64'

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
            }).then((response: any) => {
                if (response.data) {
                    this.points.unshift(response.data)
                }
                return response
            })
            return response
        },
        async updatePoint(point: any) {
            const response = await $fetch(`/api/points/${point.id}`, {
                method: 'PUT',
                body: JSON.stringify(point),
            }).then((response: any) => {
                if (response.data) {
                    const index = this.points.findIndex((p) => p.id === point.id)
                    this.points[index] = response.data
                }
                return response
            })
            return response
        },
        async deletePoint(id: number) {
            return await $fetch(`/api/points/${id}`, {
                method: 'DELETE',
            }).then((response: any) => {
                const index = this.points.findIndex((p) => p.id === id)
                this.points.splice(index, 1)
                return response
            })
        },
        async fetchImage(userId: Number, image: any) {
            if (!image) {
                return "/noimage.jpg"
            }
            try {
                const img = await $fetch(`/api/imagens/${userId}/${image}`)
                return blobToBase64(img)
            } catch (e: any) {
                return "/noimage.jpg"
            }
        },
    },
})