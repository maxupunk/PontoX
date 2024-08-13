<template>
    <v-snackbar-queue v-model="UiStore.snackbar" multi-line vertical
        transition="slide-y-reverse-transition"></v-snackbar-queue>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/UiStore';
const UiStore = useUiStore()
</script>