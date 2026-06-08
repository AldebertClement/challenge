<template>
    <v-app>
        <router-view />
    </v-app>
</template>

<script setup>
    import { onMounted } from 'vue'
    import { useAuthStore } from '@/stores/auth.store'

    const authStore = useAuthStore()

    onMounted(() => {
    authStore.initializeAuth()
})
</script>