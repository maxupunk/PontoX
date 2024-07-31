<template>
    <v-container>
        <v-overlay v-model="load.loading" class="align-center justify-center">
            <div class="text-center">
                <v-progress-circular color="primary" indeterminate></v-progress-circular>
            </div>
            <div class="text-center" style="color: white;">
                {{ load.mensage }}
            </div>
        </v-overlay>
        <v-data-table :items="pointStore.points" :headers="headers">
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>Gerenciamento de pontos</v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialog" persistent scrollable :fullscreen="$vuetify.display.xs || fullscreen">
                        <template v-slot:activator="{ props }">
                            <v-btn icon="mdi-timer-plus" v-bind="props"></v-btn>
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
                                            <v-select :items="userStore.users" item-value="id" item-title="name"
                                                v-model="pointStore.point.userId" label="Usuario"></v-select>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="6">
                                                <span v-if="pointStore.point.entryImage">
                                                    <img :src="`/api/imagens/${pointStore.point.userId}/${pointStore.point.entryImage}`"
                                                        @error="setDefaultImage" width="100%">
                                                </span>
                                                <span v-else>
                                                    <img src="/imageFailed.jpg" width="100%">
                                                </span>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-container>
                                                    <v-row>
                                                        <v-text-field type="date" v-model="pointStore.point.entryDate"
                                                            label="Data entrada"></v-text-field>
                                                        <v-spacer></v-spacer>
                                                        <v-text-field v-model="pointStore.point.entryTime"
                                                            label="Hora entrada" v-maska:[maskTime]></v-text-field>
                                                    </v-row>
                                                    <v-row>
                                                        <v-text-field v-model="pointStore.point.entryImage"
                                                            label="Imagem de entrada" readonly></v-text-field>
                                                    </v-row>
                                                    <v-row>
                                                        <v-text-field v-model="pointStore.point.entryExpressio"
                                                            label="Expressão" readonly></v-text-field>
                                                    </v-row>
                                                </v-container>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="6">
                                                <span v-if="pointStore.point.departureImage">
                                                    <img :src="`/api/imagens/${pointStore.point.userId}/${pointStore.point.departureImage}`"
                                                        @error="setDefaultImage" width="100%">
                                                </span>
                                                <span v-else>
                                                    <img src="/imageFailed.jpg" width="100%">
                                                </span>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-container>
                                                    <v-row>
                                                        <v-text-field type="date"
                                                            v-model="pointStore.point.departureDate"
                                                            label="Data saida"></v-text-field>
                                                        <v-spacer></v-spacer>
                                                        <v-text-field v-model="pointStore.point.departureTime"
                                                            label="Hora saida" v-maska:[maskTime]></v-text-field>
                                                    </v-row>
                                                    <v-row>
                                                        <v-text-field v-model="pointStore.point.departureImage"
                                                            label="Imagem de saida" readonly></v-text-field>
                                                    </v-row>
                                                    <v-row>
                                                        <v-text-field v-model="pointStore.point.departureExpressio"
                                                            label="Expressão" readonly></v-text-field>
                                                    </v-row>
                                                </v-container>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-text-field v-model="pointStore.point.observation"
                                                label="Observação"></v-text-field>
                                        </v-row>
                                    </v-container>
                                </v-card-text>
                            </v-card>
                        </template>
                    </v-dialog>
                </v-toolbar>
            </template>

            <template v-slot:item.action="{ item }">
                <v-icon class="me-2" @click="editItem(item)">
                    mdi-pencil
                </v-icon>
                <v-icon @click="deleteDialog(item)">
                    mdi-delete
                </v-icon>
            </template>
        </v-data-table>
        <!-- Dialog confirm delete -->
        <v-dialog v-model:model-value="confirmDelete.dialog" min-width="340" max-width="500">
            <v-card title="Deseja realmente deletar o ponto?">
                <v-card-text>
                    <v-row class="align-center justify-space-around">
                        <v-col cols="2">
                            <v-icon color="warning" icon="mdi-alert-octagram-outline" size="70"></v-icon>
                        </v-col>
                        <v-col cols="10">
                            O ponto de será deletado permanentemente sem possibilidade de recuperação.
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" @click="deleteItem">delete</v-btn>
                    <v-btn color="blue darken-1" @click="confirmDelete.dialog = false">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
<script setup lang="ts">
import { snackbarShow } from "~/composables/useUi";
import { usePointStore } from "~/stores/PointStore";
import { useUserStore } from "~/stores/UserStore";

const pointStore = usePointStore()
const userStore = useUserStore()

const dialog = ref(false)
const confirmDelete = ref({
    id: null,
    dialog: false
})

const fullscreen = ref(false)
const load = ref({
    loading: false,
    mensage: null
})
const maskTime = {
    mask: "##:##:##"
}
const headers = ref([
    { text: 'ID', value: 'id' },
    { text: 'Usuario', value: 'name' },
    { text: 'Entrada data', value: 'entryDate' },
    { text: 'Entrada hora', value: 'entryTime' },
    { text: 'Saida data', value: 'departureDate' },
    { text: 'Saida hora', value: 'departureTime' },
    { text: 'Ações', value: 'action', sortable: false },
])

onMounted(() => {
    pointStore.fetchPoints()
    userStore.fetchUsers()
})

watch(dialog, (val) => {
    if (!val) {
        close()
    }
})

const formTitle = computed(() => {
    return pointStore.point.id === null ? 'Cadastro' : 'Atualizar'
})

async function editItem(item: any) {
    pointStore.fetchPoint(item.id)
    dialog.value = true
}

async function save() {
    if (!pointStore.point.userId) {
        snackbarShow('Selecione um usuario!', 'warning')
        return
    }
    if (pointStore.point.id) {
        const UpdUser = await pointStore.updatePoint(pointStore.point)
        if (UpdUser) {
            snackbarShow('Usuário atualizado com sucesso!', 'success')
        }
    } else {
        const NewUser = await pointStore.createPoint(pointStore.point)
        if (NewUser) {
            snackbarShow('Usuário cadastrado com sucesso!', 'success')
        }
    }
    close()
}

function deleteDialog(point: any) {
    confirmDelete.value = point
    confirmDelete.value.dialog = true
}

async function deleteItem() {
    const response = await $fetch(`/api/points/${confirmDelete.value.id}`, {
        method: 'DELETE',
    })
    if (response) {
        snackbarShow('Usuário deletado com sucesso!', 'success')
    }
    confirmDelete.value.dialog = false
    pointStore.fetchPoints()
}

function setDefaultImage(e: any) {
    e.target.src = '/imageFailed.jpg'
}

function close() {
    dialog.value = false
    pointStore.point = {}
    pointStore.fetchPoints()
}

</script>