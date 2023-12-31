<template>
  <v-container>
    <v-btn :loading="load.loading" size="x-large" @click="loadLabels">
      aprender
    </v-btn>
    <v-btn size="x-large" @click="verificar">
      verificar
    </v-btn>
    labels: {{ LabelTrained }} <br>
    models: {{ modelsServer }} <br>
    faceMatcher: {{ faceMatcherJson }}
    <v-overlay v-model="load.loading" class="align-center justify-center">
      <div class="text-center">
        <v-progress-circular color="primary" indeterminate></v-progress-circular>
      </div>
      <div class="text-center">
        {{ load.mensage }}
      </div>
    </v-overlay>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.open" color="success" :timeout="3000">
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
      dialog: false,
      snackbar: {
        open: false,
        mensage: null
      },
      load: {
        loading: false,
        mensage: null
      },
      modelsServer: [],
      options: null
    };
  },
  async mounted() {
    this.load.loading = true
    this.options = new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.7 })
    this.load.mensage = '1 - Buscando dados do servidor...'
    this.modelsServer = await $fetch('/api/models')
    await this.loadModels().then(async () => {
      this.load.mensage = '2 - buscanco dados treinados...'
      this.faceMatcherJson = await $fetch('api/treine')
      if (!this.faceMatcherJson) {
        try {
          this.LabelTrained = await this.loadLabels()
          console.log('Labels loaded', this.LabelTrained);
        } catch (error) {
          console.error('Error loading labels', error);
        }
        this.load.loading = false
        // const faceMatcher = new faceapi.FaceMatcher(this.LabelTrained, 1)
        // this.faceMatcherJson = await faceMatcher.toJSON();
        //this.saveFaceMatcher(this.faceMatcherJson)
      }
    })
  },
  methods: {
    loadModels() {
      this.load.mensage = '3 - Carregando modelos...'
      return Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/weights'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/weights'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/weights'),
        faceapi.nets.faceExpressionNet.loadFromUri('/weights'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/weights'),
      ]);
    },

    verificar() {
      console.log(this.LabelTrained)
      const faceMatcher = new faceapi.FaceMatcher(this.LabelTrained, 0.8)
      this.faceMatcherJson = faceMatcher.toJSON();
      this.load.loading = false
      console.log(this.faceMatcher)
    },

    async saveFaceMatcher(faceMatcherJson) {
      $fetch(`/api/treine`, {
        method: 'POST',
        body: faceMatcherJson
      })
    },
    async loadLabels() {
      this.load.loading = true
      this.load.mensage = '4 - Aprendendo com as fotos...'
      return Promise.all(this.modelsServer.map(async label => {
        let LabeledFaceDescriptors = [];
        this.load.mensage = '4 - Aprendendo com as fotos...' + label.label
        for (const file of label.files) {
          this.load.mensage = '4 - Aprendendo com as fotos...' + label.label + ' - ' + file
          const img = await faceapi.fetchImage(`/labels/${label.label}/${file}`);
          const detections = await faceapi.detectSingleFace(img, this.options).withFaceLandmarks().withFaceDescriptor();
          if (detections) {
            LabeledFaceDescriptors.push(detections.descriptor);
          }
        }
        return new faceapi.LabeledFaceDescriptors(label.label, LabeledFaceDescriptors);
      }))
    },
  }
}
</script>