<template>
  <div class="mt-8">
    <h3 class="text-h5 text-center mb-6 section-title">Chronicles of Progress</h3>

    <v-card class="bg-surface border-iron pa-4">
      <v-row class="mb-2">
        <v-col cols="12" sm="6">
          <div class="text-caption text-primary mb-1" style="font-family: 'Cinzel', serif;">Warriors</div>
          <v-chip-group v-model="selectedUser" mandatory>
            <v-chip value="both" :color="selectedUser === 'both' ? 'primary' : 'on-surface'" :variant="selectedUser === 'both' ? 'flat' : 'outlined'">Both</v-chip>
            <v-chip value="clement" :color="selectedUser === 'clement' ? 'primary' : 'on-surface'" :variant="selectedUser === 'clement' ? 'flat' : 'outlined'">Clément</v-chip>
            <v-chip value="celio" :color="selectedUser === 'celio' ? 'primary' : 'on-surface'" :variant="selectedUser === 'celio' ? 'flat' : 'outlined'">Celio</v-chip>
          </v-chip-group>
        </v-col>
        <v-col cols="12" sm="6">
          <div class="text-caption text-primary mb-1" style="font-family: 'Cinzel', serif;">Domain</div>
          <v-chip-group v-model="selectedCategory" mandatory>
            <v-chip value="overall" :color="selectedCategory === 'overall' ? 'primary' : 'on-surface'" :variant="selectedCategory === 'overall' ? 'flat' : 'outlined'">Overall</v-chip>
            <v-chip value="sport" :color="selectedCategory === 'sport' ? 'primary' : 'on-surface'" :variant="selectedCategory === 'sport' ? 'flat' : 'outlined'">Sport</v-chip>
            <v-chip value="english" :color="selectedCategory === 'english' ? 'primary' : 'on-surface'" :variant="selectedCategory === 'english' ? 'flat' : 'outlined'">English</v-chip>
          </v-chip-group>
        </v-col>
      </v-row>

      <v-row class="mb-2" v-if="selectedCategory !== 'overall'">
        <v-col cols="12">
          <div class="text-caption text-primary mb-1" style="font-family: 'Cinzel', serif;">Specialization</div>

          <v-select v-if="selectedCategory === 'sport'"
                    v-model="selectedSubFilter"
                    :items="exercises"
                    item-title="name"
                    item-value="id"
                    label="Select Exercise"
                    variant="outlined"
                    density="compact"
                    bg-color="surface-light"
                    color="primary"
                    base-color="on-surface"
          ></v-select>

          <v-chip-group v-if="selectedCategory === 'english'" v-model="selectedSubFilter" mandatory>
            <v-chip value="vocabulary" :color="selectedSubFilter === 'vocabulary' ? 'secondary' : 'on-surface'" :variant="selectedSubFilter === 'vocabulary' ? 'flat' : 'outlined'">Vocabulary</v-chip>
            <v-chip value="grammar-topic" :color="selectedSubFilter === 'grammar-topic' ? 'secondary' : 'on-surface'" :variant="selectedSubFilter === 'grammar-topic' ? 'flat' : 'outlined'">Grammar</v-chip>
            <v-chip value="oral" :color="selectedSubFilter === 'oral' ? 'secondary' : 'on-surface'" :variant="selectedSubFilter === 'oral' ? 'flat' : 'outlined'">Oral</v-chip>
            <v-chip value="reading" :color="selectedSubFilter === 'reading' ? 'secondary' : 'on-surface'" :variant="selectedSubFilter === 'reading' ? 'flat' : 'outlined'">Reading</v-chip>
          </v-chip-group>
        </v-col>
      </v-row>

      <v-row class="mb-2" v-if="selectedCategory === 'sport' && selectedSubFilter">
        <v-col cols="12">
          <v-radio-group v-model="selectedMetric" inline color="primary">
            <v-radio label="Max Weight" value="weight" :disabled="!hasWeightData"></v-radio>
            <v-radio label="Volume" value="volume"></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>

      <v-row class="mb-2 align-center">
        <v-col cols="12" md="8">
          <div class="text-caption text-primary mb-1" style="font-family: 'Cinzel', serif;">Timeframe</div>
          <v-chip-group v-model="dateRange" mandatory>
            <v-chip value="7d" :color="dateRange === '7d' ? 'primary' : 'on-surface'" :variant="dateRange === '7d' ? 'flat' : 'outlined'">7 Days</v-chip>
            <v-chip value="30d" :color="dateRange === '30d' ? 'primary' : 'on-surface'" :variant="dateRange === '30d' ? 'flat' : 'outlined'">30 Days</v-chip>
            <v-chip value="90d" :color="dateRange === '90d' ? 'primary' : 'on-surface'" :variant="dateRange === '90d' ? 'flat' : 'outlined'">90 Days</v-chip>
            <v-chip value="custom" :color="dateRange === 'custom' ? 'primary' : 'on-surface'" :variant="dateRange === 'custom' ? 'flat' : 'outlined'">Custom</v-chip>
          </v-chip-group>
        </v-col>

        <v-col cols="12" md="4" v-if="dateRange === 'custom'" class="d-flex gap-2">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-text-field v-bind="props" v-model="dateFrom" label="From" variant="outlined" density="compact" readonly color="primary" base-color="on-surface"></v-text-field>
            </template>
            <v-date-picker v-model="dateFromRaw" color="primary" @update:modelValue="onDateChange"></v-date-picker>
          </v-menu>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-text-field v-bind="props" v-model="dateTo" label="To" variant="outlined" density="compact" readonly class="ml-2" color="primary" base-color="on-surface"></v-text-field>
            </template>
            <v-date-picker v-model="dateToRaw" color="primary" @update:modelValue="onDateChange"></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>

      <v-row class="mb-4">
        <v-col cols="12">
          <v-btn-toggle v-model="chartType" mandatory color="primary" variant="outlined" divided>
            <v-btn value="line"><v-icon icon="mdi-chart-line"></v-icon></v-btn>
            <v-btn value="bar"><v-icon icon="mdi-chart-bar"></v-icon></v-btn>
            <v-btn value="table"><v-icon icon="mdi-table"></v-icon></v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>

      <div :style="{ height: isMobile ? '280px' : '420px', minHeight: '280px' }" class="w-100 mt-4 border-iron rounded">
        <apexchart
            v-show="chartType !== 'table'"
            :type="chartType === 'bar' ? 'bar' : 'line'"
            :height="isMobile ? 280 : 420"
            :options="chartOptions"
            :series="safeSeries"
        />

        <v-data-table
            v-if="chartType === 'table'"
            :items="tableData"
            density="compact"
            class="bg-transparent h-100 w-100 overflow-auto"
        ></v-data-table>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import VueApexCharts from 'vue3-apexcharts'
import { medievalChartDefaults } from '@/utils/chartDefaults'

const apexchart = VueApexCharts
const props = defineProps({
  exercises: { type: Array, default: () => [] }
})

const { xs } = useDisplay()
const isMobile = computed(() => xs.value)

const selectedUser = ref('both')
const selectedCategory = ref('overall')
const selectedSubFilter = ref(null)
const selectedMetric = ref('volume')
const dateRange = ref('30d')
const dateFromRaw = ref(new Date())
const dateToRaw = ref(new Date())
const chartType = ref('line')
const chartSeries = ref([])

const dateFrom = computed(() => dateFromRaw.value?.toISOString().split('T')[0] || '')
const dateTo = computed(() => dateToRaw.value?.toISOString().split('T')[0] || '')

const safeSeries = computed(() =>
    chartSeries.value?.length ? chartSeries.value : [{ name: 'No data', data: [] }]
)

const chartOptions = computed(() => ({
  ...medievalChartDefaults,
  chart: { ...medievalChartDefaults.chart, type: chartType.value },
  xaxis: { ...medievalChartDefaults.xaxis, categories: [] }
}))

function onDateChange() {}

const hasWeightData = computed(() => true)
const tableData = computed(() => [])
</script>