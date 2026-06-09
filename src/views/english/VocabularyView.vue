<template>
  <v-container class="scholar-tome">
    <v-row>
      <v-col cols="12" class="text-center mb-6">
        <h1 class="tome-title">The Scholar's Lexicon</h1>
        <p class="tome-subtitle">Chronicles of Words Mastered</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <VocabularyForm @log-added="refreshChart" />
      </v-col>
      <v-col cols="12" md="8">
        <VocabularyChart ref="chartRef" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import VocabularyForm from '@/components/VocabularyForm.vue'
import VocabularyChart from '@/components/VocabularyChart.vue'

const chartRef = ref(null)

const refreshChart = () => {
  if (chartRef.value) {
    chartRef.value.fetchData()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.scholar-tome {
  font-family: 'Crimson Text', serif;
  background-color: #f4ecd8; /* Parchment base */
  background-image: url('https://www.transparenttextures.com/patterns/aged-paper.png');
  border: 8px double #5c4033;
  border-radius: 4px;
  padding: 2rem;
  color: #3e2723;
  box-shadow: inset 0 0 20px rgba(92, 64, 51, 0.4), 0 10px 20px rgba(0,0,0,0.4);
  min-height: 80vh;
}

.tome-title {
  font-size: 3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  border-bottom: 2px solid #5c4033;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.tome-subtitle {
  font-size: 1.5rem;
  font-style: italic;
  color: #5c4033;
}
</style>