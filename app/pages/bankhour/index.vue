<template>
    <appBar title="Sobre" />
    <v-container>
        <v-infinite-scroll :onLoad="load">
            <v-data-table-virtual :items="bankHourStore.bankHours" :headers="headers" :loading="loading">
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title>Banco de horas</v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-spacer></v-spacer>
                        <v-btn icon="mdi-store-clock-outline" @click="router.push('/bankhour/closemonth')"></v-btn>
                        <v-btn icon="mdi-reload" @click="bankHourStore.fetchBankHaurs()"></v-btn>
                        <bank-hour-form @reload="bankHourStore.fetchBankHaurs()" />
                    </v-toolbar>
                </template>

                <template v-slot:item.minute="{ item }">
                    <v-chip :color="item.minute > 0 ? 'success' : 'error'" dark>
                        {{ minuteInHours(item.minute) }}
                    </v-chip>
                </template>

                <template v-slot:item.date="{ item }">
                        {{ formatDate(item.date) }}
                </template>

                <template v-slot:item.action="{ item }">
                    <bank-hour-form :id="item.id" icon="mdi-pencil" @reload="bankHourStore.fetchBankHaurs()" />
                    <v-btn icon="mdi-account" flat @click="router.push(`/bankhour/user/${item.user.id}`)"></v-btn>
                    <v-btn icon="mdi-delete" flat @click="deleteBankHour(item.id)"></v-btn>
                </template>
            </v-data-table-virtual>
        </v-infinite-scroll>
        <dialog-delete ref="dialogRef" />
    </v-container>
</template>
<script setup lang="ts">
import BankHourForm from '~/components/bankhour/form.vue';
import { useBankHourStore } from '~/stores/BankHourStore';
import { snackbarShow } from '~/composables/useUi'
import { useRouter } from 'vue-router';
import minuteInHours from '~/utils/minuteInHours';
import dialogDelete from '~/components/dialogDeleteConfirmation.vue';
import { formatDate } from "~/utils/formatDateBr";

const dialogRef = ref();

const router = useRouter();

const bankHourStore = useBankHourStore();

let loading = ref(false);
const headers = ref([
    { title: 'Usuario', value: 'user.name' },
    { title: 'Data', value: 'date' },
    { title: 'Horas', value: 'minute' },
    { title: 'Ações', value: 'action', sortable: false },
]);

async function deleteBankHour(id: number) {
    const confirmed = await dialogRef.value.open();
    if (confirmed) {
        bankHourStore.delete(id).then(() => {
            snackbarShow('Registro deletado com sucesso', 'success');
            bankHourStore.fetchBankHaurs();
        }).catch((error: any) => {
            snackbarShow(error.data.message, 'error');
        });
    }
}

function load({ done }: any) {
    loading.value = true
    bankHourStore.fetchBankHaurs().then((res: any) => {
        if (res) {
            done('ok')
        } else {
            done('empty')
        }
    }).catch((error: any) => {
        snackbarShow(error, 'error')
        done('empty')
    }).finally(() => {
        loading.value = false
    })
}
</script>