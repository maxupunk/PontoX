<template>
  <v-app-bar scroll-behavior="hide">
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
    <v-app-bar-title>
      {{ props.title }}
    </v-app-bar-title>
    <v-progress-linear :active="loading" :indeterminate="loading" color="primary" absolute bottom />
    <v-spacer></v-spacer>
    <slot></slot>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer">
    <v-list nav>
      <v-list-subheader>Pontos</v-list-subheader>
      <v-list-item link prepend-icon="mdi-eye-check" title="Ponto" to="/"></v-list-item>
      <v-list-subheader>Gerencia</v-list-subheader>
      <v-list-item link prepend-icon="mdi-timer-check-outline" title="Gerenciar pontos" to="/points"></v-list-item>
      <v-list-item link prepend-icon="mdi-school" title="Treinamento" to="/treine"></v-list-item>
      <v-list-item link prepend-icon="mdi-account-group" title="Usuarios" to="/users"></v-list-item>
      <v-list-item link prepend-icon="mdi-store-clock" title="Banco de horas" to="/bankhour"></v-list-item>
      <v-list-subheader>Relatorios</v-list-subheader>
      <v-list-item link prepend-icon="mdi-account-group" title="Horas corridas"
        to="/reports/hourstotalmissing"></v-list-item>
      <v-list-item link prepend-icon="mdi-account-group" title="Horas total trabalhada"
        to="/reports/hourstotal"></v-list-item>
      <v-list-item link prepend-icon="mdi-account-group" title="Resumo dia a dia"
        to="/reports/hoursdaytoday"></v-list-item>
      <v-list-item link prepend-icon="mdi-account-group" title="Resultado de horas"
        to="/reports/hoursBalance"></v-list-item>
      <v-list-subheader>Outros</v-list-subheader>
      <v-list-item link prepend-icon="mdi-cog" title="Configurações" to="/config"></v-list-item>
      <v-list-item link prepend-icon="mdi-information-outline" title="Sobre" to="/about"></v-list-item>
    </v-list>
    <template v-slot:append v-if="isLoged">
      <v-btn block color="warning" @click="authStore.logout()">
        Logout
      </v-btn>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps<Props>();

interface Props {
  title?: string
  loading?: boolean
}

const drawer = ref(false)

const isLoged = computed(() => {
  return authStore && authStore.getToken
})

</script>