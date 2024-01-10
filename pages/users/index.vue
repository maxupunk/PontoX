<template>
    <v-container>
        <v-overlay v-model="load.loading" class="align-center justify-center">
            <div class="text-center">
                <v-progress-circular color="primary" indeterminate></v-progress-circular>
            </div>
            <div class="text-center" style="color: white;">
                {{ load.mensage }}
            </div>
        </v-overlay>
        <v-data-table :items="users" :headers="headers">
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>Usuarios</v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialog" max-width="800px">
                        <template v-slot:activator="{ props }">
                            <v-btn color="primary" dark class="mb-2" v-bind="props">
                                Novo usuario
                            </v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="text-h4">{{ formTitle }}</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="editedUser.name" label="Nome" required></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-text-field v-model="editedUser.email" label="E-mail"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="4">
                                            <v-text-field v-model="editedUser.login" label="Login"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="4">
                                            <v-text-field v-model="editedUser.password" label="Senha"></v-text-field>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="4">
                                            <v-select v-model="editedUser.role" label="Perfil"
                                                :items="['colaborador', 'admin']" required />
                                        </v-col>
                                        <v-col cols="12" sm="6" md="4">
                                            <v-switch v-model="editedUser.status" label="Ativo" color="primary" />
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" @click="close">
                                    Cancel
                                </v-btn>
                                <v-btn color="blue-darken-1" variant="text" @click="save">
                                    Save
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>

            <template v-slot:item.action="{ item }">
                <v-icon class="me-2" @click="editItem(item)">
                    mdi-pencil
                </v-icon>
                <v-icon @click="$router.push(`/users/${item.id}`)">mdi-camera-plus</v-icon>
            </template>
        </v-data-table>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar.open" color="success" :timeout="3000">
            {{ snackbar.mensage }}
            <template v-slot:actions>
                <v-btn color="white" text @click="snackbar = false" append-icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
    <AdminPassowrd ref="adminPassowrd"></AdminPassowrd>
</template>
  
<script>
import AdminPassowrd from '~/components/AdminPassowrd.vue';

export default {
    data() {
        return {
            dialog: false,
            snackbar: {
                open: false,
                mensage: null
            },
            load: {
                loading: false,
                mensage: null
            },
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
            editedUser: {
                id: null,
                name: '',
                email: '',
                login: '',
                password: '',
                role: null,
                status: true,
            },
            defaultItem: {
                id: null,
                name: '',
                email: '',
                login: '',
                password: '',
                role: null,
                status: true,
            },
        };
    },
    components: {
        AdminPassowrd
    },
    mounted() {
        this.loadUsers()
    },
    watch: {
        dialog(val) {
            val || this.close()
        },
    },
    computed: {
        formTitle() {
            return this.editedUser.id === null ? 'Cadastro' : 'Atualizar'
        },
    },
    methods: {
        async openAdminPassowrd() {
            return await this.$refs.adminPassowrd.open().then((token) => {
                if (token) {
                    this.token = token
                }
            })
        },
        async loadUsers() {
            this.load.loading = true
            this.load.mensage = 'Buscando dados...'
            const response = await $fetch('/api/users')
            this.users = response.users;
            this.load.loading = false
        },
        async editItem(item) {
            this.load.loading = true
            this.load.mensage = 'Buscando usuario...'
            const response = await $fetch(`/api/users/${item.id}`)
            this.editedUser = response.user;
            this.dialog = true
            this.load.loading = false
        },
        async save() {
            await this.openAdminPassowrd()
            this.load.loading = true
            if (this.editedUser.id) {
                this.load.mensage = 'Atualizando usuario...'
                const UpdUser = await $fetch(`/api/users/${this.editedUser.id}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: this.token
                    },
                    body: JSON.stringify(this.editedUser)
                })
                if (UpdUser.changes) {
                    this.snackbar.open = true
                    this.snackbar.mensage = 'Usuário atualizado com sucesso!'
                }
            } else {
                this.load.mensage = 'Cadastrando usuario...'
                const NewUser = await $fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        Authorization: this.token
                    },
                    body: JSON.stringify(this.editedUser)
                })
                if (NewUser.changes) {
                    this.snackbar.open = true
                    this.snackbar.mensage = 'Usuário cadastrado com sucesso!'
                    this.$router.push(`/users/${NewUser.lastInsertRowid}`)
                }
            }
            this.loadUsers()
            this.close()
        },
        close() {
            this.dialog = false
            this.$nextTick(() => {
                this.editedUser = Object.assign({}, this.defaultItem)
            })
        },
    },
};
</script>