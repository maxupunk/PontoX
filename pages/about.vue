<template>
  <v-container fluid>
    <v-row justify="center" align="center" class="fill-height">
      <v-col class="text-center" cols="12" sm="8" md="6">
        <v-card class="pa-4" elevation="2">
          <v-card-title class="headline">Sobre</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <p>Sistema de gerenciamento de ponto de funcionários.</p>
                <p>Desenvolvido por Maxuel Aguiar.</p>
                <p><a href="https://www.linkedin.com/in/maxuel-aguiar/" target="_blank">LinkedIn</a></p>
                <p>WhatsApp: (88) 9 9221-4180</p>
                <p>Email: maxupunk@yahoo.com.br</p>
              </v-col>
              <v-col cols="12">
                Tecnologias utilizadas:
                <v-list :items="technologies"></v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      technologies: ['Vue.js', 'Nuxt.js', 'Vuetify', 'Node.js', 'SQLite', 'Face-api.js', 'Drizzle-orm', 'Bcrypt', '...']
    }
  }
}
</script>