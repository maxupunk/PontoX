<template>
    <v-container>
        <v-skeleton-loader :loading="loading" type="table-heading, table-thead, table-tbody, table-tfoot">
            <v-data-table :items="bankHourStore.bankUser.rows" :headers="headers">
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title><b>{{ bankHourStore.bankUser?.user.name }}</b></v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-spacer></v-spacer>
                        <v-chip :color="bankHourStore.bankUser.total > 0 ? 'success' : 'error'" dark>{{ minuteInHours(bankHourStore.bankUser.total) }}</v-chip>
                        <v-btn icon="mdi-package-variant-closed-check" @click="closeMonth()"></v-btn>
                        <v-btn icon="mdi-reload" @click="bankHourStore.fetchBankHaursUser(idUser)"></v-btn>
                        <bank-hour-form @reload="bankHourStore.fetchBankHaursUser(idUser)" />
                    </v-toolbar>
                </template>

                <template v-slot:item.minute="{ item }: any">
                    <v-chip :color="item.minute > 0 ? 'success' : 'error'" dark>
                        {{ minuteInHours(item.minute) }}
                    </v-chip>
                </template>

                <template v-slot:item.action="{ item }: any">
                    <bank-hour-form :id="item.id" icon="mdi-pencil" @reload="bankHourStore.fetchBankHaursUser(idUser)" />
                    <v-btn icon="mdi-delete" flat @click="deleteBankHour(item.id)"></v-btn>
                </template>
            </v-data-table>
        </v-skeleton-loader>
    </v-container>
</template>
<script setup lang="ts">
import BankHourForm from '~/components/bankhour/form.vue';
import { useBankHourStore } from '~/stores/BankHourStore';
import { snackbarShow } from '~/composables/useUi'
import { useRoute } from 'vue-router';
import minuteInHours from '~/utils/minuteInHours';

const route = useRoute();
const bankHourStore = useBankHourStore();

const idUser: number = Number(route.params.id);
let loading = ref(true);
const headers = ref([
    { title: 'Data', value: 'date' },
    { title: 'Horas', value: 'minute' },
    { title: 'Ações', value: 'action', sortable: false },
]);

function closeMonth() {
    bankHourStore.closeMonth(idUser).then(() => {
        snackbarShow('Mês fechado com sucesso', 'success');
        bankHourStore.fetchBankHaursUser(idUser);
    }).catch((error: any) => {
        snackbarShow(error.data.message, 'warning');
    });
}

function deleteBankHour(id: number) {
    bankHourStore.delete(id).then(() => {
        snackbarShow('Registro deletado com sucesso', 'success');
        bankHourStore.fetchBankHaursUser(idUser);
    }).catch((error: any) => {
        snackbarShow(error.data.message, 'error');
    });
}

onMounted(() => {
    bankHourStore.fetchBankHaursUser(idUser).catch((error: any) => {
        loading.value = true;
        snackbarShow(error.data.message, 'error')
    }).finally(() => {
        loading.value = false;
    });
});
</script>