import { defineStore } from 'pinia'
import type { Week } from '~/interfaces/Week'
import { snackbarShow } from "~/composables/useUi"

export const useWeekStore = defineStore('Calendar', {
    state: () => ({
        week: {} as Week,
        error: false
    }),

    actions: {
        async loadWeek(userID: number) {
            const response: any = await $fetch("/api/users/" + userID + "/daysweek")
            if (response) {
                this.week = response
            }
        },
        addHour(day: any) {
            this.week[day].push({ entryTime: '08:00', departureTime: '12:00' })
        },
        removeHour(day: any, index: number) {
            this.week[day].splice(index, 1)
        },
        saveWeek(userID: number) {
            if (this.error) {
                snackbarShow('Existe(m) conflito(s) no(s) horario(s), precisa corrigir os conflitos para salvar os dados!', 'error')
                return false
            }
            const url: string = `/api/users/${userID}/daysweek`
            return $fetch(url, {
                method: 'PUT',
                body: this.week
            })
        },
    },

    getters: {
        getWeek(): Week {
            Object.keys(this.week).forEach(day => {
                const daySlots = this.week[day];
                daySlots.forEach((timeSlot: any, index: number) => {
                    const { entryTime, departureTime } = timeSlot;
                    // verifica se a entrada é maior que a saída
                    const entryTimeDate = new Date(`2023-01-01T${entryTime}`);
                    const departureTimeDate = new Date(`2023-01-01T${departureTime}`);
                    if (entryTimeDate >= departureTimeDate) {
                        timeSlot.color = 'error';
                        this.error = true;
                    } else {
                        delete timeSlot.color
                        this.error = false;
                    }
                    // Verifica choque de horário
                    for (let i = 0; i < daySlots.length; i++) {
                        if (i !== index) {
                            const compareSlot = daySlots[i];
                            const entryTimeCompare = new Date(`2023-01-01T${compareSlot.entryTime}`);
                            const departureTimeCompare = new Date(`2023-01-01T${compareSlot.departureTime}`);
                            const entryTimeDate = new Date(`2023-01-01T${entryTime}`);
                            const departureTimeDate = new Date(`2023-01-01T${departureTime}`);
                            // Se houver sobreposição, marca com erro
                            if ((entryTimeDate <= departureTimeCompare && entryTimeDate >= entryTimeCompare) ||
                                (departureTimeDate >= entryTimeCompare && departureTimeDate <= departureTimeCompare)) {
                                compareSlot.color = 'warning';
                                timeSlot.color = 'warning';
                                this.error = true;
                            } else {
                                delete compareSlot.color;
                                delete timeSlot.color;
                                this.error = false;
                            }
                        }
                    }
                });
            });
            return this.week;
        }
    }
})
