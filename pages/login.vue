<template>
    <v-dialog v-model="dialog" max-width="420" persistent>
        <form @submit.prevent="doLogin">
            <v-card>
                <v-toolbar dark color="primary" dense flat>
                    <v-toolbar-title>Senha de administradores</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-text-field v-model="user.login" label="Login" type="text" autocomplete="login"
                        required></v-text-field>
                    <v-text-field v-model="user.password" label="Senha" type="password" autocomplete="new-password"
                        required></v-text-field>
                    <v-checkbox label="permanecer logado?" v-model="user.remember"></v-checkbox>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn block color="primary" type="submit">Confirmar</v-btn>
                    <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
        </form>
    </v-dialog>
    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.open" color="error" :timeout="3000">
        {{ snackbar.mensage }}
        <template v-slot:actions>
            <v-btn color="white" text @click="snackbar = false" append-icon>
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </template>
    </v-snackbar>
</template>
  
<script>
import { useAuthStore } from '@/stores/auth.ts'

export default {
    data: () => ({
        authStore: null,
        dialog: true,
        resolve: null,
        reject: null,
        token: null,
        snackbar: {
            open: false,
            mensage: ''
        },
        user: {
            login: '',
            password: '',
            permanente: false
        }
    }),
    mounted() {
        this.authStore = useAuthStore()
        this.open()
    },
    methods: {
        open() {
            if (this.authStore.getToken) {
                this.$router.push('/');
            }
        },
        async doLogin() {
            const login = await $fetch('/api/login', {
                method: 'POST',
                body: JSON.stringify(this.user)
            })
            if (!login) {
                this.snackbar = {
                    open: true,
                    mensage: 'Login ou senha inválidos!'
                }
                return
            }
            this.token = login.token
            this.authStore.setToken(login.token, this.user.remember)
            this.$router.push('/');
        },
        cancel() {
            this.dialog = false
        }
    }
}
</script>