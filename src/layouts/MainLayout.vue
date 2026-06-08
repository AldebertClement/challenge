<template>
  <v-app>
    <v-navigation-drawer
        v-if="!isXs"
        v-model="drawer"
        :permanent="isLgAndUp"
        width="260"
        color="surface"
        class="border-r border-iron"
    >
      <div class="pa-4 text-center">
        <h2 class="text-primary text-h5 mb-2">The Arena</h2>
        <div class="ornament-divider"></div>
      </div>

      <v-list nav>
        <v-list-item to="/" prepend-icon="mdi-castle" title="Dashboard" active-color="primary"></v-list-item>
        <v-list-item to="/sport" prepend-icon="mdi-sword" title="Sport" active-color="primary"></v-list-item>
        <v-list-item to="/english" prepend-icon="mdi-book-open-variant" title="English" active-color="primary"></v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-chip color="primary" variant="outlined" class="w-100 justify-center text-uppercase font-weight-bold">
            Champion: {{ authStore.selectedProfile }}
          </v-chip>
          <v-btn block variant="text" color="error" class="mt-4" @click="handleLogout">
            Flee Arena
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar v-if="!isLgAndUp" color="background" elevation="1" class="border-b border-iron">
      <v-app-bar-nav-icon v-if="!isXs" @click="drawer = !drawer" color="primary"></v-app-bar-nav-icon>
      <v-app-bar-title class="text-primary font-weight-bold">The Arena</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-avatar color="surface-light" size="40" class="mr-4 border border-primary">
        <span class="text-uppercase text-primary">{{ authStore.selectedProfile?.charAt(0) }}</span>
      </v-avatar>
    </v-app-bar>

    <v-main class="bg-background">
      <v-container fluid class="pa-4 pa-md-6">
        <router-view />
      </v-container>
    </v-main>

    <v-bottom-navigation v-if="isXs" bg-color="surface" grow active-color="primary">
      <v-btn to="/">
        <v-icon>mdi-castle</v-icon>
        <span>Home</span>
      </v-btn>
      <v-btn to="/sport">
        <v-icon>mdi-sword</v-icon>
        <span>Sport</span>
      </v-btn>
      <v-btn to="/english">
        <v-icon>mdi-book-open-variant</v-icon>
        <span>English</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const { lgAndUp, xs } = useDisplay()
const authStore = useAuthStore()
const router = useRouter()

const drawer = ref(false)
const isLgAndUp = computed(() => lgAndUp.value)
const isXs = computed(() => xs.value)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.border-iron {
  border-color: #3A3020 !important;
}
</style>