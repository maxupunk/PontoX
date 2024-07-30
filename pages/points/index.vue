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
        <v-data-table :items="points" :headers="headers">
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
                                            <v-select :items="users" item-value="id" item-title="name"
                                                v-model="editedPoint.userId" label="Usuario"></v-select>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="6">
                                                <span v-if="editedPoint.entryImage">
                                                    <img :src="`/api/imagens/${editedPoint.userId}/${editedPoint.entryImage}`"
                                                        @error="setDefaultImage" width="100%">
                                                </span>
                                                <span v-else>
                                                    <img src="/imageFailed.jpg" width="100%">
                                                </span>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-container>
                                                    <v-row>
                                                        <v-text-field type="date" v-model="editedPoint.entryDate"
                                                            label="Data entrada"></v-text-field>
                                                        <v-spacer></v-spacer>
                                                        <v-text-field v-model="editedPoint.entryTime"
                                                            label="Hora entrada" v-maska:[maskTime]></v-text-field>
                                                    </v-row>
                                                    <v-row>
                                                        <v-text-field v-model="editedPoint.entryImage"
                                                            label="Imagem de entrada" readonly></v-text-field>
                                                    </v-row>
                                                    <v-row>
                                                        <v-text-field v-model="editedPoint.entryExpressio"
                                                            label="Expressão" readonly></v-text-field>
                                                    </v-row>
                                                </v-container>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12" sm="6" md="6">
                                                <span v-if="editedPoint.departureImage">
                                                    <img :src="`/api/imagens/${editedPoint.userId}/${editedPoint.departureImage}`"
                                                        @error="setDefaultImage" width="100%">
                                                </span>
                                                <span v-else>
                                                    <img src="/imageFailed.jpg" width="100%">
                                                </span>
                                            </v-col>
                                            <v-col cols="12" sm="6" md="6">
                                                <v-container>
                                                    <v-row>
                                                        <v-text-field type="date" v-model="editedPoint.departureDate"
                                                            label="Data saida"></v-text-field>
                                                        <v-spacer></v-spacer>
                                                        <v-text-field v-model="editedPoint.departureTime"
                                                            label="Hora saida" v-maska:[maskTime]></v-text-field>
                                                    </v-row>
                                                    <v-row>
                                                        <v-text-field v-model="editedPoint.departureImage"
                                                            label="Imagem de saida" readonly></v-text-field>
                                                    </v-row>
                                                    <v-row>
                                                        <v-text-field v-model="editedPoint.departureExpressio"
                                                            label="Expressão" readonly></v-text-field>
                                                    </v-row>
                                                </v-container>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-text-field v-model="editedPoint.observation"
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
            </template>
        </v-data-table>

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
import { snackbarShow } from "~/composables/useUi"

export default {
    data() {
        return {
            dialog: false,
            fullscreen: false,
            snackbar: {
                open: false,
                mensage: null
            },
            load: {
                loading: false,
                mensage: null
            },
            maskDate:
            {
                mask: "####-##-##"
            },
            maskTime:
            {
                mask: "##:##:##"
            },
            points: [],
            token: null,
            headers: [
                { text: 'ID', value: 'id' },
                { text: 'Usuario', value: 'name' },
                { text: 'Entrada data', value: 'entryDate' },
                { text: 'Entrada hora', value: 'entryTime' },
                { text: 'Saida data', value: 'departureDate' },
                { text: 'Saida hora', value: 'departureTime' },
                { text: 'Ações', value: 'action', sortable: false },
            ],
            users: [],
            editedPoint: {
                id: null,
                name: null,
                entryDate: null,
                entryTime: null,
                entryImage: null,
                departureDate: null,
                departureTime: null,
                departureImage: null,
                observation: null,
            },
            defaultItem: {
                id: null,
                name: null,
                entryDate: null,
                entryTime: null,
                entryImage: null,
                departureDate: null,
                departureTime: null,
                departureImage: null,
                observation: null,
            },
        };
    },
    mounted() {
        this.loadPoints()
        this.loadUsers()
    },
    watch: {
        dialog(val) {
            val || this.close()
        },
    },
    computed: {
        formTitle() {
            return this.editedPoint.id === null ? 'Cadastro' : 'Atualizar'
        },
    },
    methods: {
        async loadPoints() {
            const response = await $fetch('/api/points')
            this.points = response.points;
        },
        async loadUsers() {
            const response = await $fetch('/api/users')
            this.users = response.users;
        },
        async editItem(item) {
            const response = await $fetch(`/api/points/${item.id}`)
            this.editedPoint = response.point;
            this.dialog = true
        },
        async save() {
            if (!this.editedPoint.userId) {
                snackbarShow('Selecione um usuario!', 'warning')
                return
            }
            if (this.editedPoint.id) {
                const UpdUser = await $fetch(`/api/points/${this.editedPoint.id}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: this.token
                    },
                    body: JSON.stringify(this.editedPoint)
                })
                if (UpdUser) {
                    snackbarShow('Usuário atualizado com sucesso!', 'success')
                }
            } else {
                this.load.mensage = 'Cadastrando usuario...'
                const NewUser = await $fetch('/api/points', {
                    method: 'POST',
                    headers: {
                        Authorization: this.token
                    },
                    body: JSON.stringify(this.editedPoint)
                })
                if (NewUser) {
                    snackbarShow('Usuário cadastrado com sucesso!', 'success')
                }
            }
            this.loadPoints()
            this.close()
        },
        setDefaultImage(e) {
            e.target.src = '/imageFailed.jpg';
        },
        close() {
            this.dialog = false
            this.$nextTick(() => {
                this.editedPoint = Object.assign({}, this.defaultItem)
            })
        },
    },
};
</script>