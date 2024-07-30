<template>
    <v-card :loading="loading">
        <v-card-text>
            <v-row class="align-center justify-space-around">
                <v-col cols="8">
                    <v-date-input v-model="date" label="selecione o período" variant="underlined" clearable
                        multiple="range" @update:model-value="fetchPeriod" />
                </v-col>
                <v-col cols="1">
                    <v-btn @click="fetchPeriod" icon="mdi-refresh" variant="text"></v-btn>
                </v-col>
                <v-col cols="3">
                    <v-btn @click="generate" color="primary" variant="outlined" block>Gerar</v-btn>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-text>
            <formHourEdit label="criar horario avulso" :user-id="userid" @update="fetchPeriod" />
            <v-calendar disabled :model-value="date" :events="periodStore.getEvents"
                @update:modelValue="calendarUpdate">
                <template v-slot:event="{ event }">
                    <div class="d-flex justify-center">
                        <formHourEdit :data="event" :user-id="userid" @update="fetchPeriod" />
                    </div>
                </template>
            </v-calendar>
        </v-card-text>
    </v-card>
</template>
<script setup lang="ts">
import { defineComponent } from 'vue'
import { usePeriodStore } from '~/stores/PeriodStore';
import { snackbarShow } from "~/composables/useUi"
import formHourEdit from './formHourEdit.vue';

const periodStore = usePeriodStore()
defineComponent({
    name: 'periodGenerator',
    components: {
        formHourEdit
    }
})

const props = defineProps({
    userid: { type: Number, required: true }
})

const date = ref<Date[]>([])
const loading = ref(false)

onMounted(() => {
    fetchPeriod()
})

function calendarUpdate(value: Date[]) {
    const { firstDay, lastDay } = getFirstLastDayMonth(value[0])
    date.value = [firstDay, lastDay]
    fetchPeriod()
}

function fetchPeriod() {
    loading.value = true
    if (!date.value.length) {
        const { firstDay, lastDay } = getFirstLastDayMonth()
        date.value = [firstDay, lastDay]
    }
    periodStore.fetch(props.userid, date).finally(() => {
        loading.value = false
    })
}

function generate() {
    loading.value = true
    periodStore.generate(props.userid, date).then((response) => {
        if (response && response.message) {
            snackbarShow(response.message, 'success')
            fetchPeriod()
        }
    }).catch((error: any) => {
        snackbarShow(error.response._data.message, 'error')
    }).finally(() => {
        loading.value = false
    })
}
</script>