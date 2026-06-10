<template>
  <div>
    <div class="d-flex align-center mb-2">
      <v-icon icon="mdi-sword" color="primary" size="large" class="mr-3"></v-icon>
      <h1 class="section-title mb-0">The Battlegrounds</h1>
    </div>

    <div class="ornament-divider mb-8"></div>

    <v-row>
      <v-col v-for="(card, index) in cards" :key="index" cols="12" sm="4">
        <v-card
            class="nav-card h-100 d-flex flex-column align-center pa-6"
            color="surface"
            rounded="lg"
            v-ripple
            @click="$router.push(card.route)"
        >
          <v-icon :icon="card.icon" size="48" color="primary" class="mb-4"></v-icon>
          <h3 class="section-title text-center text-h6">{{ card.title }}</h3>
          <p class="text-on-surface text-center mt-2 flex-grow-1">{{ card.subtitle }}</p>
          <v-btn variant="text" color="primary" class="mt-4 w-100">Enter &rarr;</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const cards = ref([
  {
    title: 'Exercise Library',
    subtitle: 'Manage your weapons and techniques',
    icon: 'mdi-dumbbell',
    route: '/sport/exercises'
  },
  {
    title: 'Battle Templates',
    subtitle: 'Build and share your battle plans',
    icon: 'mdi-sword',
    route: '/sport/templates'
  },
  {
    title: 'Battle History',
    subtitle: 'Review your past conquests',
    icon: 'mdi-history',
    route: '/sport/history'
  }
])
</script>

<style scoped>
.nav-card {
  border: 1px solid #3A3020 !important;
  transition: all 0.3s ease;
  cursor: pointer;
}
.nav-card:hover {
  box-shadow: 0 0 16px rgba(201,168,76,0.3) !important;
}
.text-on-surface {
  color: #D4C5A9;
}
</style>