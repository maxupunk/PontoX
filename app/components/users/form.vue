<template>
    <v-dialog v-model="dialog" persistent scrollable :fullscreen="$vuetify.display.xs || fullscreen">
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" :icon="props.icon ? props.icon : 'mdi-account-plus'" flat></v-btn>
        </template>
        <v-card :loading="loading">
            <form @submit.prevent="save">
                <v-toolbar :title="formTitle">
                    <v-spacer></v-spacer>
                    <v-btn icon type="submit" :loading="loading">
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
                            <v-col cols="12" sm="6" md="6">
                                <v-text-field v-model="userStore.user.name" label="Nome" required></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                                <v-text-field v-model="userStore.user.email" label="E-mail"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-field v-model="userStore.user.login" label="Login"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-field v-model="userStore.user.password" label="Senha"></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-select v-model="userStore.user.role" label="Perfil" :items="['colaborador', 'admin']"
                                    required />
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-switch v-model="userStore.user.status" label="Ativo" color="primary" />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>
            </form>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { snackbarShow } from '~/composables/useUi'
import { useUserStore } from '~/stores/UserStore';

const emit = defineEmits(['reload'])

const props = defineProps<{
    id?: number,
    icon?: string
}>()

const userStore = useUserStore();
const dialog = ref(false)
const fullscreen = ref(false)
const loading = ref(false)

const formTitle = ref(userStore.user.id ? 'Editar Usuário' : 'Novo Usuário')

watch(dialog, (val) => {
    if (val) {
        if (props.id) {
            userStore.fetchUser(props.id)
        } else {
            userStore.user = {}
        }
    }
})

const save = async () => {
    loading.value = true
    if (userStore.user.id) {
        loading.value = true
        await userStore.updateUser(userStore.user.id, userStore.user).then((response: any) => {
            snackbarShow(response.message, 'success')
            emit('reload')
            dialog.value = false
        }).finally(() => {
            loading.value = false
        })
    } else {
        await userStore.createUser(userStore.user).then((response: any) => {
            snackbarShow(response.message, 'success')
            emit('reload')
            dialog.value = false
        }).catch(async (error) => {
            snackbarShow(error.data.message, 'error')
        }).finally(() => {
            loading.value = false
        })
    }
}

const close = () => {
    dialog.value = false
}
</script>