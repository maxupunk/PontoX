<template>
  <v-app id="inspire">
    <v-main>
      <NuxtPage />
    </v-main>

    <v-dialog :model-value="!isLoged" max-width="420" persistent>
      <form @submit.prevent="doLogin">
        <v-card>
          <v-toolbar dark color="primary" dense flat>
            <v-toolbar-title>Senha de administradores</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-text-field v-model="user.login" label="Login" type="text" autocomplete="login" required></v-text-field>
            <v-text-field v-model="user.password" label="Senha" type="password" autocomplete="new-password"
              required></v-text-field>
            <v-checkbox label="permanecer logado?" v-model="user.remenber"></v-checkbox>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn block color="primary" type="submit">Confirmar</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </form>
    </v-dialog>
    <v-footer app>
      <v-row justify="center" no-gutters>
        <v-col class="text-center" cols="12">
          {{ new Date().getFullYear() }} — <strong>MasterNet</strong>
        </v-col>
      </v-row>
    </v-footer>
    <snackbar />
  </v-app>
</template>
<script lang="ts" setup>
import { reactive, computed } from 'vue'
import snackbar from '~/components/snackbar.vue'
import { useAuthStore } from '@/stores/auth'

const user = reactive({
  login: '',
  password: '',
  remenber: false
})

const authStore = useAuthStore()

const isLoged = computed(() => {
  return authStore && authStore.getToken
})

async function doLogin() {
  authStore.login(user).then((response) => {
    snackbarShow(response.message, 'success')
    window.location.reload()
  }).catch((error) => {
    snackbarShow(error.data.message, 'error')
  })
}
</script>