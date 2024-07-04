<template>
    <v-container>
        <v-skeleton-loader :loading="loading" type="table-heading, table-thead, table-tbody, table-tfoot">
            <v-data-table :items="users" :headers="headers">
                <template v-slot:top>
                    <v-toolbar flat>
                        <v-toolbar-title>Usuarios</v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-spacer></v-spacer>
                        <v-btn icon="mdi-reload" @click="loadUsers()"></v-btn>
                        <user-form @reload="loadUsers()" />
                    </v-toolbar>
                </template>

                <template v-slot:item.status="{ item }">
                    <v-chip :color="item.status ? 'success' : 'error'" dark>{{ item.status ? 'Ativo' : 'Inativo'
                        }}</v-chip>
                </template>

                <template v-slot:item.action="{ item }">
                    <user-form :id="item.id" icon="mdi-pencil" @reload="loadUsers()" />
                    <v-btn icon="mdi-camera-plus" flat @click="$router.push(`/users/${item.id}`)"></v-btn>
                </template>
            </v-data-table>
        </v-skeleton-loader>
    </v-container>
</template>

<script>
import userForm from '~/components/users/form.vue';
export default {
    components: { userForm },
    data() {
        return {
            loading: true,
            users: [],
            token: null,
            headers: [
                { title: 'ID', value: 'id' },
                { title: 'Nome', value: 'name' },
                { title: 'Email', value: 'email' },
                { title: 'Login', value: 'login' },
                { title: 'Permisao', value: 'role' },
                { title: 'Estatus', value: 'status' },
                { title: 'Ações', value: 'action', sortable: false },
            ],
        };
    },
    mounted() {
        this.loadUsers()
    },
    methods: {
        async loadUsers() {
            this.loading = true
            const { users } = await $fetch('/api/users')
            this.users = users;
            this.loading = false
        }
    },
};
</script>