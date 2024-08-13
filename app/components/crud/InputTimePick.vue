<template>
    <v-menu v-model="isMenuOpen" :close-on-content-click="false" transition="scale-transition">
        <template v-slot:activator="{ props }">
            <v-text-field :label="label" :model-value="formattedTime" readonly v-bind="props" variant="solo"
                hide-details></v-text-field>
        </template>
        <v-time-picker header-color="primary" v-model="selectedTime" :max="props.max" :min="props.min" format="24hr">
        </v-time-picker>
    </v-menu>
</template>

<script setup lang="ts">
const props = defineProps({
    label: { type: String, required: true },
    max: { type: String, default: null },
    min: { type: String, default: null },
    modelValue: { type: String, required: true },
})

const emit = defineEmits(["update:modelValue"]);

const selectedTime = ref(props.modelValue);
const isMenuOpen = ref(false)

const formattedTime = computed(() => {
    return selectedTime.value ? selectedTime.value : "";
});

watch(selectedTime, (newDate) => {
    emit("update:modelValue", newDate);
    isMenuOpen.value = false
});
</script>