<template>
    <v-container>
        <v-card>
            <v-card-actions>
                <v-row justify="center" align="center">
                    <v-col cols="6">
                        <v-date-input v-model="date" label="selecione o período" variant="underlined" multiple="range"
                            @update:model-value="refresh" />
                    </v-col>
                    <v-col cols="auto">
                        <v-btn @click="refresh" :loading="loading" icon="mdi-reload"></v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn @click="details = !details" icon="mdi-card-account-details-outline"></v-btn>
                    </v-col>
                </v-row>
            </v-card-actions>
            <v-card-subtitle>
                Relatorio de situação de horas trabalhadas
            </v-card-subtitle>
            <v-card-text>
                <v-card v-for="item in workDate" :key="item.name" class="ma-2" variant="outlined">
                    <v-card-text>
                        <v-row style="text-transform: capitalize;">
                            <v-col cols="12">
                                <h4>{{ item.name }}</h4>
                            </v-col>
                        </v-row>
                        <v-row v-if="details" align="center">
                            <v-col cols="3">
                                Trabalhado: <h4>{{ item.workedHours }}H {{ item.workedMinutes }}M</h4>
                            </v-col>
                            <v-col cols="3">
                                Pendente: <h4>{{ item.workPendingHours - item.workedHours }}H {{ item.workPendingMinutes
                                    - item.workPendingMinutes }}M</h4>
                            </v-col>
                            <v-col cols="3">
                                Total: <h4>{{ item.workPendingHours }}H {{ item.workPendingMinutes }}M</h4>
                            </v-col>
                            <v-col cols="3">
                                <v-chip v-if="item.inWork" color="success" variant="tonal">Em trabalho</v-chip>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <v-progress-linear :model-value="item.percentage" height="20" striped
                                    :color="item.color">
                                    <template v-slot:default="{ value }">
                                        <strong>{{ value }}%</strong>
                                    </template>
                                </v-progress-linear>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">

const loading = ref(false)
const details = ref(true)
const date = ref([])
const users = ref([])

const workDate = computed(() => {
    return users.value.map((item: any) => {
        const colorPercentage = color(item.percentage);
        return {
            name: item.name,
            workedHours: item.workedHours,
            workedMinutes: item.workedMinutes,
            workPendingHours: item.workPendingHours,
            workPendingMinutes: item.workPendingMinutes,
            inWork: item.inWork,
            percentage: item.percentage,
            color: colorPercentage,
        };
    });
})

const refresh = () => {
    const { firstDay, lastDay } = getFirstLastDayCalender(date.value)
    fetchData(firstDay, lastDay);
}

const fetchData = async (entryDateStart: any, entryDateEnd: any) => {
    loading.value = true;
    await $fetch('/api/reports/hoursmission', {
        method: 'POST',
        body: {
            entryDateStart: entryDateStart,
            entryDateEnd: entryDateEnd,
        },
    }).then((res: any) => {
        if (res) {
            users.value = res;
        }
    }).finally(() => {
        loading.value = false;
    });
}

const color = (percent: any) => {
    let color;
    if (percent <= 10) {
        color = 'green';
    } else if (percent <= 20) {
        color = 'light-green';
    } else if (percent <= 30) {
        color = 'lime';
    } else if (percent <= 40) {
        color = 'yellow';
    } else if (percent <= 50) {
        color = 'amber';
    } else if (percent <= 60) {
        color = 'orange';
    } else if (percent <= 70) {
        color = 'deep-orange';
    } else if (percent <= 80) {
        color = 'red';
    } else if (percent <= 90) {
        color = 'dark-red';
    } else {
        color = 'red darken-4';
    }
    return color
}


</script>