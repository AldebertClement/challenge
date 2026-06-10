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
            <v-date-picker v-model="dateFromRaw" color="primary"></v-date-picker>
          </v-menu>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-text-field v-bind="props" v-model="dateTo" label="To" variant="outlined" density="compact" readonly class="ml-2" color="primary" base-color="on-surface"></v-text-field>
            </template>
            <v-date-picker v-model="dateToRaw" color="primary"></v-date-picker>
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
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import VueApexCharts from 'vue3-apexcharts'
import { medievalChartDefaults } from '@/utils/chartDefaults'

const apexchart = VueApexCharts

const props = defineProps({
  exercises:      { type: Array, default: () => [] },
  workouts:       { type: Array, default: () => [] },
  workoutSets:    { type: Array, default: () => [] },
  grammarTests:   { type: Array, default: () => [] },
  vocabularyLogs: { type: Array, default: () => [] },
  oralSessions:   { type: Array, default: () => [] },
  readingLogs:    { type: Array, default: () => [] },
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
const chartCategories = ref([])

const dateFrom = computed(() => dateFromRaw.value?.toISOString().split('T')[0] || '')
const dateTo = computed(() => dateToRaw.value?.toISOString().split('T')[0] || '')

// --- Helpers ---

function getDateBounds() {
  const now = new Date()
  let from
  if (dateRange.value === '7d')  from = new Date(now - 7  * 86400000)
  if (dateRange.value === '30d') from = new Date(now - 30 * 86400000)
  if (dateRange.value === '90d') from = new Date(now - 90 * 86400000)
  if (dateRange.value === 'custom') {
    from = new Date(dateFrom.value)
    return { from, to: new Date(dateTo.value) }
  }
  return { from, to: now }
}

function inRange(dateStr) {
  if (!dateStr) return false
  const { from, to } = getDateBounds()
  const d = new Date(dateStr)
  return d >= from && d <= to
}

function getUserFilter() {
  if (selectedUser.value === 'both') return ['clement', 'celio']
  return [selectedUser.value]
}

// --- Series Compute Functions ---

function computeArenaPointsSeries() {
  const users = getUserFilter()
  const { from, to } = getDateBounds()

  const series = users.map(user => {
    const pointsByDay = {}

    // Sport
    props.workouts
        .filter(w => w.user_name === user && inRange(w.date))
        .forEach(w => { pointsByDay[w.date] = (pointsByDay[w.date] || 0) + 15 })

    // Grammar
    props.grammarTests
        .filter(t => t.user_name === user && t.passed && inRange(t.tested_at?.split('T')[0]))
        .forEach(t => {
          const d = t.tested_at.split('T')[0]
          pointsByDay[d] = (pointsByDay[d] || 0) + 30
        })

    // Vocabulary
    const userVocab = props.vocabularyLogs
        .filter(v => v.user_name === user && inRange(v.date))
        .sort((a, b) => a.date.localeCompare(b.date))

    userVocab.forEach((entry, i) => {
      const prev = i > 0 ? userVocab[i - 1].words_learned : 0
      const gained = Math.max(0, entry.words_learned - prev)
      const pts = Math.floor(gained / 100) * 10
      if (pts > 0) pointsByDay[entry.date] = (pointsByDay[entry.date] || 0) + pts
    })

    // Oral
    props.oralSessions
        .filter(o => o.user_name === user && inRange(o.date))
        .forEach(o => {
          const pts = Math.floor(o.duration / 60) * 20
          if (pts > 0) pointsByDay[o.date] = (pointsByDay[o.date] || 0) + pts
        })

    // Reading
    props.readingLogs
        .filter(r => r.user_name === user && inRange(r.week_start))
        .forEach(r => {
          const pts = Math.floor(r.pages_translated / 10) * 5
          if (pts > 0) pointsByDay[r.week_start] = (pointsByDay[r.week_start] || 0) + pts
        })

    const sortedDays = Object.keys(pointsByDay).sort()
    let cumulative = 0
    const data = sortedDays.map(d => {
      cumulative += pointsByDay[d]
      return { x: d, y: cumulative }
    })

    return {
      name: user === 'clement' ? 'Clément' : 'Celio',
      data
    }
  })

  const allDates = [...new Set(series.flatMap(s => s.data.map(d => d.x)))].sort()
  return { series, categories: allDates }
}

function computeSportSeries() {
  if (!selectedSubFilter.value) return { series: [], categories: [] }

  const users = getUserFilter()
  const exerciseId = selectedSubFilter.value

  const series = users.map(user => {
    const userWorkoutIds = props.workouts
        .filter(w => w.user_name === user && inRange(w.date))
        .map(w => w.id)

    const relevantSets = props.workoutSets.filter(s =>
        s.exercise_id === exerciseId &&
        userWorkoutIds.includes(s.workout_id)
    )

    const byWorkout = {}
    relevantSets.forEach(s => {
      const workout = props.workouts.find(w => w.id === s.workout_id)
      if (!workout) return
      const date = workout.date
      if (!byWorkout[date]) byWorkout[date] = []
      byWorkout[date].push(s)
    })

    const sortedDates = Object.keys(byWorkout).sort()
    const data = sortedDates.map(date => {
      const sets = byWorkout[date]
      let value
      if (selectedMetric.value === 'weight') {
        value = Math.max(...sets.map(s => s.weight || 0))
      } else {
        value = sets.reduce((sum, s) => {
          const w = s.weight > 0 ? s.weight : 1
          return sum + s.reps * w
        }, 0)
      }
      return { x: date, y: value }
    })

    return {
      name: user === 'clement' ? 'Clément' : 'Celio',
      data
    }
  })

  const allDates = [...new Set(series.flatMap(s => s.data.map(d => d.x)))].sort()
  return { series, categories: allDates }
}

function computeVocabularySeries() {
  const users = getUserFilter()
  const series = users.map(user => {
    const logs = props.vocabularyLogs
        .filter(v => v.user_name === user && inRange(v.date))
        .sort((a, b) => a.date.localeCompare(b.date))
    return {
      name: user === 'clement' ? 'Clément' : 'Celio',
      data: logs.map(v => ({ x: v.date, y: v.words_learned }))
    }
  })
  const dates = [...new Set(series.flatMap(s => s.data.map(d => d.x)))].sort()
  return { series, categories: dates }
}

function computeOralSeries() {
  const users = getUserFilter()
  const series = users.map(user => {
    const sessions = props.oralSessions
        .filter(o => o.user_name === user && inRange(o.date))
        .sort((a, b) => a.date.localeCompare(b.date))
    return {
      name: user === 'clement' ? 'Clément' : 'Celio',
      data: sessions.map(o => ({ x: o.date, y: o.duration }))
    }
  })
  const dates = [...new Set(series.flatMap(s => s.data.map(d => d.x)))].sort()
  return { series, categories: dates }
}

function computeReadingSeries() {
  const users = getUserFilter()
  const series = users.map(user => {
    const logs = props.readingLogs
        .filter(r => r.user_name === user && inRange(r.week_start))
        .sort((a, b) => a.week_start.localeCompare(b.week_start))
    return {
      name: user === 'clement' ? 'Clément' : 'Celio',
      data: logs.map(r => ({ x: r.week_start, y: r.pages_translated }))
    }
  })
  const dates = [...new Set(series.flatMap(s => s.data.map(d => d.x)))].sort()
  return { series, categories: dates }
}

// --- Watchers & State ---

const hasWeightData = computed(() => {
  if (!selectedSubFilter.value) return false
  const sets = props.workoutSets.filter(s =>
      s.exercise_id === selectedSubFilter.value && s.weight > 0
  )
  return sets.length > 0
})

watch(hasWeightData, (val) => {
  if (!val) selectedMetric.value = 'volume'
})

function recompute() {
  let result = { series: [], categories: [] }

  if (selectedCategory.value === 'overall') {
    result = computeArenaPointsSeries()
  } else if (selectedCategory.value === 'sport') {
    result = computeSportSeries()
  } else if (selectedCategory.value === 'english') {
    if (selectedSubFilter.value === 'vocabulary') result = computeVocabularySeries()
    else if (selectedSubFilter.value === 'oral')  result = computeOralSeries()
    else if (selectedSubFilter.value === 'reading') result = computeReadingSeries()
  }

  chartSeries.value = result.series
  chartCategories.value = result.categories
}

watch(
    [selectedUser, selectedCategory, selectedSubFilter, selectedMetric, dateRange, dateFromRaw, dateToRaw,
      () => props.workouts, () => props.workoutSets, () => props.grammarTests,
      () => props.vocabularyLogs, () => props.oralSessions, () => props.readingLogs],
    recompute,
    { immediate: true, deep: true }
)

const safeSeries = computed(() =>
    chartSeries.value?.length ? chartSeries.value : [{ name: 'No data', data: [] }]
)

const chartOptions = computed(() => ({
  ...medievalChartDefaults,
  chart: { ...medievalChartDefaults.chart, type: chartType.value === 'bar' ? 'bar' : 'line' },
  xaxis: {
    ...medievalChartDefaults.xaxis,
    categories: chartCategories.value,
    type: 'category',
    labels: {
      rotate: -45,
      style: { colors: '#D4C5A9', fontSize: '11px' }
    }
  },
  noData: {
    text: 'No chronicles found for this period',
    style: { color: '#D4C5A9', fontFamily: 'Crimson Text, serif', fontSize: '14px' }
  }
}))

// Minimal basic table view mapping based on the computed series structure
const tableData = computed(() => {
  if (!chartSeries.value.length || !chartCategories.value.length) return []
  return chartCategories.value.map(cat => {
    const row = { date: cat }
    chartSeries.value.forEach(s => {
      const pt = s.data.find(d => d.x === cat)
      row[s.name] = pt ? pt.y : '-'
    })
    return row
  })
})
</script>