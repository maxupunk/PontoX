<template>
    <appBar title="Banco de horas de todos os usuarios" />
    <v-container>
        <v-skeleton-loader :loading="loading" type="table-heading, table-thead, table-tbody, table-tfoot">
            <v-data-table :items="bankHourStore.hoursBalance" :headers="headers">
                <template v-slot:item.minute="{ item }">
                    <v-chip :color="item.minute > 0 ? 'success' : 'error'" dark>
                        {{ minuteInHours(item.minute) }}
                    </v-chip>
                </template>

                <template v-slot:item.action="{ item }">
                    <v-btn icon="mdi-account" flat @click="router.push(`/bankhour/user/${item.id}`)"></v-btn>
                </template>
            </v-data-table>
        </v-skeleton-loader>
    </v-container>
</template>
<script setup lang="ts">
import { useBankHourStore } from '~/stores/BankHourStore';
import { snackbarShow } from '~/composables/useUi'
import { useRouter } from 'vue-router';
import minuteInHours from '~/utils/minuteInHours';

const router = useRouter();
const bankHourStore = useBankHourStore();

let loading = ref(true);
const headers = ref([
    { title: 'Usuario', value: 'name' },
    { title: 'Horas', value: 'minute' },
    { title: 'Ações', value: 'action', sortable: false },
]);

onMounted(() => {
    bankHourStore.fetchHaursBalance().catch((error: any) => {
        loading.value = true;
        snackbarShow(error, 'error')
    }).finally(() => {
        loading.value = false;
    });
});
</script>