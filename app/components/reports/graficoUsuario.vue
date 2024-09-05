<template>
    <v-dialog v-model="dialog" persistent scrollable :fullscreen="fullscreen">
        <template v-slot:activator>
            {{ label }}
            <v-btn @click="open" icon="mdi-chart-bar" flat size="x-small"></v-btn>
        </template>

        <template v-slot:default>
            <v-card :loading="loading">
                <v-toolbar :title="title ? title : label">
                    <v-spacer></v-spacer>
                    <v-btn icon @click="fullscreen = !fullscreen">
                        <v-icon v-if="!fullscreen">mdi-arrow-expand</v-icon>
                        <v-icon v-else>mdi-arrow-collapse</v-icon>
                    </v-btn>
                    <v-btn icon @click="dialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-text>
                    <apexchart type="bar" :options="options" :series="series"></apexchart>
                </v-card-text>
            </v-card>
        </template>
    </v-dialog>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            default: null,
        },
        id: {
            type: Number,
            required: true,
        },
        dateStart: {
            type: String,
            required: true,
        },
        dateEnd: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            categories: [],
            data: [],
            loading: false,
            dialog: false,
            fullscreen: false,
        };
    },
    computed: {
        options() {
            return {
                chart: {
                    id: 'vuechart-userGraph',
                },
                xaxis: {
                    categories: this.categories,
                },
            };
        },
        series() {
            return [{
                name: 'Hora(s).Minuto(s)',
                data: this.data
            }]
        },
    },
    methods: {
        open() {
            this.LoadData();
            this.dialog = true;
        },
        async LoadData() {
            this.loading = true;
            const resulmo = await $fetch('/api/reports/' + this.id, {
                method: 'POST',
                body: {
                    entryDateStart: this.dateStart,
                    entryDateEnd: this.dateEnd,
                },
            })
            this.categories = resulmo.labels;
            this.data = resulmo.data;
            this.loading = false;
        },
    },
};
</script>