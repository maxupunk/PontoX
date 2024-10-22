<template>
    <v-dialog v-model="isOpen" persistent max-width="500">
        <v-card>
            <v-toolbar color="red" dark>
                <v-toolbar-title>Confirmação de delete</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="cancel">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text>{{ text }}</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" @click="cancel">Cancelar</v-btn>
                <v-btn color="red" @click="confirm">Excluir</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
const isOpen = ref(false);
let resolvePromise: (value: boolean) => void;

const text = ref('');

function open(textD?: string): Promise<boolean> {
    text.value = textD ? textD : 'Você tem certeza que deseja excluir este item?';
    isOpen.value = true;
    return new Promise((resolve) => {
        resolvePromise = resolve;
    });
}

function confirm() {
    isOpen.value = false;
    resolvePromise(true);
}

function cancel() {
    isOpen.value = false;
    resolvePromise(false);
}

defineExpose({ open });
</script>