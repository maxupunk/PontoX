import { defineStore } from 'pinia'
import { snackbarShow } from "~/composables/useUi"

export const usePeriodStore = defineStore('period', {
    state: () => ({
        days: [] as any,
        error: false
    }),

    actions: {
        async generate(userID: number, dates: any) {
            if (dates.value.length === 0) {
                snackbarShow('Por favor selecione um período!', 'error')
                return
            }
            const { firstDay, lastDay } = getFirstLastDayCalender(dates.value)

            const response = await $fetch(`/api/users/${userID}/periodgenerate`, {
                method: 'POST',
                body: {
                    userID: userID,
                    dateStart: firstDay,
                    dateEnd: lastDay
                }
            })
            return response
        },
        async fetch(userID: number, dates: any): Promise<void> {
            if (dates.value.length === 0) {
                snackbarShow('Por favor selecione um período!', 'error')
                return
            }
            const { firstDay, lastDay } = getFirstLastDayCalender(dates.value)
            const response: any = await $fetch(`/api/users/${userID}/period?dateStart=${firstDay}&dateEnd=${lastDay}`)
            if (response) {
                this.days = response
            }
        },
        async delete(workHourID: number): Promise<void> {
            const url = `/api/hour/${workHourID}`
            const response = await $fetch(url, {
                method: 'DELETE'
            })
            if (response) {
                snackbarShow('Horário deletado com sucesso!', 'success')
            }
        }
    },

    getters: {
        getEvents: (state) => {
            let events: any = []
            state.days.map((day: any) => {
                events.push({
                    id: day.id,
                    title: day.entryTime + ' - ' + day.departureTime,
                    start: new Date(day.date + 'T' + day.entryTime),
                    end: new Date(day.date + 'T' + day.departureTime),
                    color: 'green',
                    date: day.date,
                    // allDay: true,
                })
            })
            // ordena os eventos por título
            events.sort((a:any, b:any) => {
                if (a.title < b.title) {
                    return -1;
                }
                if (a.title > b.title) {
                    return 1;
                }
                return 0;
            });
            return events
        },
    }
})
