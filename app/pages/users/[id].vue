<template>
  <v-container>
    <v-card flat>
      <v-card-title>
        <v-row>
          <v-col cols="12" class="mx-auto text-center">
            Usuario: {{ dataUser?.name }}
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" v-if="deviceList && deviceList.length > 1">
            <v-col cols="12" class="text-center" v-if="deviceList && deviceList.length > 1">
              <v-select v-model="selectedDevice" @update:modelValue="startVideo" :items="deviceList" item-title="label"
                item-value="deviceId" />
            </v-col>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="camera-container text-center">
        <video autoplay id="camera" muted></video>
        <canvas id="canvas"></canvas>
      </v-card-text>
      <v-card-actions v-if="deviceList && deviceList.length > 0">
        <v-row>
          <v-col cols="2"></v-col>
          <v-col cols="8" class="text-center">
            <v-btn :loading="loading" size="x-large" @click="processVideo" block color="primary" variant="outlined">
              Capturar a imagem
            </v-btn>
          </v-col>
          <v-col cols="2" class="text-left">
            <v-btn @click="markFacePlay" size="large" color="primary" icon="mdi-face-recognition"></v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
      <v-card-actions v-else>
        <v-alert type="warning">
          Não existe nem uma camera conectada!
        </v-alert>
      </v-card-actions>
    </v-card>

    <v-overlay v-model="loading" class="align-center justify-center">
      <div class="text-center">
        <v-progress-circular color="primary" indeterminate></v-progress-circular>
      </div>
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
const {
  video,
  canvas,
  loading,
  deviceList,
  selectedDevice,
  startVideo,
  markFacePlay,
  getImageFace
} = useFaceDetection();
const router = useRouter()
const route = useRoute()

// State
const dataUser = ref()
const userId = route.params.id

onMounted(async () => {
  await getDateUser()
  video.value = document.getElementById('camera');
  canvas.value = document.getElementById('canvas');
})

// Methods
const processVideo = async () => {
  const resultImage = await getImageFace()
  if (resultImage.success) {
    sendImage(resultImage.imageFace)
  } else {
    snackbarShow(resultImage.message, 'error')
    return
  }
}

const getDateUser = async () => {
  const response = await $fetch(`/api/users/${userId}`)
  if ('user' in response) {
    dataUser.value = response.user
  } else {
    snackbarShow('Não encontrei esse usuario no banco, talvez você tenha que retreinar!', 'warning')
  }
}

const sendImage = async (image = null) => {
  loading.value = true;
  const data = {
    capturedImage: image,
  }
  const sendImage = await $fetch(`/api/users/${userId}`, {
    method: 'PUT',
    body: data
  })
  if (sendImage) {
    snackbarShow('Imagem enviada com sucesso! indo para a pagina de treino...', 'success')
    setTimeout(() => {
      router.push('/treine');
    }, 1000)
  }
}
</script>
<style scoped>
.camera-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  /* or your desired width */
  margin: 0 auto;
  padding: 0;
}

#camera {
  position: relative;
  width: 100%;
  height: auto;
  border: 2px solid #9c9c9c;
  display: block;
}

#canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid #9c9c9c;
}

#canvasFace {
  display: none;
}
</style>