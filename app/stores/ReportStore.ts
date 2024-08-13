import { defineStore } from 'pinia'
import { snackbarShow } from "~/composables/useUi"

export const useReportStore = defineStore('report', {
    state: () => ({
        hourByhours: [] as any,
    }),

    actions: {
        async loadHorusByHours(userID: number, dates: any): Promise<void> {
            const { firstDay, lastDay } = getFirstLastDayCalender(dates.value)
            return await $fetch("/api/reports/hourbyhours", {
                method: 'POST',
                body: {
                    userID: userID,
                    dateStart: firstDay,
                    dateEnd: lastDay
                }
            }).then((response: any) => {
                this.hourByhours = response
            }).catch((error: any) => {
                snackbarShow(error, 'error')
            })
        },
    },
})
