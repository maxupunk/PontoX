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
                    <v-dialog v-model="dialog" max-width="720px" :fullscreen="$vuetify.display.xs">
                        <template v-slot:activator="{ props }">
                            <v-btn color="primary" v-bind="props">
                                Criar ponto
                            </v-btn>
                        </template>
                        <v-card>
                            <v-card-title>
                                <span class="text-h4">{{ formTitle }}</span>
                            </v-card-title>

                            <v-card-text>
                                <v-container>
                                    <v-row>
                                        <v-select :items="users" item-value="id" item-title="name"
                                            v-model="editedPoint.userId" label="Usuario"></v-select>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12" sm="6" md="6">
                                            <span v-if="editedPoint.entryImage">
                                                <img :src="`imagens/${editedPoint.userId}/${editedPoint.entryImage}`"
                                                    @error="setDefaultImage" width="100%">
                                            </span>
                                            <span v-else>
                                                <img src="/imageFailed.jpg" width="100%">
                                            </span>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-container>
                                                <v-row>
                                                    <v-text-field v-model="editedPoint.entryDate" label="Entrada"
                                                        v-maska:[mask]></v-text-field>
                                                </v-row>
                                                <v-row>
                                                    <v-text-field v-model="editedPoint.entryImage" label="Imagem de entrada"
                                                        readonly></v-text-field>
                                                </v-row>
                                                <v-row>
                                                    <v-text-field v-model="editedPoint.entryExpressio" label="Expressão"
                                                        readonly></v-text-field>
                                                </v-row>
                                            </v-container>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12" sm="6" md="6">
                                            <span v-if="editedPoint.entryImage">
                                                <img :src="`imagens/${editedPoint.userId}/${editedPoint.departureImage}`"
                                                    @error="setDefaultImage" width="100%">
                                            </span>
                                            <span v-else>
                                                <img src="/imageFailed.jpg" width="100%">
                                            </span>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="6">
                                            <v-container>
                                                <v-row>
                                                    <v-text-field v-model="editedPoint.departureDate" label="Saida"
                                                        v-maska:[mask]></v-text-field>
                                                </v-row>
                                                <v-row>
                                                    <v-text-field v-model="editedPoint.departureImage"
                                                        label="Imagem de saida" readonly></v-text-field>
                                                </v-row>
                                                <v-row>
                                                    <v-text-field v-model="editedPoint.departureExpressio" label="Expressão"
                                                        readonly></v-text-field>
                                                </v-row>
                                            </v-container>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-text-field v-model="editedPoint.observation" label="Observação"></v-text-field>
                                    </v-row>
                                </v-container>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" @click="close">
                                    Cancel
                                </v-btn>
                                <v-btn color="blue-darken-1" variant="text" @click="save">
                                    Save
                                </v-btn>
                            </v-card-actions>
                        </v-card>
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
    <AdminPassowrd ref="adminPassowrd"></AdminPassowrd>
</template>
  
<script>
import AdminPassowrd from '~/components/AdminPassowrd.vue';

export default {
    data() {
        return {
            dialog: false,
            snackbar: {
                open: false,
                mensage: null
            },
            load: {
                loading: false,
                mensage: null
            },
            mask:
            {
                mask: "####-##-## ##:##"
            },
            points: [],
            token: null,
            headers: [
                { text: 'ID', value: 'id' },
                { text: 'Usuario', value: 'name' },
                { text: 'Entrada', value: 'entryDate' },
                { text: 'Saida', value: 'departureDate' },
                { text: 'Ações', value: 'action', sortable: false },
            ],
            users: [],
            editedPoint: {
                id: null,
                name: null,
                entryDate: null,
                entryImage: null,
                departureDate: null,
                departureImage: null,
                observation: null,
            },
            defaultItem: {
                id: null,
                name: null,
                entryDate: null,
                entryImage: null,
                departureDate: null,
                departureImage: null,
                observation: null,
            },
        };
    },
    components: {
        AdminPassowrd
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
        async openAdminPassowrd() {
            return await this.$refs.adminPassowrd.open().then((token) => {
                if (token) {
                    this.token = token
                }
            })
        },
        async loadPoints() {
            this.load.loading = true
            this.load.mensage = 'Buscando dados...'
            const response = await $fetch('/api/points')
            this.points = response.points;
            this.load.loading = false
        },
        async loadUsers() {
            this.load.loading = true
            this.load.mensage = 'Buscando dados de usuarios...'
            const response = await $fetch('/api/users')
            this.users = response.users;
            this.load.loading = false
        },
        async editItem(item) {
            this.load.loading = true
            this.load.mensage = 'Buscando usuario...'
            const response = await $fetch(`/api/points/${item.id}`)
            this.editedPoint = response.point;
            this.dialog = true
            this.load.loading = false
        },
        async save() {
            await this.openAdminPassowrd()
            this.load.loading = true
            if (this.editedPoint.id) {
                this.load.mensage = 'Atualizando usuario...'
                const UpdUser = await $fetch(`/api/points/${this.editedPoint.id}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: this.token
                    },
                    body: JSON.stringify(this.editedPoint)
                })
                if (UpdUser.changes) {
                    this.snackbar.open = true
                    this.snackbar.mensage = 'Usuário atualizado com sucesso!'
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
                if (NewUser.changes) {
                    this.snackbar.open = true
                    this.snackbar.mensage = 'Usuário cadastrado com sucesso!'
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