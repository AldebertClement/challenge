<template>
  <div class="mt-6">
    <h3 class="text-h5 text-center mb-4 section-title">Grammar Archives</h3>

    <v-card class="bg-surface border-iron mb-4" v-for="level in groupedTopics" :key="level.level">
      <div class="pa-2 font-weight-bold text-center d-flex align-center justify-center"
           :style="{ backgroundColor: cefrRanks[level.level]?.color || '#3A3020', color: '#0E0C07' }">
        <v-icon :icon="cefrRanks[level.level]?.icon" class="mr-2"></v-icon>
        <span style="font-family: 'Cinzel', serif !important; font-size: 1.1rem; letter-spacing: 0.1em;">
          {{ level.level }} - {{ cefrRanks[level.level]?.label }}
        </span>
      </div>

      <v-table class="bg-transparent" density="compact">
        <thead>
        <tr>
          <th class="text-left" style="color: #D4C5A9;">Topic</th>
          <th class="text-center" style="color: #D4C5A9;">Clément</th>
          <th class="text-center" v-if="!isMobile" style="color: #D4C5A9;">Status</th>
          <th class="text-center" style="color: #D4C5A9;">Celio</th>
          <th class="text-center" v-if="!isMobile" style="color: #D4C5A9;">Status</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="topic in level.topics" :key="topic.id" :class="{ 'c2-glow': level.level === 'C2' && (topic.clement.validated || topic.celio.validated) }">
          <td class="text-left text-on-surface">{{ topic.name }}</td>

          <td class="text-center font-weight-bold" :class="'text-' + getScoreColor(topic.clement.score)">
            {{ topic.clement.score !== null ? topic.clement.score + '%' : '—' }}
          </td>
          <td class="text-center" v-if="!isMobile">
            <v-icon v-if="topic.clement.validated" icon="mdi-check-circle" color="success" size="small"></v-icon>
            <span v-else class="text-iron">—</span>
          </td>

          <td class="text-center font-weight-bold" :class="'text-' + getScoreColor(topic.celio.score)">
            {{ topic.celio.score !== null ? topic.celio.score + '%' : '—' }}
          </td>
          <td class="text-center" v-if="!isMobile">
            <v-icon v-if="topic.celio.validated" icon="mdi-check-circle" color="success" size="small"></v-icon>
            <span v-else class="text-iron">—</span>
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
import { cefrRanks } from '@/utils/cefrRanks'

const props = defineProps({
  topics: { type: Array, required: true },
  clementProgress: { type: Array, required: true },
  celioProgress: { type: Array, required: true }
})

const { xs } = useDisplay()
const isMobile = computed(() => xs.value)

function getScoreColor(score) {
  if (score === null) return 'iron'
  if (score >= 80) return 'success'
  if (score >= 50) return 'warning'
  return 'error'
}

const groupedTopics = computed(() => {
  const groups = {}

      // Initialize levels
  ;['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].forEach(lvl => { groups[lvl] = [] })

  props.topics.forEach(t => {
    const clemProg = props.clementProgress.find(p => p.topic_id === t.id) || { mastery_score: null, validated: false }
    const celProg = props.celioProgress.find(p => p.topic_id === t.id) || { mastery_score: null, validated: false }

    if (groups[t.cefr_level]) {
      groups[t.cefr_level].push({
        id: t.id,
        name: t.name,
        clement: { score: clemProg.mastery_score, validated: clemProg.validated },
        celio: { score: celProg.mastery_score, validated: celProg.validated }
      })
    }
  })

  // Return non-empty groups
  return Object.keys(groups)
      .filter(k => groups[k].length > 0)
      .map(k => ({ level: k, topics: groups[k] }))
})
</script>

<style scoped>
.c2-glow {
  background: rgba(201, 168, 76, 0.1);
  box-shadow: inset 0 0 10px rgba(201, 168, 76, 0.2);
}
</style>