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
        <v-list-item link prepend-icon="mdi-account-group" title="Resumo" to="/relatorios/resumo"></v-list-item>
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
      authStore: null
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
    }
  },
  async mounted() {
    this.authStore = useAuthStore()
  },
  methods: {
    async logout() {
      await this.authStore.logout()
      this.$router.push('/login')
    }
  }
}
</script>