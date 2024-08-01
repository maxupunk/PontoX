<template>
    <v-card :loading="loading">
        <v-toolbar>
            <v-toolbar-title class="text-uppercase">Horários</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-btn icon @click="saveWeek">
                    <v-icon>mdi-content-save</v-icon>
                </v-btn>
            </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
            <v-card variant="text" v-for="(hours, dayName) in weekStore.getWeek" :key="dayName">
                <v-toolbar flat density="compact">
                    <v-toolbar-title class="text-uppercase">{{ dayName }}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn v-if="hourStore.copyData.entryTime" icon
                            @click="weekStore.addHour(dayName, hourStore.copyData)">
                            <v-icon>mdi-content-paste</v-icon>
                            <v-tooltip activator="parent" location="start">
                                {{ hourStore.copyData.entryTime }} - {{ hourStore.copyData.departureTime }}
                            </v-tooltip>
                        </v-btn>
                        <v-btn icon @click="weekStore.addHour(dayName)">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-card dense v-for="(item, i) in hours" :key="i" :color="item.color">
                    <v-card-text>
                        <v-row class="d-flex align-center">
                            <v-col cols="2">
                                <h3>{{ i + 1 }}</h3>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field type="time" v-model="item.entryTime" label="horário de entrada"
                                    required></v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field type="time" v-model="item.departureTime" label="horário de saida"
                                    :min="item.entryTime" required></v-text-field>
                            </v-col>
                            <v-col cols="1">
                                <v-btn icon variant="text" @click="hourStore.copy(item)">
                                    <v-icon>mdi-content-copy</v-icon>
                                    <v-tooltip activator="parent">copiar horario</v-tooltip>
                                </v-btn>
                            </v-col>
                            <v-col cols="1">
                                <v-btn icon variant="text" @click="weekStore.removeHour(dayName, i)">
                                    <v-icon>mdi-delete-outline</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-card>
        </v-card-text>
    </v-card>
</template>
<script setup lang="ts">
import { defineComponent } from 'vue'
import { snackbarShow } from "~/composables/useUi"
import InputTimePick from '~/components/crud/InputTimePick.vue';
import { useWeekStore } from '~/stores/WeekStore';
import { useHourStore } from '~/stores/HourStore';

const weekStore = useWeekStore()
const hourStore = useHourStore()
defineComponent({
    name: 'weekManager',
    components: { InputTimePick },
})

const props = defineProps({
    userid: { type: Number, required: true }
})

let loading = ref(true)

onMounted(() => {
    weekStore.loadWeek(props.userid).finally(() => {
        loading.value = false
    })
})

function saveWeek() {
    loading.value = true
    weekStore.saveWeek(props.userid).then((result) => {
        if (result) {
            snackbarShow('Semana salva com sucesso', 'success')
            hourStore.copyData = {}
        }
    }).finally(() => {
        loading.value = false
    })
}
</script>