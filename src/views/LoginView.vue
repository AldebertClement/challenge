<template>
  <div class="login-background">
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card class="pa-6 pa-sm-10 login-card" max-width="450" width="100%" elevation="10">

        <div class="text-center mb-8">
          <v-icon size="64" color="primary" class="mb-4">mdi-shield-sword</v-icon>
          <h1 class="text-h4 font-weight-bold text-primary mb-2">The Arena</h1>
          <div class="ornament-divider mb-4"></div>
          <p class="text-on-surface">Identify yourself to enter the proving grounds.</p>
        </div>

        <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mb-6"
            closable
            @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-form @submit.prevent="handleLogin" :disabled="isLoading">
          <v-text-field
              v-model="email"
              label="Scroll Address (Email)"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              color="primary"
              bg-color="surface-light"
              type="email"
              required
              class="mb-2"
          ></v-text-field>

          <v-text-field
              v-model="password"
              label="Secret Code (Password)"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              color="primary"
              bg-color="surface-light"
              :type="showPassword ? 'text' : 'password'"
              required
              class="mb-6"
          ></v-text-field>

          <v-btn
              type="submit"
              color="primary"
              size="x-large"
              block
              :loading="isLoading"
              class="font-weight-bold text-uppercase"
          >
            Enter Arena
          </v-btn>
        </v-form>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please provide both email and password.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(email.value, password.value)
    // Redirect to profile selection after successful login
    router.push({ name: 'SelectProfile' })
  } catch (error) {
    errorMessage.value = error.message || 'Failed to unlock the arena gates. Check your credentials.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-background {
  min-height: 100vh;
  /* Deep radial gradient representing torchlight in a dark stone arena */
  background: radial-gradient(circle at center, #2A2318 0%, #0E0C07 80%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background-color: rgba(28, 24, 16, 0.95) !important; /* surface color with slight transparency */
  backdrop-filter: blur(10px);
}
</style>