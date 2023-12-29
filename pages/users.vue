<template>
    <v-container>
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
                                            <v-text-field v-model="editedUser.name" label="Nome"></v-text-field>
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
                                                :items="['funcionario', 'admin']" />
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
                    <v-dialog v-model="dialogDelete" max-width="500px">
                        <v-card>
                            <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Cancel</v-btn>
                                <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">OK</v-btn>
                                <v-spacer></v-spacer>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>


            <template v-slot:item.action="{ item }">
                <v-icon class="me-2" @click="editItem(item)">
                    mdi-pencil
                </v-icon>
            </template>
        </v-data-table>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar" color="success" :timeout="3000">
            {{ snackbarText }}
            <template v-slot:actions>
                <v-btn color="white" text @click="snackbar = false" append-icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>
  
<script>
export default {
    data() {
        return {
            dialog: false,
            dialogDelete: false,
            editedIndex: -1,
            snackbar: false,
            users: [],
            headers: [
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
    async created() {
        this.loadUsers()
    },
    watch: {
        dialog(val) {
            val || this.close()
        },
        dialogDelete(val) {
            val || this.closeDelete()
        },
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'Cadastro' : 'Atualizar'
        },
    },
    methods: {
        async loadUsers() {
            const response = await $fetch('/api/users')
            this.users = response.users;
        },
        async editItem(item) {
            const response = await $fetch(`/api/users/${item.id}`)
            this.editedUser = response.user;
            this.dialog = true
        },
        async save() {
            if (this.editedIndex === -1) {
                const NewUser = await $fetch('/api/users', {
                    method: 'POST',
                    body: JSON.stringify(this.editedUser)
                })
                if (NewUser.lastInsertRowid) {
                    this.snackbar = true
                    this.snackbarText = 'Usuário cadastrado com sucesso!'
                }
            } else {
                const UpdUser = await $fetch(`/api/users/${this.editedUser.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(this.editedUser)
                })
                if (UpdUser.changes) {
                    this.snackbar = true
                    this.snackbarText = 'Usuário atualizado com sucesso!'
                }
            }
            this.loadUsers()
            this.close()
        },
        close() {
            this.dialog = false
            this.$nextTick(() => {
                this.editedUser = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
    },
};
</script>