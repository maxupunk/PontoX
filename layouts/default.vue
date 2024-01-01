<template>
  <v-app id="inspire">
    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>PontoX</v-app-bar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer">
      <v-list-item link prepend-icon="mdi-home" title="Home" to="/"></v-list-item>
      <v-list-item link prepend-icon="mdi-eye-check" title="Bater ponto" to="/ponto"></v-list-item>
      <v-list-item link prepend-icon="mdi-eye-check" title="Treinamento" to="/treine"></v-list-item>
      <v-list-item link prepend-icon="mdi-account-group" title="Usuarios" to="/users"></v-list-item>
      <v-list-item link prepend-icon="mdi-information-outline" title="Sobre" to="/about"></v-list-item>
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

  </v-app>
</template>
<script>
export default {
  data() {
    return {
      drawer: null,
    }
  },
}
</script>