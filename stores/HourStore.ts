import { defineStore } from 'pinia'

export const useHourStore = defineStore('hour', {
    state: () => ({
        hour: {} as any,
        copyData: {} as any,
    }),

    actions: {
        async fetchWorkHour(workHourID: number): Promise<any> {
            return await $fetch(`/api/hour/${workHourID}`)
        },

        async createWorkHour(hourData: any, userId: number): Promise<any> {
            return await $fetch('/api/hour', {
                method: 'POST',
                body: {
                    entryTime: hourData.entryTime,
                    departureTime: hourData.departureTime,
                    date: hourData.date,
                    userId: userId
                }
            })
        },
        async updateWorkHour(hourData: any): Promise<any> {
            return await $fetch(`/api/hour/${hourData.id}`, {
                method: 'PUT',
                body: {
                    entryTime: hourData.entryTime,
                    departureTime: hourData.departureTime,
                }
            })
        },
        async deleteWorkHour(workHourID: number): Promise<any> {
            return await $fetch(`/api/hour/${workHourID}`, {
                method: 'DELETE'
            })
        },
        copy(hour: object) {
            this.copyData = hour
        },
        clearCopy() {
            this.copyData = {}
        }
    },

    getters: {

    }
})
