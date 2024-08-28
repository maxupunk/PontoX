<template>
    <v-dialog v-model="dialog" persistent scrollable :fullscreen="$vuetify.display.xs || fullscreen">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" :icon="props.icon ? props.icon : 'mdi-plus'" flat></v-btn>
        </template>
        <v-card :loading="loading">
            <form @submit.prevent="save">
                <v-toolbar :title="formTitle">
                    <v-spacer></v-spacer>
                    <v-btn icon type="submit" :loading="loading">
                        <v-icon>mdi-content-save</v-icon>
                    </v-btn>
                    <v-btn icon @click="fullscreen = !fullscreen">
                        <v-icon v-if="!fullscreen">mdi-arrow-expand</v-icon>
                        <v-icon v-else>mdi-arrow-collapse</v-icon>
                    </v-btn>
                    <v-btn icon @click="dialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>

                <v-card-text>
                    <v-container>
                        <v-row>
                            <v-col cols="12" sm="12" md="12">
                                <v-select :items="userStore.users" item-value="id" item-title="name"
                                    v-model="bankHourStore.bankHour.userId" label="Usuario" required></v-select>
                            </v-col>
                            <v-col cols="12" sm="5" md="5">
                                <v-text-field type="date" v-model="bankHourStore.bankHour.date" label="Data"
                                    required></v-text-field>
                            </v-col>
                            <v-col cols="6" sm="4" md="4">
                                <v-number-input v-model="bankHourStore.bankHour.minute" label="minuto(s)"
                                    required></v-number-input>
                            </v-col>
                            <v-col cols="6" sm="3" md="3">
                                <v-text-field v-model="TotalHours" label="Horas"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                                <v-textarea v-model="bankHourStore.bankHour.observation"
                                    label="Observeção"></v-textarea>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                                <v-text-field v-model="bankHourStore.bankHour.createdAt" label="Criado em"
                                    readonly></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                                <v-text-field v-model="bankHourStore.bankHour.updatedAt" label="Atualizado em"
                                    readonly></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </form>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { snackbarShow } from '~/composables/useUi'
import { useBankHourStore } from '~/stores/BankHourStore';
import { useUserStore } from '~/stores/UserStore';
import minuteInHours from '~/utils/minuteInHours';

const emit = defineEmits(['reload'])

const props = defineProps<{
    id?: number,
    icon?: string
}>()

const userStore = useUserStore();
const bankHourStore = useBankHourStore();
const dialog = ref(false)
const fullscreen = ref(false)
const loading = ref(false)
const formTitle = ref(bankHourStore.bankHour.id ? 'Editando' : 'Criando')

const TotalHours = computed({
    get() {
        if (bankHourStore.bankHour.minute == undefined) {
            return ""
        }
        return minuteInHours(bankHourStore.bankHour.minute)
    },
    // setter
    set(newValue) {
        const [hours, minutes] = newValue.split(':').map(Number);
        if (hours != undefined && minutes != undefined) {
            const TotalMinutes = (hours * 60) + minutes;
            bankHourStore.bankHour.minute = TotalMinutes
        }
    }
})

watch(dialog, (val) => {
    if (val) {
        if (props.id) {
            bankHourStore.fetchBankHaur(props.id)
        } else {
            bankHourStore.bankHour = {}
        }
    }
})

onMounted(() => {
    userStore.fetchUsers()
})

async function save() {
    loading.value = true
    if (bankHourStore.bankHour.id) {
        loading.value = true
        await bankHourStore.update(bankHourStore.bankHour.id, bankHourStore.bankHour).then((response: any) => {
            snackbarShow(response.message, 'success')
            emit('reload')
            dialog.value = false
        }).finally(() => {
            loading.value = false
        })
    } else {
        await bankHourStore.create(bankHourStore.bankHour).then((response: any) => {
            snackbarShow(response.message, 'success')
            emit('reload')
            dialog.value = false
        }).catch(async (error) => {
            snackbarShow(error.data.message, 'error')
        }).finally(() => {
            loading.value = false
        })
    }
}
</script>