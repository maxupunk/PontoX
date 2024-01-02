<template>
  <v-container>
    <div v-if="treineFileInfo">
      <v-alert color="info" variant="outlined" v-if="isDifferent">Recomendado o retreinamento, existe algun(s) cadastro sem reconhecimento</v-alert>
      <v-card>
        <v-card-title>
          <span class="text-h4">Já existe um treinamento</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="6">
                Data do ulitmo treino
              </v-col>
              <v-col cols="6">
                {{ treineFileInfo.birthtime }}
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                Tamanho
              </v-col>
              <v-col cols="6">
                {{ treineFileInfo.size }}
              </v-col>
            </v-row>
            <v-row v-if="faceMatcherJson.hasOwnProperty('labeledDescriptors')">
              <v-col cols="12">
                {{ faceMatcherJson.labeledDescriptors.length }} face(s) reconhecida(s) de {{ allUsers.users.length }}
                cadastrada(s) no banco de dados
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                Distancia Limite (precisão)
              </v-col>
              <v-col cols="6">
                {{ faceMatcherJson.distanceThreshold }}
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="createNewTreine">
            Criar novo treinamento
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <v-overlay v-model="load.loading" class="align-center justify-center">
      <v-card>
        <v-card-text>
          <div class="text-center">
            <v-progress-circular color="primary" indeterminate></v-progress-circular>
          </div>
          <div class="text-center">
            {{ load.mensage }}
          </div>
        </v-card-text>
      </v-card>
    </v-overlay>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.open" :color="snackbar.color" :timeout="3000">
      {{ snackbar.mensage }}
      <template v-slot:actions>
        <v-btn color="white" text @click="snackbar = false" append-icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import * as faceapi from 'face-api.js';

export default {
  data() {
    return {
      LabelTrained: [],
      faceMatcherJson: [],
      treineServeData: [],
      allUsers: [],
      dialog: false,
      snackbar: {
        open: false,
        mensage: null,
        color: 'success'
      },
      load: {
        loading: false,
        mensage: null
      },
      modelsServer: [],
      options: null,
      distanceThreshold: 0.6,
    };
  },
  async mounted() {
    this.load.loading = true;
    await this.loadModels().then(async () => {
      this.load.mensage = 'buscanco dados treinados...'
      this.treineServeData = await $fetch('/api/treine')
      this.allUsers = await $fetch('/api/users')

      this.options = new faceapi.SsdMobilenetv1Options(this.treineServeData.Mobilenetv1Options)
      this.distanceThreshold = this.treineServeData.distanceThreshold

      if (this.treineServeData.hasOwnProperty('faceMatcherJson')) {
        this.faceMatcherJson = this.treineServeData.faceMatcherJson
      }
    })
    this.load.loading = false;
  },
  computed: {
    treineFileInfo() {
      if (this.treineServeData.hasOwnProperty('fileStats')) {
        return this.treineServeData.fileStats
      } else {
        return null
      }
    },
    isDifferent() {
      if (this.faceMatcherJson.hasOwnProperty('labeledDescriptors')) {
        return this.faceMatcherJson.labeledDescriptors.length < this.allUsers.users.length;
      } else {
        return true
      }
    }
  },
  methods: {
    async saveFaceMatcher(faceMatcherJson) {
      $fetch(`/api/treine`, {
        method: 'POST',
        body: faceMatcherJson
      })
    },

    async createNewTreine() {
      this.LabelTrained = await this.loadLabels()
      const faceMatcher = new faceapi.FaceMatcher(this.LabelTrained, this.distanceThreshold)
      this.faceMatcherJson = await faceMatcher.toJSON();
      await this.saveFaceMatcher(this.faceMatcherJson)
      this.load.loading = false;
    },

    loadModels() {
      this.load.mensage = 'Carregando modelos...'
      return Promise.all([
        faceapi.nets.faceLandmark68Net.loadFromUri('/weights'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/weights'),
        faceapi.nets.faceExpressionNet.loadFromUri('/weights'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/weights'),
      ]);
    },

    async loadLabels() {
      this.load.loading = true
      this.load.mensage = 'Buscando os modelos no servidor...'
      this.modelsServer = await $fetch('/api/models')
      return Promise.all(this.modelsServer.map(async label => {
        let LabeledFaceDescriptors = [];
        for (const file of label.files) {
          this.load.mensage = 'Processando - ' + label.label + ' - ' + file
          const img = await faceapi.fetchImage(`/imagens/${label.label}/${file}`);
          const detections = await faceapi.detectSingleFace(img, this.options).withFaceLandmarks().withFaceDescriptor();
          if (detections) {
            LabeledFaceDescriptors.push(detections.descriptor);
          }
        }
        return new faceapi.LabeledFaceDescriptors(label.label, LabeledFaceDescriptors);
      }))
    }
  }
}
</script>