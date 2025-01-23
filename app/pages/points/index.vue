<template>
    <appBar title="Pontos">
        <v-text-field v-model="pointStore.search" label="Pesquisar" variant="underlined" hide-details
            clearable></v-text-field>
        <v-spacer></v-spacer>
        <point-form @reload="pointStore.fetchPoints(true)" />
    </appBar>
    <v-container>
        <v-infinite-scroll @load="load">
            <v-data-table-virtual :items="pointStore.points" :headers="headers" :loading="loading">
                <template v-slot:item.action="{ item }">
                    <point-form :id="item.id" icon="mdi-pencil" @reload="userStore.fetchUsers()" />
                    <v-icon @click="deleteDialog(item)">
                        mdi-delete
                    </v-icon>
                </template>
            </v-data-table-virtual>
        </v-infinite-scroll>
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

const confirmDelete = ref({
    id: null,
    dialog: false
})

const loading = ref(false)
// used to call the done after the done("ok") or done("empty") in the load function
let infiniteScroll: any = null

const headers = ref([
    { text: 'ID', value: 'id' },
    { text: 'Usuario', value: 'name' },
    { text: 'Entrada data', value: 'entryDate' },
    { text: 'Entrada hora', value: 'entryTime' },
    { text: 'Saida data', value: 'departureDate' },
    { text: 'Saida hora', value: 'departureTime' },
    { text: 'Ações', value: 'action', sortable: false },
])

const debounce = (fn: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

const debouncedFetch = debounce(() => {
    pointStore.fetchPoints(true)
    infiniteScroll('ok')
}, 500)

watch(() => pointStore.search, () => {
    debouncedFetch()
})

function load({ done }: any) {
    // copy the done function to call it later
    infiniteScroll = done
    //
    loading.value = true
    pointStore.fetchPoints().then((res: any) => {
        if (res.hasMore) {
            done('ok')
        } else {
            done('empty')
        }
    }).catch((error: any) => {
        snackbarShow(error, 'error')
        done('error')
    }).finally(() => {
        loading.value = false
    })
}

function deleteDialog(point: any) {
    confirmDelete.value = point
    confirmDelete.value.dialog = true
}

async function deleteItem() {
    if (!confirmDelete.value.id) {
        snackbarShow('Selecione um ponto!', 'warning')
        return
    }
    pointStore.deletePoint(confirmDelete.value.id).then((response: any) => {
        snackbarShow(response.message, 'success')
    }).catch((error: any) => {
        snackbarShow(error.data.message, 'error')
    })
    confirmDelete.value.dialog = false
}
</script>