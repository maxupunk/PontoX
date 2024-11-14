<template>
    <v-container>
        <v-card :loading="loading">
            <v-toolbar flat>
                <v-toolbar-title>Fechamento do mês</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-form ref="form">
                    <v-row>
                        <v-col cols="5">
                            <v-date-input v-model="closingDate" label="Data de fechamento" max-width="368"
                                required :disabled="loading"></v-date-input>
                        </v-col>
                        <v-col cols="4" class="align-center">
                            <v-btn size="x-large" @click="toggleSelectAll" color="primary" :disabled="loading">
                                {{ allSelected ? 'Desselec. todos' : 'Selec. todos' }}
                            </v-btn>
                        </v-col>
                        <v-col cols="3" class="align-center">
                            <v-btn size="x-large" @click="closeMonth" color="success" :disabled="loading">Fechar mês</v-btn>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="4" v-for="user in userStore.users" :key="user.id" style="border: 1px solid #ccc;">
                            <v-checkbox v-model="selectedUsers" :value="user.id" color="primary"
                                :messages="messages[user.id]?.message"
                                :disabled="loading">
                                <template v-slot:label>
                                    {{ user.id }} - {{ user.name }}
                                </template>
                                <template v-slot:message>
                                    <v-alert v-if="messages[user.id]?.message" :color="messages[user.id]?.type"
                                        :text="messages[user.id]?.message"/>
                                </template>
                            </v-checkbox>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '~/stores/UserStore';
import { useBankHourStore } from '~/stores/BankHourStore';
import { snackbarShow } from '~/composables/useUi';

const loading = ref(false);
const userStore = useUserStore();
const bankHourStore = useBankHourStore();
const closingDate = ref();
const selectedUsers = ref<number[]>([]);

const messages = ref<{ [key: number]: { message: string; type: 'success' | 'error' } }>({});
const allSelected = computed(() => selectedUsers.value.length === userStore.users.length);

function toggleSelectAll() {
    if (allSelected.value) {
        selectedUsers.value = [];
    } else {
        selectedUsers.value = userStore.users.map(user => user.id);
    }
}

onMounted(() => {
    userStore.fetchUsers();
});

async function closeMonth() {
    if (!closingDate.value || selectedUsers.value.length === 0) {
        snackbarShow('Por favor, selecione a data e pelo menos um usuário', 'warning');
        return;
    }
    messages.value = {};
    const promises = selectedUsers.value.map(async (userId) => {
        try {
            await bankHourStore.closeMonth(userId, closingDate.value);
            messages.value[userId] = { message: 'Banco de horas fechado com sucesso!', type: 'success' };
        } catch (error: any) {
            messages.value[userId] = { message: error.data.message, type: 'error' };
        }
    });

    loading.value = true;
    await Promise.all(promises);
    loading.value = false;
}
</script>