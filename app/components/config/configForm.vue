<template>
    <v-card flat>
        <v-card-title>Configuração de identificação facial</v-card-title>
        <v-card-subtitle>Isso altera a velocidade e a precisão da identificação facil no PONTO e em adicionar foto de
            usuario.</v-card-subtitle>
        <v-form @submit.prevent="submitForm">
            <v-card-text>
                <v-radio-group v-model="selectedMethod" label="Face Detection Metodo:" inline>
                    <v-radio value="TinyFaceDetector" label="TinyFaceDetector (rapido e menos preciso)" />
                    <v-radio value="SsdMobilenetv1" label="SsdMobilenetv1 (boa precisão e velocidade)" />
                    <v-radio value="Mtcnn" label="Mtcnn (lento e muito preciso)" />
                </v-radio-group>

                <v-text-field v-model.number="distanceThreshold"
                    label="Limiar de distância (quanto menor, mais preciso)" type="number" variant="outlined" :min="0.2"
                    :max="0.9" :rules="[
                        v => v >= 0.2 || 'Minimo é 0.2',
                        v => v <= 0.9 || 'Maximo é 0.9'
                    ]" step="0.1" />

                <p>
                    * Metodo: o quanto de processamento vai usar para identificar o rosto.
                </p>
                <p>
                    * Limiar de distância: precisão de comparação entre a foto do treinamento
                    e a foto do usuário na hora do ponto. Se o numero for menos do que 0.4 existe uma possibilidade
                    de
                    não reconhecer se a image oferecida para treinamento e a foto tirada não tenha uma boa
                    qualiadade.
                </p>
            </v-card-text>
            <v-card-actions>
                <v-btn color="success" type="submit" block>
                    Salva as configurações
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import { useConfigStore } from '~/stores/config';

const configStore = useConfigStore();
const selectedMethod = ref(configStore.faceDetectionMethod);
const distanceThreshold = ref(configStore.distanceThreshold);

const submitForm = () => {
    configStore.setFaceDetectionMethod(selectedMethod.value);
    configStore.setDistanceThreshold(distanceThreshold.value);
    snackbarShow('Configurações salvas com sucesso', 'success');
};

</script>