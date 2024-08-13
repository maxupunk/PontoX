<template>
    <v-card>
        <v-card-title>
            Backups
        </v-card-title>
        <v-card-text>
            <v-list>
                <v-list-item v-for="backup in backups" :key="backup">
                    <template v-slot:prepend>
                        {{ backup }}
                    </template>
                    <template v-slot:append>
                        <v-btn icon="mdi-download" variant="text" @click="downloadBackup(backup)"></v-btn>
                    </template>
                </v-list-item>
            </v-list>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="createBackup">
                Criar backup
            </v-btn>
            <v-spacer></v-spacer>
        </v-card-actions>
    </v-card>
</template>
  
<script>
export default {
    data() {
        return {
            backups: []
        }
    },
    mounted() {
        this.getListBackup()
    },
    methods: {
        async getListBackup() {
            this.backups = await $fetch('/api/backup/list')
        },
        async downloadBackup(backup) {
            const response = await $fetch('/api/backup/' + backup)
            const date = new Date()
            const fileName = `${date.getFullYear()}-${(date.getMonth() + 1)}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.zip`
            // Cria um link invisível e clica nele para iniciar o download
            const link = document.createElement('a');
            link.href = response;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        async createBackup() {
            const result = await $fetch('/api/backup/create')
            if (result) {
                this.getListBackup()
            }
        }
    },
};
</script>