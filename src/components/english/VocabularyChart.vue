<template>
  <v-card class="chart-card" elevation="0">
    <v-card-title class="text-h5 font-weight-bold text-center border-bottom mb-4">
      Tome of Progress
    </v-card-title>
    <v-card-text class="d-flex justify-center align-center">
      <div class="chart-wrapper" :style="{ height: chartHeight + 'px', width: '100%' }">
        <Bar v-if="chartData.labels && chartData.labels.length" :data="chartData" :options="chartOptions" />
        <p v-else class="text-center font-italic mt-10">Unrolling parchment... No entries logged yet.</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { useEnglishStore } from '@/stores/english.store'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const store = useEnglishStore()
const { smAndDown } = useDisplay()

// Responsive dimension rules
const chartHeight = computed(() => smAndDown.value ? 280 : 400)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: !smAndDown.value,
      labels: {
        font: { family: "'Crimson Text', serif", size: 14 },
        color: '#3e2723'
      }
    },
    title: { display: false }
  },
  scales: {
    x: {
      ticks: { font: { family: "'Crimson Text', serif" }, color: '#3e2723' },
      grid: { color: 'rgba(139, 90, 43, 0.2)' }
    },
    y: {
      ticks: { font: { family: "'Crimson Text', serif" }, color: '#3e2723', stepSize: 5 },
      beginAtZero: true,
      grid: { color: 'rgba(139, 90, 43, 0.2)' }
    }
  }
}))

const chartData = computed(() => {
  if (!store.vocabularyLogs || !store.vocabularyLogs.length) return {}

  const latestLogs = [...store.vocabularyLogs].slice(0, 7).reverse()

  return {
    labels: latestLogs.map(d => d.date),
    datasets: [
      {
        label: 'Words Learned',
        backgroundColor: '#8b5a2b',
        data: latestLogs.map(d => d.words_learned) // Matches store layout
      },
      {
        label: 'Words Reviewed',
        backgroundColor: '#d4af37',
        data: latestLogs.map(d => d.words_reviewed) // Matches store layout
      }
    ]
  }
})
</script>

<style scoped>
.chart-card {
  background: transparent !important;
  border: 1px dashed #8b5a2b;
  border-radius: 4px;
  padding: 1rem;
}

.border-bottom {
  border-bottom: 1px solid #8b5a2b;
  padding-bottom: 0.5rem;
}

.chart-wrapper {
  position: relative;
}
</style>