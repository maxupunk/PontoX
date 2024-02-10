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
        <video autoplay id="cam" muted></video>
        <canvas id="canvas"></canvas>
      </v-col>
    </v-row>
    <v-row align="center" justify="center" v-if="hasCamera">
      <v-col cols="auto">
        <v-btn :loading="load.loading" :disabled="startDesable" size="x-large" @click="processVideo">
          Registrar ponto
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" persistent max-width="600px" :fullscreen="$vuetify.display.xs">
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
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Observação" v-model="observation"></v-text-field>
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
          <v-btn color="blue darken-1" text @click="dialog = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

  <!-- Snackbar -->
  <v-snackbar v-model="snackbar.open" :color="snackbar.color" :timeout="3000">
    {{ snackbar.mensage }}
    <template v-slot:actions>
      <v-btn color="white" text @click="snackbar = false" append-icon>
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
  <v-overlay v-model="load.loading" class="align-center justify-center">
    <div class="text-center">
      <v-progress-circular color="primary" indeterminate></v-progress-circular>
    </div>
    <div class="text-center" style="color: white;">
      {{ load.mensage }}
    </div>
  </v-overlay>
</template>

<script>
import * as faceapi from 'face-api.js';

export default {
  data() {
    return {
      video: null,
      canvas: null,
      dataUser: [],
      observation: null,
      pointLocal: {
        capturedImage: null,
        expressioUser: null,
      },
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
      resolutionDevice: {
        width: 0,
        height: 0
      },
      selectedDevice: null,
      modelsServer: [],
      options: null,
      faceMatcher: null,
      startDesable: false
    };
  },
  async mounted() {
    this.video = document.getElementById('cam')
    this.canvas = document.getElementById('canvas')

    this.load.loading = true
    await this.getVideoDevices()

    if (this.videoDevices.length > 0) {
      await this.startVideo()
      await this.loadModels().then(async () => {
        this.load.mensage = 'buscanco dados treinados...'
        this.treineServeData = await $fetch('/api/treine')

        this.options = new faceapi.SsdMobilenetv1Options(this.treineServeData.Mobilenetv1Options)

        if (this.treineServeData.hasOwnProperty('faceMatcherJson')) {
          this.faceMatcherJson = this.treineServeData.faceMatcherJson
        } else {
          this.snackbar.open = true
          this.snackbar.mensage = 'Não existe nem um dado treinado!'
          this.startDesable = true
        }
        this.faceMatcher = faceapi.FaceMatcher.fromJSON(this.faceMatcherJson)
      })
    } else {
      this.snackbar.open = true
      this.snackbar.mensage = 'Nem uma camera foi encontrada!'
      this.snackbar.color = 'warning'
    }
    this.load.loading = false
  },
  computed: {
    titulo() {
      return this.dataUser.point ? 'Confirmação de saída' : 'Confirmação de entrada'
    },
    hasCamera() {
      return this.videoDevices.length > 0
    },
  },
  methods: {
    async getVideoDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.videoDevices = devices.filter(device => device.kind === 'videoinput');
      this.selectedDevice = localStorage.getItem('selectedDevice') || (this.videoDevices.length > 0 ? this.videoDevices[0].deviceId : null)
    },
    async startVideo() {
      this.load.mensage = 'Carregando câmera...'
      const device = this.selectedDevice !== null ? { deviceId: this.selectedDevice } : true;
      const self = this;
      await navigator.mediaDevices.getUserMedia({ video: device })
        .then(function (stream) {
          let stream_settings = stream.getVideoTracks()[0].getSettings();
          self.resolutionDevice.width = stream_settings.width;
          self.resolutionDevice.height = stream_settings.height;
          self.video.srcObject = stream;
          localStorage.setItem('selectedDevice', self.selectedDevice);
        })
        .catch(function (err) {
          alert('Ouve um erro ao carregar a camera! \n' + err)
        });
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

    async getDateUser(id) {
      const response = await $fetch(`/api/users/${id}`)
      if (response.hasOwnProperty('user')) {
        this.observation = response.point ? response.point.observation : null;
        this.dataUser = response;
        this.dialog = true
      } else {
        this.snackbar.open = true
        this.snackbar.mensage = 'Não encontrei esse usuario no banco, talvez você tenha que retreinar!'
        this.snackbar.color = 'warning'
      }
    },

    async confirmPonto() {
      const data = {
        "userId": this.dataUser.user.id,
        "expressio": this.pointLocal.expressioUser,
        "capturedImage": this.pointLocal.capturedImage,
        "observation": this.observation
      }
      const PointSave = await $fetch(`/api/points`, {
        method: 'PATCH',
        body: data
      })
      if (PointSave) {
        this.snackbar.open = true
        this.snackbar.mensage = 'Ponto registrado com sucesso!'
        this.dialog = false
      }
    },

    async processVideo() {
      this.load.loading = true;
      this.load.mensage = 'buscando rosto na camera...'
      this.snackbar.color = 'success'
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;

      const singleResult = await faceapi
        .detectSingleFace(this.video, this.options)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptor()

      if (singleResult) {
        this.load.mensage = 'Tentado reconhecer!'
        const bestMatch = this.faceMatcher.findBestMatch(singleResult.descriptor)
        if (bestMatch.label !== 'unknown') {
          const expressions = singleResult.expressions
          this.pointLocal.expressioUser = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

          // Capture the current frame from the video
          const ctx = this.canvas.getContext('2d');
          ctx.drawImage(this.video, 0, 0, this.resolutionDevice.width, this.resolutionDevice.height);
          // Convert the canvas image to a data URL
          this.pointLocal.capturedImage = this.canvas.toDataURL('image/png');
          // Clear the canvas
          this.canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
          //
          await this.getDateUser(bestMatch.label)
        } else {
          this.snackbar.open = true
          this.snackbar.mensage = 'Não estou reconhecendo... Chegue mais perto e/ou de frente para camera!'
          this.snackbar.color = 'warning'
        }
      } else {
        this.snackbar.open = true
        this.snackbar.mensage = 'Não encontrei rosto da imagem!'
        this.snackbar.color = 'warning'
      }
      this.load.loading = false;
    },
  }
}
</script>
<style scoped>
#cam {
  /* position: absolute; */
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border-color: black;
  max-width: 100%;
}

#canvas {
  display: none;
}
</style>