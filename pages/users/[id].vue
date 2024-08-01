<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row>
          <v-col cols="12" class="mx-auto text-center">
            Usuario: {{ dataUser.name }}
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" v-if="videoDevices.length > 1">
            <select v-model="selectedDevice" @change="startVideo">
              <option v-for="device in videoDevices" :key="device.deviceId" :value="device.deviceId">
                {{ device.label }}
              </option>
            </select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="mx-auto text-center">
            <video autoplay id="camera" muted></video>
            <canvas id="canvas"></canvas>
            <canvas id="canvasFace"></canvas>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :loading="load.loading" size="x-large" @click="processVideo">
          Capturar a imagem
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>

    <v-overlay v-model="load.loading" class="align-center justify-center">
      <div class="text-center">
        <v-progress-circular color="primary" indeterminate></v-progress-circular>
      </div>
      <div class="text-center" style="color: white;">
        {{ load.mensage }}
      </div>
    </v-overlay>
  </v-container>
</template>

<script>
import * as faceapi from 'face-api.js';
import { snackbarShow } from "~/composables/useUi"

export default {
  data() {
    return {
      video: null,
      canvas: null,
      dataUser: [],
      imageMarge: 50,
      capturedImage: null,
      load: {
        loading: false,
        mensage: null
      },
      videoDevices: [],
      selectedDevice: null,
      resolutionDevice: {
        width: 0,
        height: 0
      },
      treineServeData: [],
      labeledDescriptors: [],
      dialogUserExist: false,
      id: this.$route.params.id
    };
  },
  async mounted() {
    this.video = document.getElementById('camera')
    this.canvas = document.getElementById('canvas')
    this.canvasface = document.getElementById('canvasFace');

    this.load.loading = true;
    this.load.mensage = 'buscando dados do usuario...'
    await this.getDateUser()
    this.load.mensage = 'buscanco dados treinados...'

    await this.loadModels()
    await this.getVideoDevices()
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
      this.selectedDevice = localStorage.getItem('selectedDevice') || (this.videoDevices.length > 0 ? this.videoDevices[0].deviceId : null);
      this.startVideo();
    },
    async startVideo() {
      this.load.mensage = 'Carregando câmera...'
      if (this.selectedDevice) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: this.selectedDevice } });
        let stream_settings = stream.getVideoTracks()[0].getSettings();
        this.resolutionDevice.width = stream_settings.width;
        this.resolutionDevice.height = stream_settings.height;
        this.video.srcObject = stream;
        this.load.loading = false;
        localStorage.setItem('selectedDevice', this.selectedDevice);
      }
    },

    loadModels() {
      this.load.mensage = 'Carregando modelos...'
      return Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/weights'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/weights'),
      ]);
    },

    async getDateUser() {
      const response = await $fetch(`/api/users/${this.id}`)
      if (response.hasOwnProperty('user')) {
        this.dataUser = response.user;
      } else {
        snackbarShow('Não encontrei esse usuario no banco com o ID informado!', 'warning')
      }
    },

    async sendImage() {
      this.load.loading = true;
      this.load.mensage = 'Enviando imagem...'
      const data = {
        "capturedImage": this.capturedImage,
      }
      const sendImage = await $fetch(`/api/users/${this.id}`, {
        method: 'PUT',
        body: data
      })
      if (sendImage) {
        snackbarShow('Imagem enviada com sucesso! indo para a pagina de treino...', 'success')
        setTimeout(() => {
          this.$router.push('/treine');
        }, 1000)
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

      if (singleResult) {
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
        this.capturedImage = this.canvasface.toDataURL('image/png')
        // enviando a imagem para o servidor
        await this.sendImage()
      } else {
        snackbarShow('Não encontrei rosto na camera!', 'warning')
      }
      this.load.loading = false;
    },
  }
}
</script>
<style scoped>
#camera {
  max-width: 100%;
}

#canvas {
  display: none;
}

#canvasFace {
  display: none;
}
</style>