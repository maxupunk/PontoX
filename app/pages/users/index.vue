<template>
    <v-container>
        <v-skeleton-loader :loading="loading" type="table-heading, table-thead, table-tbody, table-tfoot">
            <v-data-table :items="userStore.users" :headers="headers" items-per-page="100">
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title>Usuarios</v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-spacer></v-spacer>
                        <v-btn icon="mdi-reload" @click="userStore.fetchUsers()"></v-btn>
                        <user-form @reload="userStore.fetchUsers()" />
                    </v-toolbar>
                </template>

                <template v-slot:item.status="{ item }">
                    <v-chip :color="item.status ? 'success' : 'error'" dark>{{ item.status ? 'Ativo' :
                        'Inativo' }}</v-chip>
                </template>

                <template v-slot:item.action="{ item }">
                    <user-form :id="item.id" icon="mdi-pencil" @reload="userStore.fetchUsers()" />
                    <v-btn icon="mdi-store-clock-outline" flat
                        @click="router.push(`/bankhour/user/${item.id}`)"></v-btn>
                    <v-btn icon="mdi-calendar-account" flat @click="router.push(`/users/${item.id}/calendar`)"></v-btn>
                    <v-btn icon="mdi-camera-plus" flat @click="router.push(`/users/${item.id}`)"></v-btn>
                </template>
            </v-data-table>
        </v-skeleton-loader>
    </v-container>
</template>
<script setup lang="ts">
import UserForm from '~/components/users/form.vue';
import { useUserStore } from '~/stores/UserStore';
import { snackbarShow } from '~/composables/useUi'
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

let loading = ref(true);
const headers = ref([
    { title: 'ID', value: 'id' },
    { title: 'Nome', value: 'name' },
    { title: 'Email', value: 'email' },
    { title: 'Login', value: 'login' },
    { title: 'Permisao', value: 'role' },
    { title: 'Estatus', value: 'status' },
    { title: 'Ações', value: 'action', sortable: false },
]);

onMounted(async () => {
    await userStore.fetchUsers().catch((error: any) => {
        snackbarShow(error, 'error')
    }).finally(() => {
        loading.value = false;
    });
});
</script>