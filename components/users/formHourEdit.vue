<template>
    <v-dialog v-model="dialog" persistent scrollable :fullscreen="$vuetify.display.xs || fullscreen">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" v-if="label" color="success" variant="outlined" block>
                {{ label }}
            </v-btn>
            <v-chip class="ma-1" label v-bind="activatorProps" v-else>
                {{ data.title }}
            </v-chip>
        </template>
        <v-card :loading="loading">
            <v-toolbar :title="formTitle">
                <v-spacer></v-spacer>
                <v-btn v-if="data.id" icon @click="deleteWorkHour" :loading="loading" color="error">
                    <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
                <v-btn icon @click="save" :loading="loading" color="success">
                    <v-icon>mdi-content-save</v-icon>
                </v-btn>
                <v-btn icon @click="fullscreen = !fullscreen">
                    <v-icon v-if="!fullscreen">mdi-arrow-expand</v-icon>
                    <v-icon v-else>mdi-arrow-collapse</v-icon>
                </v-btn>
                <v-btn icon @click="close">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>

            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field v-model="hourData.entryTime" label="Horario de entrada"
                                required></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field v-model="hourData.departureTime" label="Horario de Saida"
                                required></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field v-model="hourData.date" label="data"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { snackbarShow } from "~/composables/useUi"
import { useHourStore } from '~/stores/HourStore';

const hourStore = useHourStore()

const props = defineProps({
    data: { type: Object, default: () => ({}) },
    userId: { type: Number, default: 0, required: true },
    label: { type: String, default: '' },
})

const emit = defineEmits(["update"]);

let hourData = reactive({
    id: null as number | null,
    entryTime: '' as string,
    departureTime: '' as string,
    workDayId: '' as number | string,
    date: '' as string | null
})

const dialog = ref(false)
const fullscreen = ref(false)
const loading = ref(false)

watch(dialog, async (val) => {
    if (val) {
        if (props.data.id) {
            loading.value = true
            hourStore.fetchWorkHour(props.data.id).then((response) => {
                Object.assign(hourData, {
                    id: response.id,
                    entryTime: response.entryTime,
                    departureTime: response.departureTime,
                    workDayId: response.workDayId,
                    date: response.workDay.date
                })
            }).finally(() => {
                loading.value = false
            })
        } else {
            Object.assign(hourData,
                {
                    id: null,
                    entryTime: '',
                    departureTime: '',
                    workDayId: '',
                    date: ''
                })
        }
    }
})

const formTitle = computed(() => {
    return hourData.id !== null ? 'Editar horario' : 'Novo Horario'
})

function save() {
    loading.value = true
    if (props.data.id) {
        hourStore.updateWorkHour(hourData).then(() => {
            snackbarShow('Horario atualizado com sucesso', 'success')
            emit('update')
        }).finally(() => {
            close()
        })
    } else {
        hourStore.createWorkHour(hourData, props.userId).then(() => {
            snackbarShow('Horario criado com sucesso', 'success')
            emit('update')
        }).finally(() => {
            close()
        })
    }
}

async function deleteWorkHour() {
    loading.value = true
    await hourStore.deleteWorkHour(props.data.id).then(() => {
        snackbarShow('Horario deletado com sucesso', 'success')
        emit('update')
    }).finally(() => {
        close()
    })
}

function close() {
    dialog.value = false
    loading.value = false
}
</script>