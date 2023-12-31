<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="auto" v-if="videoDevices.length > 1">
        <select v-model="selectedDevice" @change="startVideo">
          <option v-for="device in videoDevices" :key="device.deviceId" :value="device.deviceId">
            {{ device.label }}
          </option>
        </select>
      </v-col>
    </v-row>
    <v-row align="center" justify="center">
      <v-col cols="auto">
        <video autoplay id="cam" width="100%" height="60%" muted></video>
        <canvas id="canvas"></canvas>
      </v-col>
    </v-row>
  </v-container>

  <v-layout-item class="text-center pointer-events-none" model-value position="bottom" size="100">
    <v-overlay v-model="load.loading" class="align-center justify-center">
      <div class="text-center">
        <v-progress-circular color="primary" indeterminate></v-progress-circular>
      </div>
      <div class="text-center" style="color: white;">
        {{ load.mensage }}
      </div>
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

    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ titulo }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Nome do usuário" v-model="dataUser.user.name" readonly></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Email do usuário" v-model="dataUser.user.email" readonly></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="dataUser.point">
              <v-col cols="12">
                <v-text-field label="Entrada" v-model="dataUser.point.entryDate" readonly></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" dark @click="confirmPonto">Confirmar</v-btn>
          <v-btn color="blue darken-1" text @click="dialog = false">Cacenlar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn :loading="load.loading" size="x-large" @click="processVideo">
      Bater o ponto
    </v-btn>
  </v-layout-item>
</template>

<script>
import * as faceapi from 'face-api.js';

export default {
  data() {
    return {
      video: null,
      canvas: null,
      dataUser: [],
      LabelTrained: [],
      faceMatcherJson: [],
      treineServeData: [],
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
      videoDevices: [],
      selectedDevice: null,
      modelsServer: [],
      options: null,
      intervalId: null,
    };
  },
  async mounted() {
    this.video = document.getElementById('cam')
    this.canvas = document.getElementById('canvas')

    this.load.loading = true;
    await this.loadModels().then(async () => {
      this.load.mensage = 'buscanco dados treinados...'
      this.treineServeData = await $fetch('api/treine')

      this.options = new faceapi.TinyFaceDetectorOptions(this.treineServeData.tinyFaceDetectorOptions)

      if (this.treineServeData.hasOwnProperty('faceMatcherJson')) {
        this.faceMatcherJson = this.treineServeData.faceMatcherJson
      } else {
        await this.createNewTreine()
      }
    })
    await this.getVideoDevices()
  },
  computed: {
    titulo() {
      return this.dataUser.point ? 'Confirmação de saída' : 'Confirmação de entrada'
    },
    canvasSize() {
      return {
        width: this.video.width,
        height: this.video.height
      }
    }
  },
  watch: {
    'load.loading': function (newVal, oldVal) {
      if (!newVal) {
        clearInterval(this.intervalId);
      }
    },
  },
  methods: {
    async getVideoDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.videoDevices = devices.filter(device => device.kind === 'videoinput');
      this.selectedDevice = localStorage.getItem('selectedDevice') || (this.videoDevices.length > 0 ? this.videoDevices[0].deviceId : null);
      this.startVideo();
    },
    async startVideo() {
      this.load.mensage = 'Carregando câmera...'
      if (this.selectedDevice) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: this.selectedDevice } });
        this.video.srcObject = stream;
        this.load.loading = false;
        localStorage.setItem('selectedDevice', this.selectedDevice);
      }
    },

    async createNewTreine() {
      this.LabelTrained = await this.loadLabels()
      const faceMatcher = new faceapi.FaceMatcher(this.LabelTrained)
      this.faceMatcherJson = await faceMatcher.toJSON();
      this.saveFaceMatcher(this.faceMatcherJson)
    },

    loadModels() {
      this.load.mensage = 'Carregando modelos...'
      return Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/weights'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/weights'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/weights'),
        faceapi.nets.faceExpressionNet.loadFromUri('/weights'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/weights'),
      ]);
    },

    async getDateUser(id) {
      const response = await $fetch(`/api/users/${id}`)
      this.dataUser = response;
      this.dialog = true
    },

    async saveFaceMatcher(faceMatcherJson) {
      $fetch(`/api/treine`, {
        method: 'POST',
        body: faceMatcherJson
      })
    },

    async confirmPonto() {
      const data = {
        "user_id": this.dataUser.user.id,
      }
      const PointSave = await $fetch(`/api/point`, {
        method: 'POST',
        body: data
      })
      if (PointSave) {
        this.dialog = false
      }
    },

    async loadLabels() {
      this.load.loading = true
      this.load.mensage = 'Buscando os modelos no servidor...'
      this.modelsServer = await $fetch('/api/models')
      return Promise.all(this.modelsServer.map(async label => {
        let LabeledFaceDescriptors = [];
        for (const file of label.files) {
          this.load.mensage = 'Aprendendo com a imagem...' + label.label + ' - ' + file
          const img = await faceapi.fetchImage(`/labels/${label.label}/${file}`);
          const detections = await faceapi.detectSingleFace(img, this.options).withFaceLandmarks().withFaceDescriptor();
          if (detections) {
            LabeledFaceDescriptors.push(detections.descriptor);
          }
        }
        return new faceapi.LabeledFaceDescriptors(label.label, LabeledFaceDescriptors);
      }))
    },

    async processVideo() {
      this.load.loading = true;
      this.load.mensage = 'buscando humano na camera...'
      this.snackbar.color = 'success'
      this.intervalId = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(cam, this.options)
          .withFaceLandmarks()
          .withFaceExpressions()
          .withFaceDescriptors()


        if (detections.length) {
          this.load.mensage = 'Tentado reconhecer!'

          const faceMatcher = faceapi.FaceMatcher.fromJSON(this.faceMatcherJson);

          const results = detections.map((d) => {
            return faceMatcher.findBestMatch(d.descriptor)
          })

          detections.forEach(result => {
            const { expressions } = result
            console.log(expressions)
          })

          results.forEach(async (result) => {
            const { label, distance } = result
            if (label !== 'unknown' && distance < 0.4) {
              clearInterval(this.intervalId)
              await this.getDateUser(label)
              this.load.loading = false;
            } else {
              this.snackbar.open = true
              this.snackbar.mensage = 'Não estou reconhecendo... Chegue mais perto e/ou de frente para camera!'
              this.snackbar.color = 'warning'
            }
          })
        }

      }, 1000);
    },
  }
}
</script>
<style scoped>
#cam {
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border-color: black;
  max-width: 80%;
  max-height: 560px;
}

#canvas {
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 80%;
  max-height: 560px;
}
</style>