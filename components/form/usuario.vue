<template>
    <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field v-model="user.nome" label="Nome" :rules="requiredRules" />
        <v-text-field v-model="user.email" label="Email" />
        <v-text-field v-model="user.login" label="Login" :rules="requiredRules" />
        <v-text-field v-model="user.password" label="Senha" :rules="requiredRules" type="password" />
        <v-select v-model="user.role" label="Cargo" :items="['funcionario', 'admin']" />
        <v-switch v-model="user.status" label="Ativo" color="primary" />
        <v-btn color="success" :disabled="!valid" @click="submit">
            Registrar
        </v-btn>
    </v-form>
</template>

<script>
export default {
    props: ['user'],
    data() {
        return {
            snackbar: false,
            valid: true,
            requiredRules: [(v) => !!v || 'Este campo é obrigatório'],
            emailRules: [(v) => /.+@.+\..+/.test(v) || 'E-mail inválido'],
        };
    },
    methods: {
        submit() {
            this.$emit('submit');
        },
    },
};
</script>