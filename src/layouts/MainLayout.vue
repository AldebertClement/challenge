<template>
  <v-app>
    <v-layout>
      <v-navigation-drawer
          v-model="drawer"
          :permanent="isLgAndUp"
          :temporary="!isLgAndUp"
          width="260"
          color="surface"
          class="border-r border-iron"
      >
        <div class="pa-4 text-center">
          <h2 class="text-primary text-h5 mb-2">The Arena</h2>
          <div class="ornament-divider"></div>
        </div>

        <v-list nav>
          <v-list-item exact to="/" prepend-icon="mdi-castle" title="Dashboard" color="primary"></v-list-item>
          <v-list-item exact to="/sport" prepend-icon="mdi-sword" title="Sport" color="primary"></v-list-item>
          <v-list-item exact to="/english" prepend-icon="mdi-book-open-variant" title="English" color="primary"></v-list-item>
        </v-list>

        <template v-slot:append>
          <div class="pa-4">
            <v-chip
                color="primary"
                variant="outlined"
                class="w-100 justify-center text-uppercase font-weight-bold"
            >
              Champion: {{ authStore.selectedProfile }}
            </v-chip>

            <v-btn
                block
                variant="text"
                color="error"
                class="mt-4"
                @click="handleLogout"
            >
              Flee Arena
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>

      <v-app-bar
          color="background"
          elevation="1"
          class="border-b border-iron"
      >
        <v-app-bar-nav-icon
            v-if="!isLgAndUp"
            @click="drawer = !drawer"
            color="primary"
        />

        <v-app-bar-title class="text-primary font-weight-bold">
          The Arena
        </v-app-bar-title>

        <v-spacer></v-spacer>

        <v-avatar
            color="surface-light"
            size="40"
            class="mr-4 border border-primary"
        >
          <span class="text-uppercase text-primary">
            {{ authStore.selectedProfile?.charAt(0) }}
          </span>
        </v-avatar>
      </v-app-bar>

      <v-main class="bg-background">
        <v-container fluid class="pa-4 pa-md-6">
          <router-view />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const { lgAndUp } = useDisplay()

const authStore = useAuthStore()
const router = useRouter()

const drawer = ref(lgAndUp.value)
const isLgAndUp = computed(() => lgAndUp.value)

watch(lgAndUp, (val) => {
  if (val) drawer.value = true
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.border-iron {
  border-color: #3A3020 !important;
}

/* Les FAB peuvent revenir à leur position normale */
:deep(.v-btn--icon.fab-action),
:deep(.fab-action) {
  bottom: 16px !important;
}
</style>