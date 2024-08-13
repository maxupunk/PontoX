<template>
    <v-container>
        <v-card>
            <v-card-actions>
                <v-row justify="center" align="center">
                    <v-col cols="5">
                        <v-autocomplete v-model="user" :items="userStore.users" item-title="name" item-value="id"
                            label="Selecione o usuário" variant="underlined" @update:modelValue="load" />
                    </v-col>
                    <v-col cols="5">
                        <v-date-input v-model="date" label="selecione o período" variant="underlined" multiple="range"
                            @update:modelValue="load" />
                    </v-col>
                    <v-col cols="auto">
                        <v-btn @click="load" :loading="loading" icon="mdi-reload"></v-btn>
                    </v-col>
                </v-row>
            </v-card-actions>
            <v-card-subtitle>
                Relatorio de situação de horas trabalhadas
            </v-card-subtitle>
            <v-card-text>
                <v-expansion-panels>
                    <v-expansion-panel v-for="item in reportStore.hourByhours" :key="item.id">
                        <v-expansion-panel-title>
                            <v-card-title>
                                {{ item.date }} | {{ item.workedHours.toString().padStart(2, '0') }}:{{
                                    item.workedMinutes.toString().padStart(2, '0') }} | {{ item.delayEntryTime }}M | {{
                                    item.delayDepartureTime }}M
                            </v-card-title>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <v-card flat>
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="6">
                                            <h3>Horario para entrada:</h3>
                                            {{ item.entryTyme }}
                                        </v-col>
                                        <v-col cols="6">
                                            <h3>Horario para saida:</h3>
                                            {{ item.departureTime }}
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="4">
                                            <h3>Horas trabalhada(s):</h3>
                                            {{ item.workedHours.toString().padStart(2, '0') }}:{{
                                                item.workedMinutes.toString().padStart(2, '0') }}
                                        </v-col>
                                        <v-col cols="4">
                                            <h3>Atraso na entrada:</h3>
                                            {{ item.delayEntryTime }} Minutos
                                        </v-col>
                                        <v-col cols="4">
                                            <h3>Atraso na saida:</h3>
                                            {{ item.delayDepartureTime }} Minutos
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                            <v-card>
                                <v-card-title>
                                    Ponto (s)
                                </v-card-title>
                                <v-card-text>
                                    <v-row v-for="(point, key) in item.points"
                                        class="align-center justify-space-around">
                                        <v-col cols="1">
                                            <h2>{{ key + 1 }}</h2>
                                        </v-col>
                                        <v-col cols="3">
                                            <h3>Data entrada:</h3>
                                            {{ point.entryDate }}
                                        </v-col>
                                        <v-col cols="3">
                                            <h3>Data saida:</h3>
                                            {{ point.departureDate }}
                                        </v-col>
                                        <v-col cols="2">
                                            <h3>Entrada:</h3>
                                            {{ point.entryTime }}
                                        </v-col>
                                        <v-col cols="2">
                                            <h3>Saida:</h3>
                                            {{ point.departureTime }}
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { snackbarShow } from "~/composables/useUi"
import { useUserStore } from '~/stores/UserStore';
import { useReportStore } from '~/stores/ReportStore';
const userStore = useUserStore()
const reportStore = useReportStore()

const loading = ref(false)
const date = ref<[Date, Date]>([new Date(), new Date()]);
const user = ref<number | null>(null)

onMounted(() => {
    userStore.fetchUsers()
    const { firstDay, lastDay } = getFirstLastDayMonth()
    date.value = [firstDay, lastDay]
})

function load() {
    if (user.value && date.value) {
        reportStore.loadHorusByHours(user.value, date)
    } else {
        if (!user.value) {
            snackbarShow('Selecione um usuário')
        } else {
            snackbarShow('Selecione um período')
        }
    }
}

</script>