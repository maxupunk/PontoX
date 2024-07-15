import { defineStore } from 'pinia'
import { snackbarShow } from "~/composables/useUi"

export const usePeriodStore = defineStore('period', {
    state: () => ({
        days: [] as any,
        error: false
    }),

    actions: {
        async generate(userID: number, dates: any): Promise<void> {
            if (dates.value.length === 0) {
                snackbarShow('Por favor selecione um período!', 'error')
                return
            }
            const dateStart = dates.value[0].toISOString().split("T")[0]
            const dateEnd = dates.value[dates.value.length - 1].toISOString().split("T")[0]
            
            const response = await $fetch(`/api/users/${userID}/periodgenerate`, {
                method: 'POST',
                body: {
                    userID: userID,
                    dateStart: dateStart,
                    dateEnd: dateEnd
                }
            })
            if (response) {
                snackbarShow('Período gerado com sucesso!', 'success')
                const url = `/api/users/${userID}/period?dateStart=${dateStart}&dateEnd=${dateEnd}`
                const response: any = await $fetch(url)
                if (response) {
                    this.days = response
                }
            }
        },
        async fetch(userID: number, dates: any): Promise<void> {
            if (dates.value.length === 0) {
                snackbarShow('Por favor selecione um período!', 'error')
                return
            }
            const dateStart = dates.value[0].toISOString().split("T")[0]
            // get last date from array
            const dateEnd = dates.value[dates.value.length - 1].toISOString().split("T")[0]
            const response: any = await $fetch(`/api/users/${userID}/period?dateStart=${dateStart}&dateEnd=${dateEnd}`)
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
                day.workHours.map((workHour: any) => {
                    events.push({
                        id: workHour.id,
                        title: workHour.entryTime + ' - ' + workHour.departureTime,
                        start: new Date(day.date + 'T' + workHour.entryTime),
                        end: new Date(day.date + 'T' + workHour.departureTime),
                        color: 'green',
                        date: day.date,
                        // allDay: true,
                    })
                })
            })
            return events
        },
    }
})
