// src/components/dashboard/SportComparisonTable.vue
<template>
  <div class="mt-6">
    <h3 class="text-h5 text-center mb-4 section-title">Exercise Records</h3>

    <v-row v-if="!isMobile">
      <v-col cols="12" md="6">
        <h4 class="text-center mb-2 text-primary" style="font-family: 'Cinzel', serif !important;">Clément</h4>
        <v-card class="bg-surface border-iron">
          <v-table class="bg-transparent" density="compact">
            <thead>
            <tr>
              <th class="text-left text-primary">Exercise</th>
              <th class="text-right text-primary">Max Wt.</th>
              <th class="text-right text-primary">Max Vol.</th>
              <th class="text-right text-primary">Last Battle</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(ex, index) in tableData" :key="'clem-'+ex.id" :class="index % 2 === 0 ? 'bg-surface-light' : ''">
              <td class="text-left text-on-surface">{{ ex.name }}</td>
              <td class="text-right font-weight-bold" :class="ex.clement.maxWeight > ex.celio.maxWeight ? 'text-primary' : 'text-on-surface'">
                {{ ex.clement.maxWeight > 0 ? ex.clement.maxWeight + ' kg' : '—' }}
              </td>
              <td class="text-right font-weight-bold" :class="ex.clement.maxVolume > ex.celio.maxVolume ? 'text-primary' : 'text-on-surface'">
                {{ ex.clement.maxVolume > 0 ? ex.clement.maxVolume : '—' }}
              </td>
              <td class="text-right text-on-surface">{{ formatDate(ex.clement.lastSession) }}</td>
            </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <h4 class="text-center mb-2 text-primary" style="font-family: 'Cinzel', serif !important;">Celio</h4>
        <v-card class="bg-surface border-iron">
          <v-table class="bg-transparent" density="compact">
            <thead>
            <tr>
              <th class="text-left text-primary">Exercise</th>
              <th class="text-right text-primary">Max Wt.</th>
              <th class="text-right text-primary">Max Vol.</th>
              <th class="text-right text-primary">Last Battle</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(ex, index) in tableData" :key="'celio-'+ex.id" :class="index % 2 === 0 ? 'bg-surface-light' : ''">
              <td class="text-left text-on-surface">{{ ex.name }}</td>
              <td class="text-right font-weight-bold" :class="ex.celio.maxWeight > ex.clement.maxWeight ? 'text-primary' : 'text-on-surface'">
                {{ ex.celio.maxWeight > 0 ? ex.celio.maxWeight + ' kg' : '—' }}
              </td>
              <td class="text-right font-weight-bold" :class="ex.celio.maxVolume > ex.clement.maxVolume ? 'text-primary' : 'text-on-surface'">
                {{ ex.celio.maxVolume > 0 ? ex.celio.maxVolume : '—' }}
              </td>
              <td class="text-right text-on-surface">{{ formatDate(ex.celio.lastSession) }}</td>
            </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-else class="bg-surface border-iron">
      <v-table class="bg-transparent" density="compact">
        <thead>
        <tr>
          <th class="text-left text-primary">Exercise</th>
          <th class="text-center text-primary">Clément (W/V)</th>
          <th class="text-center text-primary">Celio (W/V)</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(ex, index) in tableData" :key="'mob-'+ex.id" :class="index % 2 === 0 ? 'bg-surface-light' : ''">
          <td class="text-left text-on-surface text-caption">{{ ex.name }}</td>
          <td class="text-center text-caption" :class="ex.clement.maxWeight > ex.celio.maxWeight ? 'text-primary' : 'text-on-surface'">
            {{ ex.clement.maxWeight || '—' }} / {{ ex.clement.maxVolume || '—' }}
          </td>
          <td class="text-center text-caption" :class="ex.celio.maxWeight > ex.clement.maxWeight ? 'text-primary' : 'text-on-surface'">
            {{ ex.celio.maxWeight || '—' }} / {{ ex.celio.maxVolume || '—' }}
          </td>
        </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps({
  exercises: { type: Array, required: true },
  clementSets: { type: Array, required: true },
  celioSets: { type: Array, required: true }
})

const { smAndDown } = useDisplay()
const isMobile = computed(() => smAndDown.value)

function computeStats(sets, exerciseId) {
  const exSets = sets.filter(s => s.exercise_id === exerciseId)
  if (!exSets.length) return { maxWeight: 0, maxVolume: 0, lastSession: null }

  let maxWeight = 0
  let lastSession = null
  const sessionVolumes = {}

  exSets.forEach(s => {
    if (s.weight > maxWeight) maxWeight = s.weight

    // Using workouts date if joined, fallback to simple assignment if unavailable (assuming date is attached via join)
    const date = s.workouts?.date || s.date
    if (!lastSession || (date && new Date(date) > new Date(lastSession))) {
      lastSession = date
    }

    if (date) {
      if (!sessionVolumes[date]) sessionVolumes[date] = 0
      sessionVolumes[date] += s.weight > 0 ? (s.weight * s.reps) : s.reps // Bodyweight fallback
    }
  })

  const maxVolume = Object.values(sessionVolumes).length
      ? Math.max(...Object.values(sessionVolumes))
      : 0

  return { maxWeight, maxVolume, lastSession }
}

const tableData = computed(() => {
  return props.exercises.map(ex => {
    return {
      id: ex.id,
      name: ex.name,
      clement: computeStats(props.clementSets, ex.id),
      celio: computeStats(props.celioSets, ex.id)
    }
  }).sort((a, b) => a.name.localeCompare(b.name))
})

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`
}
</script>