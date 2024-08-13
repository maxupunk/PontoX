<template>
    <v-container>
        <v-card>
            <v-card-actions>
                <v-container>
                    <v-row justify="center" align="center">
                        <v-col cols="6">
                            <v-date-input v-model="date" label="selecione o período" variant="underlined"
                                multiple="range" @update:model-value="fetchData" />
                        </v-col>
                        <v-col cols="auto">
                            <v-btn @click="fetchData" :loading="loading" icon="mdi-reload"></v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-actions>
            <v-card-subtitle>
                Relatorio resumo de horas trabalhadas
            </v-card-subtitle>
            <v-card-text>
                <v-table>
                    <thead>
                        <tr>
                            <th class="text-left">
                                Nome
                            </th>
                            <th class="text-left">
                                Horas / minutos
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in users" :key="item.id">
                            <td>
                                <graficoUsuario :label="item.name" :id="item.id" :dateStart="entryDateStart"
                                    :dateEnd="entryDateEnd"></graficoUsuario>
                            </td>
                            <td>
                                {{ item.hours }} hora(s)
                                <span v-if="item.minutes"> / {{ item.minutes }} minuto(s)</span>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>
        </v-card>
    </v-container>
</template>
<script setup lang="ts">
import { snackbarShow } from "~/composables/useUi"
import graficoUsuario from '~/components/reports/graficoUsuario.vue';

interface User {
    id: number;
    name: string;
    hours: number;
    minutes: number;
}

const loading = ref(false)
const date = ref<any>([])
const users = ref<User[]>([])

onMounted(() => {
    const { firstDay, lastDay } = getFirstLastDayMonth()
    date.value = [firstDay, lastDay]
    fetchData()
})

const entryDateStart = computed(() => {
    const { firstDay } = getFirstLastDayCalender(date.value)
    return firstDay
})

const entryDateEnd = computed(() => {
    const { lastDay } = getFirstLastDayCalender(date.value)
    return lastDay
})

async function fetchData() {
    loading.value = true;
    try {
        const res: any = await $fetch('/api/reports/resumo', {
            method: 'POST',
            body: {
                entryDateStart: entryDateStart.value,
                entryDateEnd: entryDateEnd.value,
            },
        });
        users.value = res;
    } catch (error: any) {
        snackbarShow(error, 'error');
    } finally {
        loading.value = false;
    }
};

</script>