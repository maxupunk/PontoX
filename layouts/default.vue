<template>
  <v-app id="inspire">
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer">
      <v-list>
        <v-list-subheader>Pontos</v-list-subheader>
        <v-list-item link prepend-icon="mdi-eye-check" title="Ponto" to="/"></v-list-item>
        <v-list-subheader>Gerencia</v-list-subheader>
        <v-list-item link prepend-icon="mdi-timer-check-outline" title="gerenciar pontos" to="/points"></v-list-item>
        <v-list-item link prepend-icon="mdi-school" title="Treinamento" to="/treine"></v-list-item>
        <v-list-item link prepend-icon="mdi-account-group" title="Usuarios" to="/users"></v-list-item>
        <v-list-subheader>Relatorios</v-list-subheader>
        <v-list-item link prepend-icon="mdi-account-group" title="horas corridas"
          to="/reports/hourstotalmissing"></v-list-item>
        <v-list-item link prepend-icon="mdi-account-group" title="Horas total trabalhada"
          to="/reports/hourstotal"></v-list-item>
        <v-list-item link prepend-icon="mdi-account-group" title="Resulmo dia a dia"
          to="/reports/hoursdaytoday"></v-list-item>
        <v-list-subheader>Outros</v-list-subheader>
        <v-list-item link prepend-icon="mdi-backup-restore" title="Backups" to="/backups"></v-list-item>
        <v-list-item link prepend-icon="mdi-information-outline" title="Sobre" to="/about"></v-list-item>
      </v-list>
      <template v-slot:append v-if="isLoged">
        <v-btn block color="warning" @click="logout()">
          Logout
        </v-btn>
      </template>
    </v-navigation-drawer>

    <v-main>
      <NuxtPage />
    </v-main>

    <v-dialog :model-value="!isLoged && !isWhiteList" max-width="420" persistent>
      <form @submit.prevent="doLogin">
        <v-card>
          <v-toolbar dark color="primary" dense flat>
            <v-toolbar-title>Senha de administradores</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-text-field v-model="user.login" label="Login" type="text" autocomplete="login" required></v-text-field>
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
<script>
import snackbar from '~/components/snackbar.vue';
import { useAuthStore } from '@/stores/auth.ts'

export default {
  data() {
    return {
      drawer: false,
      authStore: null,
      user: {
        login: '',
        password: '',
        permanente: false
      },
      authStore: useAuthStore()
    }
  },
  components: {
    snackbar
  },
  computed: {
    isLoged() {
      if (this.authStore && this.authStore.getToken) {
        return true
      } else {
        return false
      }
    },
    isWhiteList() {
      return this.$route.path === '/' || this.$route.path === '/about'
    }
  },
  methods: {
    async doLogin() {
      const login = await $fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(this.user)
      })
      if (!login) {
        snackbarShow('login ou senha inválidos!', 'error')
        return
      }
      this.token = login.token
      this.authStore.setToken(login.token, this.user.remember)
      window.location.reload()
    },
    logout() {
      this.authStore.logout()
    }
  }
}
</script>