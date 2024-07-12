<template>
    <v-text-field density="compact" hide-details v-model="model" :active="menu" :label="props.label"
        prepend-inner-icon="mdi-clock-time-four-outline" readonly>
        <v-menu v-model="menu" :close-on-content-click="false" activator="parent" transition="scale-transition">
            <v-time-picker header-color="primary" v-model="model" :max="props.max" format="24hr" @update:minute="closeMenu"></v-time-picker>
        </v-menu>
    </v-text-field>
</template>

<script setup lang="ts">
const props = defineProps({
    label: { type: String, required: true },
    max: { type: String, default: null },
})
const model = defineModel()

const menu = ref(false)

const closeMenu = () => {
    menu.value = false
}
</script>