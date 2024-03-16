<template>
    <v-dialog v-model="dialog" persistent scrollable :fullscreen="$vuetify.display.xs || fullscreen">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" :icon="icon" flat></v-btn>
        </template>
        <v-card :loading="loading">
            <v-toolbar :title="formTitle">
                <v-spacer></v-spacer>
                <v-btn icon @click="save" :loading="loading">
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
                            <v-text-field v-model="user.name" label="Nome" required></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="6">
                            <v-text-field v-model="user.email" label="E-mail"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field v-model="user.login" label="Login"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field v-model="user.password" label="Senha"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-select v-model="user.role" label="Perfil" :items="['colaborador', 'admin']" required />
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-switch v-model="user.status" label="Ativo" color="primary" />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </v-card>
        <!--Snackbar -->
        <v-snackbar v-model="snackbar.open" color="success" :timeout="3000">
            {{ snackbar.mensage }}
            <template v-slot:actions>
                <v-btn color="white" text @click="snackbar = false" append-icon>
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </v-dialog>
</template>

<script>
export default {
    props: {
        id: {
            type: Number,
            default: null
        },
        icon: {
            type: String,
            default: 'mdi-account-plus'
        }
    },
    data() {
        return {
            user: {},
            dialog: false,
            fullscreen: false,
            snackbar: {
                open: false,
                mensage: null
            },
            loading: false,
        };
    },
    watch: {
        dialog(val) {
            if (val) {
                if (this.id) {
                    this.loadUserData()
                } else {
                    this.user = {
                        id: null,
                        name: '',
                        email: '',
                        login: '',
                        password: '',
                        role: 'colaborador',
                        status: true
                    }
                }
            }
        },
    },
    computed: {
        formTitle() {
            return this.user.id === null ? 'Cadastro de usuario' : 'Atualizar usuario'
        },
    },
    methods: {
        async loadUserData() {
            this.loading = true
            const { user } = await $fetch(`/api/users/${this.id}`)
            this.user = user
            this.loading = false
        },
        async save() {
            this.loading = true
            if (this.user.id) {
                this.loading = true
                const UpdUser = await $fetch(`/api/users/${this.user.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(this.user)
                })
                if (UpdUser.changes) {
                    this.$emit('message', 'Usuário atualizado com sucesso!')
                }
            } else {
                const NewUser = await $fetch('/api/users', {
                    method: 'POST',
                    body: JSON.stringify(this.user)
                })
                if (NewUser.changes) {
                    this.$emit('message', 'Usuário cadastrado com sucesso!')
                    this.$router.push(`/users/${NewUser.lastInsertRowid}`)
                }
            }
            this.$emit('reload')
            this.dialog = false
        },
        close() {
            this.dialog = false
        },
    },
};
</script>