<template>
  <v-container>
    <v-alert color="info" variant="outlined" v-if="isDifferent">Recomendado o retreinamento, existe algun(s) cadastro
      sem reconhecimento</v-alert>
    <v-card>
      <v-card-title>
        <span class="text-h4" v-if="treineFileInfo">Já existe um treinamento</span>
        <span class="text-h4" v-else>Não existe treinamento</span>
      </v-card-title>

      <v-card-text>
        <v-container v-if="treineFileInfo">
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

    <v-overlay v-model="load.loading" class="align-center justify-center">
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12" class="text-center">
              <strong>{{ load.mensage }}</strong>
            </v-col>
            <v-col cols="12">
              <v-progress-linear :model-value="percent" :indeterminate="!percent" height="20">
                <strong v-if="percent">{{ percent }}%</strong>
              </v-progress-linear>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text v-if="load.image">
          <img :src="load.image" width="350" />
        </v-card-text>
      </v-card>
    </v-overlay>
  </v-container>
</template>

<script>
import * as faceapi from 'face-api.js';
import { snackbarShow } from '~/composables/useUi'

export default {
  data() {
    return {
      LabelTrained: [],
      faceMatcherJson: [],
      treineServeData: [],
      allUsers: [],
      token: null,
      dialog: false,
      load: {
        loading: false,
        mensage: null,
        image: '',
        current: 0,
      },
      modelsServer: [],
      options: null,
      distanceThreshold: 0.6,
    };
  },
  async mounted() {
    this.load.loading = true;
    await this.loadModels().then(async () => {
      this.allUsers = await $fetch('/api/users')
      this.loadTreine()
      this.load.mensage = 'buscanco usuarios...'
    })
    this.load.loading = false;
  },
  computed: {
    percent() {
      return Math.ceil(this.load.current / this.modelsServer.length * 100)
    },
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
    loadTreine() {
      this.load.loading = true;
      this.load.mensage = 'buscanco dados treinados...'
      $fetch('/api/treine').then((treine) => {
        this.treineServeData = treine
        this.options = new faceapi.SsdMobilenetv1Options(this.treineServeData.Mobilenetv1Options)
        this.distanceThreshold = this.treineServeData.distanceThreshold

        if (this.treineServeData.hasOwnProperty('faceMatcherJson')) {
          this.faceMatcherJson = this.treineServeData.faceMatcherJson
        }
        this.load.loading = false;
      })
    },

    async saveFaceMatcher(faceMatcherJson) {
      await $fetch(`/api/treine`, {
        method: 'POST',
        headers: {
          Authorization: this.token
        },
        body: faceMatcherJson
      }).then((response) => {
        snackbarShow(response.message, 'success')
      }).catch((error) => {
        snackbarShow(error, 'error')
      })
    },

    async createNewTreine() {
      this.LabelTrained = await this.loadLabels()
      const faceMatcher = new faceapi.FaceMatcher(this.LabelTrained, this.distanceThreshold)
      this.faceMatcherJson = await faceMatcher.toJSON();
      await this.saveFaceMatcher(this.faceMatcherJson)
      this.loadTreine()
      this.load.current = 0
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
        let countFace = 0;
        let LabeledFaceDescriptors = [];
        for (const file of label.files) {
          this.load.mensage = 'Processando...'
          const img = await faceapi.fetchImage(`/api/imagens/${label.label}/${file}`);
          this.load.image = img.src
          const detections = await faceapi.detectSingleFace(img, this.options).withFaceLandmarks().withFaceDescriptor();
          if (detections) {
            LabeledFaceDescriptors.push(detections.descriptor);
            countFace++;
            console.log(`Detectado - ${countFace} - ${label.label} - ${file}`)
            this.load.mensage = 'Rosto detectado'
          } else {
            console.log('Sem detecção para ' + label.label + ' - ' + file)
          }
          if (countFace >= 5) break;
        }
        this.load.current++
        return new faceapi.LabeledFaceDescriptors(label.label, LabeledFaceDescriptors);
      }))
    }
  }
}
</script>