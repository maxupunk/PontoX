<template>
    <v-dialog v-model="dialog" max-width="320">
        <form @submit.prevent="agree">
            <v-card>
                <v-toolbar dark color="warning" dense flat>
                    <v-toolbar-title>Senha de administradores</v-toolbar-title>
                </v-toolbar>
                <v-card-subtitle>Permitir gravação de dados no sistema.</v-card-subtitle>
                <v-card-text>
                    <v-text-field v-model="user.login" label="Login" type="text" autocomplete="login" required></v-text-field>
                    <v-text-field v-model="user.password" label="Senha" type="password"
                        autocomplete="new-password" required></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary darken-1" text type="submit">Confirmar</v-btn>
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
export default {
    data: () => ({
        dialog: false,
        resolve: null,
        reject: null,
        token: null,
        snackbar: {
            open: false,
            mensage: ''
        },
        user: {
            login: '',
            password: ''
        }
    }),
    methods: {
        open() {
            if (this.token) {
                return Promise.resolve(this.token)
            }
            
            this.dialog = true
            return new Promise((resolve, reject) => {
                this.resolve = resolve
                this.reject = reject
            })
        },
        async agree() {
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
            this.resolve(login.token)
            this.dialog = false
        },
        cancel() {
            this.resolve(false)
            this.dialog = false
        }
    }
}
</script>