<template>
  <v-container fluid>
    <v-row justify="center" align="center" class="fill-height">
      <v-col class="text-center" cols="12" sm="8" md="6">
        <v-card class="pa-4" elevation="2">
          <v-card-title class="headline">Sobre</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                Sistema de gerenciamento de ponto de funcionários.<br>
                Criado por Maxuel Aguiar
              </v-col>
              <v-col cols="12">
                Tecnologias utilizadas:
                <v-list dense>
                  <v-list-item-group color="primary">
                    <v-list-item v-for="(item, i) in technologies" :key="i">
                      <v-list-item-content>
                        <v-list-item-title>{{ item }}</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
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