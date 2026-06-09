<template>
  <div class="selection-background">
    <v-container class="fill-height d-flex flex-column align-center justify-center">

      <div class="text-center mb-10 w-100">
        <h1 class="text-h3 font-weight-bold text-primary mb-4 text-uppercase" style="letter-spacing: 0.1em;">
          Choose Your Champion
        </h1>
        <div class="ornament-divider mx-auto" style="max-width: 400px;"></div>
      </div>

      <v-row class="w-100 justify-center" style="max-width: 900px;">

        <v-col cols="12" md="6" class="px-md-4 mb-4 mb-md-0">
          <v-card
              class="champion-card text-center pa-8 d-flex flex-column align-center justify-center h-100"
              @click="chooseChampion('clement')"
              ripple
          >
            <v-avatar size="120" color="surface-light" class="mb-6 border-primary border-md">
              <v-icon size="64" color="primary">mdi-sword-cross</v-icon>
            </v-avatar>
            <h2 class="text-h4 text-on-background mb-2">Clément</h2>
            <p class="text-on-surface">Step into the arena as Clément.</p>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" class="px-md-4">
          <v-card
              class="champion-card text-center pa-8 d-flex flex-column align-center justify-center h-100"
              @click="chooseChampion('celio')"
              ripple
          >
            <v-avatar size="120" color="surface-light" class="mb-6 border-primary border-md">
              <v-icon size="64" color="primary">mdi-shield-star</v-icon>
            </v-avatar>
            <h2 class="text-h4 text-on-background mb-2">Celio</h2>
            <p class="text-on-surface">Step into the arena as Celio.</p>
          </v-card>
        </v-col>

      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const chooseChampion = (championName) => {
  authStore.selectProfile(championName)
  // Route to the dashboard once a profile is selected
  router.push({ name: 'Dashboard' })
}
</script>

<style scoped>
.selection-background {
  min-height: 100vh;
  background-color: #0E0C07;
  background-image: linear-gradient(to bottom, #1C1810 0%, #0E0C07 100%);
}

.champion-card {
  background-color: #1C1810 !important;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid #3A3020 !important;
}

.champion-card:hover {
  transform: translateY(-5px);
  border-color: #C9A84C !important;
  box-shadow: 0 0 25px rgba(201, 168, 76, 0.25), inset 0 0 15px rgba(201, 168, 76, 0.1) !important;
}

.border-md {
  border-width: 2px !important;
  border-style: solid !important;
}

.border-primary {
  border-color: #C9A84C !important;
}
</style>