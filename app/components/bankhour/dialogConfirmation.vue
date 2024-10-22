<template>
    <v-dialog v-model="isOpen" persistent max-width="500">
        <v-card>
            <v-toolbar color="primary" dark>
                <v-toolbar-title>Fechar o período</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="cancel">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text>
                <v-date-input v-model="date" variant="underlined" autofocus />
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" @click="cancel">Cancelar</v-btn>
                <v-btn color="success" @click="confirm">confirmar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
const isOpen = ref(false);
let resolvePromise: (value: any) => void;

const date = ref<any>(null)

function open(): Promise<string | boolean> {
    isOpen.value = true;
    return new Promise((resolve) => {
        resolvePromise = resolve;
    });
}

function confirm() {
    isOpen.value = false;
    resolvePromise(date.value);
}

function cancel() {
    isOpen.value = false;
    resolvePromise(false);
}

defineExpose({ open });
</script>