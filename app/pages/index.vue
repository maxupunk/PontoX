<template>
  <v-container>
    <v-card flat>
      <v-card-title>
        <v-row>
          <v-col cols="12" class="text-center" v-if="deviceList && deviceList.length > 1">
            <v-select v-model="selectedDevice" @update:modelValue="startVideo" :items="deviceList" item-title="label"
              item-value="deviceId" />
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text class="camera-container text-center">
        <video autoplay id="camera" muted></video>
        <canvas id="canvas"></canvas>
      </v-card-text>
      <v-card-actions v-if="treineServe && deviceList && deviceList.length > 0">
        <v-row>
          <v-col cols="2"></v-col>
          <v-col cols="8" class="text-center">
            <v-btn :loading="loading" size="x-large" @click="processVideo" block color="primary" variant="outlined">
              Registrar ponto
            </v-btn>
          </v-col>
          <v-col cols="2" class="text-left">
            <v-btn @click="markFacePlay" size="large" color="primary" icon="mdi-face-recognition"></v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
      <v-card-actions v-else-if="!treineServe && !loading">
        <v-alert type="warning">
          Não existe nem um dado treinado! <v-btn to="/treine">ir para trinamento</v-btn>
        </v-alert>
      </v-card-actions>
      <v-card-actions v-else-if="!deviceList || deviceList.length == 0">
        <v-alert type="warning">
          Não existe nem uma camera conectada!
        </v-alert>
      </v-card-actions>
    </v-card>

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
            <v-list density="compact" variant="elevated" v-if="dataUser.workHour.length">
              <v-list-subheader>Seu(s) horarios para hoje</v-list-subheader>
              <v-list-item v-for="(hour, index) in dataUser.workHour" :key="index" :active="hour.check">
                <v-checkbox v-model="pointCheck" :label="`Entrada ${hour.entryTime} - Saida: ${hour.departureTime}`"
                  :value="hour.id" hide-details></v-checkbox>
              </v-list-item>
            </v-list>
            <v-alert v-else type="warning">
              Não existe horario registrado para hoje!
            </v-alert>
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
  <v-overlay v-model="loading" class="align-center justify-center">
    <div class="text-center">
      <v-progress-circular color="primary" indeterminate></v-progress-circular>
    </div>
  </v-overlay>
</template>

<script setup>
import { ref, reactive } from 'vue'
const {
  video,
  canvas,
  loading,
  treineServe,
  deviceList,
  selectedDevice,
  startVideo,
  markFacePlay,
  facialIdentification,
} = useFaceDetection();

// State
const dialog = ref(false)
const observation = ref(null)
const dataUser = ref(null)
const pointCheck = ref()
const pointLocal = reactive({
  expressioUser: null,
  capturedImage: null
})

// Computed Properties
const titulo = computed(() => {
  return dataUser.value.point ? 'Confirmação de saída' : 'Confirmação de entrada'
})

const getClosestWorkHour = computed(() => {
  if (!dataUser.value.workHour.length) return null

  const currentTime = new Date()
  let closestWorkHour = null
  let smallestDifference = Infinity

  dataUser.value.workHour.forEach((workHour) => {
    const entryTime = parseTime(workHour.entryTime)
    const departureTime = parseTime(workHour.departureTime)

    const entryDiff = Math.abs(currentTime.getTime() - entryTime.getTime())
    const departureDiff = Math.abs(currentTime.getTime() - departureTime.getTime())

    const minDiff = Math.min(entryDiff, departureDiff)

    if (minDiff < smallestDifference) {
      smallestDifference = minDiff
      closestWorkHour = workHour
    }
  })

  return closestWorkHour.id
})

onMounted(async () => {
  video.value = document.getElementById('camera');
  canvas.value = document.getElementById('canvas');
})

// Methods
const processVideo = async () => {
  const resultImage = await facialIdentification()
  if (resultImage.success) {
    pointLocal.expressioUser = resultImage.expressioUser
    pointLocal.capturedImage = resultImage.imageFace
    getDateUser(resultImage.bestMatch.label)
  } else {
    snackbarShow(resultImage.message, 'error')
    return
  }
}


const getDateUser = async (id) => {
  const response = await $fetch(`/api/users/${id}`)
  if ('user' in response) {
    observation.value = response.point ? response.point.observation : null
    dataUser.value = response
    dialog.value = true
    pointCheck.value = getClosestWorkHour.value
  } else {
    snackbarShow('Não encontrei esse usuario no banco, talvez você tenha que retreinar!', 'warning')
  }
}

const confirmPonto = async () => {
  let data = {
    userId: dataUser.value.user.id,
    expressio: pointLocal.expressioUser,
    capturedImage: pointLocal.capturedImage,
    observation: observation.value,
  }

  if (pointCheck.value == null) {
    data.workHourId = getClosestWorkHour.value
  }

  const PointSave = await $fetch(`/api/points`, {
    method: 'PATCH',
    body: data
  })

  if (PointSave.message) {
    snackbarShow(PointSave.message, 'success')
    dialog.value = false
  }
}

const parseTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
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

.image {
  border: 2px solid #9c9c9c;
}
</style>