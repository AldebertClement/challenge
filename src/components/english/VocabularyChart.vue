<template>
  <v-card class="chart-card" elevation="0">
    <v-card-title class="text-h5 font-weight-bold text-center border-bottom mb-4">
      Tome of Progress
    </v-card-title>
    <v-card-text class="d-flex justify-center align-center">
      <div class="chart-wrapper" :style="{ height: chartHeight + 'px', width: '100%' }">
        <Bar v-if="chartData.labels" :data="chartData" :options="chartOptions" />
        <p v-else class="text-center font-italic mt-10">Unrolling parchment...</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { supabase } from '@/supabase'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const { smAndDown } = useDisplay()

// Responsive logic based on rules
const chartHeight = computed(() => smAndDown.value ? 280 : 400)

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: !smAndDown.value, // Hides legend on xs/sm
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

const chartData = ref({})

const fetchData = async () => {
  const { data, error } = await supabase
      .from('vocabulary_logs')
      .select('date, learned, reviewed')
      .order('date', { ascending: false }) // Get latest first
      .limit(7)

  if (!error && data) {
    // Reverse to display chronologically left-to-right
    const chronologicalData = data.reverse()

    chartData.value = {
      labels: chronologicalData.map(d => d.date),
      datasets: [
        {
          label: 'Words Learned',
          backgroundColor: '#8b5a2b', // Deep medieval brown
          data: chronologicalData.map(d => d.learned)
        },
        {
          label: 'Words Reviewed',
          backgroundColor: '#d4af37', // Medieval Gold
          data: chronologicalData.map(d => d.reviewed)
        }
      ]
    }
  }
}

defineExpose({ fetchData })

onMounted(() => {
  fetchData()
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