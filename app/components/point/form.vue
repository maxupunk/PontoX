<template>
  <v-dialog v-model="dialog" persistent scrollable :fullscreen="$vuetify.display.xs || fullscreen">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" :icon="icon" flat />
    </template>
    <template v-slot:default>
      <v-card>
        <v-toolbar :title="formTitle">
          <v-spacer></v-spacer>
          <v-btn icon @click="save">
            <v-icon>mdi-content-save</v-icon>
          </v-btn>
          <v-btn icon @click="fullscreen = !fullscreen">
            <v-icon v-if="!fullscreen">mdi-arrow-expand</v-icon>
            <v-icon v-else>mdi-arrow-collapse</v-icon>
          </v-btn>
          <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-select :items="userStore.usersList" item-value="id" item-title="name" v-model="point.userId"
                label="Usuario"></v-select>
            </v-row>
            <v-row v-if="point.WorkHours">
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-text>
                    <v-row>
                      <v-col cols="4">
                        <h3>Data</h3>
                        {{ point.WorkHours.date }}
                      </v-col>
                      <v-col cols="4">
                        <h3>Horario de entrada</h3>
                        {{ point.WorkHours.entryTime }}
                      </v-col>
                      <v-col cols="4">
                        <h3>Horario de saida</h3>
                        {{ point.WorkHours.departureTime }}
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-img :src="entryImage" width="100%" />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-container>
                  <v-row>
                    <v-text-field type="date" v-model="point.entryDate" label="Data entrada"></v-text-field>
                    <v-spacer></v-spacer>
                    <v-text-field type="time" v-model="point.entryTime" label="Hora entrada"></v-text-field>
                  </v-row>
                  <v-row>
                    <v-text-field v-model="point.entryImage" label="Imagem de entrada" readonly></v-text-field>
                  </v-row>
                  <v-row>
                    <v-text-field v-model="point.entryExpressio" label="Expressão" readonly></v-text-field>
                  </v-row>
                </v-container>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6" md="6">
                <v-img :src="departureImage" width="100%" />
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <v-container>
                  <v-row>
                    <v-text-field type="date" v-model="point.departureDate" label="Data saida"></v-text-field>
                    <v-spacer></v-spacer>
                    <v-text-field type="time" v-model="point.departureTime" label="Hora saida"></v-text-field>
                  </v-row>
                  <v-row>
                    <v-text-field v-model="point.departureImage" label="Imagem de saida" readonly></v-text-field>
                  </v-row>
                  <v-row>
                    <v-text-field v-model="point.departureExpressio" label="Expressão" readonly></v-text-field>
                  </v-row>
                </v-container>
              </v-col>
            </v-row>
            <v-row>
              <v-text-field v-model="point.observation" label="Observação"></v-text-field>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { snackbarShow } from '~/composables/useUi'
import { usePointStore } from "~/stores/PointStore";
import { useUserStore } from "~/stores/UserStore";

const pointStore = usePointStore()
const userStore = useUserStore()

const emit = defineEmits(['reload'])

const props = defineProps<{
  id?: number,
  icon?: string
}>()

const { point } = storeToRefs(pointStore)

const dialog = ref(false)
const fullscreen = ref(false)
const loading = ref(false)

const departureImage = ref<string>('')
const entryImage = ref<string>('')

const formTitle = computed(() => point.value.id ? 'Editar ponto' : 'Novo ponto')
const icon = computed(() => props.icon ? props.icon : 'mdi-timer-plus')

watch(dialog, async (val) => {
  userStore.fetchList()
  if (val) {
    if (props.id) {
      await pointStore.fetchPoint(props.id)
      entryImage.value = await pointStore.fetchImage(point.value.userId, point.value.entryImage)
      departureImage.value = await pointStore.fetchImage(point.value.userId, point.value.departureImage)
    } else {
      point.value = {}
    }
  }
})

const save = async () => {
  loading.value = true
  if (!point.value.userId) {
    snackbarShow('Selecione um usuario!', 'warning')
    return
  }
  if (point.value.id) {
    pointStore.updatePoint(point).then((response: any) => {
      snackbarShow(response.message, 'success')
      dialog.value = false
    }).catch((error: any) => {
      snackbarShow(error.data.message, 'error')
    })
  } else {
    pointStore.createPoint(point).then((response: any) => {
      snackbarShow(response.message, 'success')
      dialog.value = false
    }).catch((error: any) => {
      snackbarShow(error.data.message, 'error')
    })
  }
}

const close = () => {
  dialog.value = false
}
</script>