<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="mx-auto text-center" v-if="videoDevices.length > 1">
        <select v-model="selectedDevice" @change="startVideo">
          <option v-for="device in videoDevices" :key="device.deviceId" :value="device.deviceId">
            {{ device.label }}
          </option>
        </select>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="mx-auto text-center">
        <video autoplay id="cam" muted></video>
        <canvas id="canvas"></canvas>
        <canvas id="canvasFace"></canvas>
      </v-col>
    </v-row>
    <v-row v-if="hasCamera">
      <v-col cols="12" class="mx-auto text-center">
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
              <v-col cols="3">
                <v-img :src="pointLocal.capturedImage" width="120" class="image"></v-img>
              </v-col>
              <v-col cols="9">
                <v-row>
                  <v-col cols="12">
                    Usuário: <h4>{{ dataUser.user.name }}</h4>
                    <v-divider></v-divider>
                  </v-col>
                  <v-col cols="6" v-if="dataUser.point">
                    Data da entrada: <h4>{{ dataUser.point.entryDate }} </h4>
                    <v-divider></v-divider>
                  </v-col>
                  <v-col cols="6" v-if="dataUser.point">
                    Horario da entrada: <h4>{{ dataUser.point.entryTime }}</h4>
                    <v-divider></v-divider>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Observação" v-model="observation"></v-text-field>
              </v-col>
            </v-row>
            <v-list density="compact" variant="elevated">
              <v-list-subheader>Seu(s) horarios para hoje</v-list-subheader>
              <v-list-item v-for="(hour, index) in hours" :key="index" :active="hour.check">
                {{ index + 1 }} - Entrada: {{ hour.entryTime }} - Saida: {{ hour.departureTime }}
                <template v-slot:append v-if="hour.check">
                  <v-icon color="green">mdi-check</v-icon>
                </template>
              </v-list-item>
            </v-list>
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
import { snackbarShow } from "~/composables/useUi"

export default {
  data() {
    return {
      video: null,
      canvas: null,
      canvasface: null,
      dataUser: [],
      imageMarge: 50,
      observation: null,
      pointLocal: {
        capturedImage: null,
        expressioUser: null,
      },
      faceMatcherJson: [],
      treineServeData: [],
      dialog: false,
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
  computed: {
    titulo() {
      return this.dataUser.point ? 'Confirmação de saída' : 'Confirmação de entrada'
    },
    hasCamera() {
      return this.videoDevices.length > 0
    },
    hours() {
      const now = new Date();
      const currentHour = now.getHours();
      return this.dataUser.workDay.workHours.map((item) => {
        const entryTimeHour = item.entryTime.split(":")[0];
        const departureTimeHour = item.departureTime.split(":")[0];
        return {
          entryTime: item.entryTime,
          departureTime: item.departureTime,
          check: entryTimeHour <= currentHour && departureTimeHour >= currentHour ? true : false
        }
      })
    }
  },
  async mounted() {
    this.video = document.getElementById('cam')
    this.canvas = document.getElementById('canvas')
    this.canvasface = document.getElementById('canvasFace');

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
          this.faceMatcher = faceapi.FaceMatcher.fromJSON(this.faceMatcherJson)
          // carrega logo o treinamento antecipado
          this.load.mensage = 'Carregando o treinamento na memoria...'
          await faceapi.detectSingleFace(this.video, this.options)
        } else {
          snackbarShow('Não existe nem um dado treinado!', 'warning')
          this.startDesable = true
        }
      })
    } else {
      snackbarShow('Nem uma camera foi encontrada!', 'warning')
    }
    this.load.loading = false
  },
  unmounted() {
    if (this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(function (track) {
        track.stop();
      });
    }
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
        snackbarShow('Não encontrei esse usuario no banco, talvez você tenha que retreinar!', 'warning')
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
        snackbarShow('Ponto registrado com sucesso!', 'success')
        this.dialog = false
      }
    },

    getCutImage(box) {
      const { x, y, width, height } = box;
      const offset = 20;
      return {
        x: x - this.imageMarge,
        y: y - (this.imageMarge + offset),
        width: width + (2 * this.imageMarge),
        height: height + (2 * (this.imageMarge))
      }
    },

    async processVideo() {
      this.load.loading = true;
      this.load.mensage = 'buscando rosto na camera...'
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
          // Desenhe o frame atual do vídeo no canvas
          ctx.drawImage(this.video, 0, 0, this.resolutionDevice.width, this.resolutionDevice.height);

          // Create a new canvas element
          const faceCtx = this.canvasface.getContext('2d');
          const cut = this.getCutImage(singleResult.detection.box);
          this.canvasface.width = cut.width;
          this.canvasface.height = cut.height;
          // Draw the face on the canvas
          faceCtx.drawImage(this.canvas, cut.x, cut.y, cut.width, cut.height, 0, 0, cut.width, cut.height);

          // Convert the canvas image to a data URL
          this.pointLocal.capturedImage = this.canvasface.toDataURL('image/png');
          // pega os dados do usuario
          await this.getDateUser(bestMatch.label)
        } else {
          snackbarShow('Não estou reconhecendo... Chegue mais perto e fique de frente para camera!', 'warning')
        }
      } else {
        snackbarShow('Não foi encontrado rosto da imagem!', 'warning')
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

#canvasFace {
  display: none;
}

.image {
  border: 2px solid #9c9c9c;
}
</style>