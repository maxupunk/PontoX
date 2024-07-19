<template>
    <v-container>
        <v-card>
            <v-card-actions>
                <v-container>
                    <v-row>
                        <v-col cols="6">
                            <v-text-field type="date" label="Data inical" v-model="entryDateStart"></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field type="date" label="Date final" v-model="entryDateEnd"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-actions>
            <v-card-subtitle>
                Relatorio resumo de horas trabalhadas
            </v-card-subtitle>
            <v-card-text>
                <v-table>
                    <thead>
                        <tr>
                            <th class="text-left">
                                Nome
                            </th>
                            <th class="text-left">
                                Horas / minutos
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in users" :key="item.name">
                            <td>
                                <graficoUsuario :label="item.name" :id="item.id" :dateStart="entryDateStart"
                                    :dateEnd="entryDateEnd"></graficoUsuario>
                            </td>
                            <td>
                                {{ item.hours }} hora(s)
                                <span v-if="item.minuites"> / {{ item.minuites }} minuto(s)</span>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
import graficoUsuario from '~/components/reports/graficoUsuario.vue';

export default {
    data() {
        return {
            loading: false,
            entryDateStart: '',
            entryDateEnd: '',
            users: [],
            timer: null,
        };
    },
    components: { graficoUsuario },
    watch: {
        entryDateStart() {
            this.debouncedFetchData();
        },
        entryDateEnd() {
            this.debouncedFetchData();
        },
    },
    methods: {
        debouncedFetchData() {
            clearTimeout(this.timer);
            this.timer = setTimeout(this.fetchData, 1000);
        },
        async fetchData() {
            this.loading = true;
            const resulmo = await $fetch('/api/reports/resumo', {
                method: 'POST',
                body: {
                    entryDateStart: this.entryDateStart,
                    entryDateEnd: this.entryDateEnd,
                },
            })
            this.users = resulmo;
            this.loading = false;
        },
    },
};
</script>