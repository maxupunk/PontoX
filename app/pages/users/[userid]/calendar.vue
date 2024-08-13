<template>
    <v-container>
        <v-card>
            <v-tabs v-model="tab">
                <v-tab value="week">Semana padrão</v-tab>
                <v-tab value="month">Gerencia período</v-tab>
            </v-tabs>

            <v-card-text>
                <v-tabs-window v-model="tab">
                    <v-tabs-window-item value="week">
                        <week-manager :userid="userid" />
                    </v-tabs-window-item>

                    <v-tabs-window-item value="month">
                        <period-generator :userid="userid" />
                    </v-tabs-window-item>
                </v-tabs-window>
            </v-card-text>
        </v-card>
    </v-container>
</template>
<script setup lang="ts">
import { defineComponent, ref } from 'vue'
import weekManager from '~/components/users/weekManager.vue';
import periodGenerator from '~/components/users/periodGenerator.vue';
defineComponent({
    name: 'Calendar',
    components: { weekManager, periodGenerator },
})

const { params } = useRoute()
const userid = Number(params.userid)
const tab = ref('week')

</script>