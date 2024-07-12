<template>
    <v-card>
        <v-toolbar>
            <v-toolbar-title class="text-uppercase">Horários</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
                <v-btn icon @click="weekStore.saveWeek(userid)">
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
                        <v-btn icon @click="weekStore.addHour(dayName)">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-card dense v-for="(item, i) in hours" :key="i" :color="item.color">
                    <v-card-text>
                        <v-row class="d-flex align-center">
                            <v-col cols="1">
                                <h3>{{ i + 1 }}</h3>
                            </v-col>
                            <v-col cols="5">
                                <input-time-pick v-model="item.entryTime" label="horário de entrada" />
                            </v-col>
                            <v-col cols="5">
                                <input-time-pick v-model="item.departureTime" :min="item.entryTime" label="horário de saida" />
                            </v-col>
                            <v-col cols="1">
                                <v-btn icon variant="text" @click="weekStore.removeHour(dayName, i)">
                                    <v-icon>mdi-minus</v-icon>
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
import InputTimePick from '~/components/crud/InputTimePick.vue';
import { useWeekStore } from '~/stores/WeekStore';

const weekStore = useWeekStore()
defineComponent({
    name: 'weekManager',
    components: { InputTimePick },
})

const props = defineProps({
    userid: { type: Number, required: true }
})

onMounted(() => {
    weekStore.loadWeek(props.userid)
})
</script>