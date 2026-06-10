<template>
  <div>
    <div class="d-flex align-center mb-2">
      <v-icon icon="mdi-feather" color="primary" size="large" class="mr-3"></v-icon>
      <h1 class="section-title mb-0">The Scriptorium</h1>
    </div>

    <div class="ornament-divider mb-8"></div>

    <v-row>
      <v-col v-for="(card, index) in cards" :key="index" cols="12" sm="6" md="3">
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
    title: 'Grammar Ranks',
    subtitle: 'Master the rules of the ancient tongue',
    icon: 'mdi-book-alphabet',
    route: '/english/grammar'
  },
  {
    title: 'Vocabulary Tome',
    subtitle: 'Record the words you have conquered',
    icon: 'mdi-book-open-variant',
    route: '/english/vocabulary'
  },
  {
    title: 'Reading Quests',
    subtitle: 'Track your translation journey',
    icon: 'mdi-bookshelf',
    route: '/english/reading'
  },
  {
    title: 'Oral Trials',
    subtitle: 'Log your spoken battles',
    icon: 'mdi-microphone',
    route: '/english/oral'
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