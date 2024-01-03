<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-row align="center" justify="center">
          <v-col cols="auto">
            Usuario: {{ dataUser.name }}
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text>
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
            <video autoplay id="camera" muted></video>
            <canvas id="canvas"></canvas>
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
      video: null,
      canvas: null,
      dataUser: [],
      images: [],
      capturedImage: null,
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

    this.load.loading = true;
    this.load.mensage = 'buscando dados do usuario...'
    await this.getDateUser()
    this.load.mensage = 'buscanco dados treinados...'

    await this.loadModels()
    await this.getVideoDevices()
    this.load.loading = false
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
      ]);
    },

    async getDateUser() {
      const response = await $fetch(`/api/users/${this.id}`)
      if (response.hasOwnProperty('user')) {
        this.dataUser = response.user;
      } else {
        this.snackbar.open = true
        this.snackbar.mensage = 'Não encontrei esse usuario no banco com o ID informado!'
        this.snackbar.color = 'warning'
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
        this.snackbar.open = true
        this.snackbar.mensage = 'Imagem enviada com sucesso! Vamos treinar? indo para a pagina de treino...'
        setTimeout(() => {
          this.$router.push('/treine');
        }, 2000)
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

      if (singleResult) {
        // Capture the current frame from the video
        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, this.resolutionDevice.width, this.resolutionDevice.height);
        // Convert the canvas image to a data URL
        this.capturedImage = this.canvas.toDataURL('image/png')
        // Clear the canvas
        this.canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        //
        await this.sendImage()
      } else {
        this.snackbar.open = true
        this.snackbar.mensage = 'Não encontrei rosto na camera!'
        this.snackbar.color = 'warning'
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
</style>