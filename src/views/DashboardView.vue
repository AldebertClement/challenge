<template>
  <div v-if="loading" class="d-flex justify-center align-center" style="height: 60vh;">
    <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
  </div>

  <div v-else-if="error" class="pa-4">
    <v-alert type="error" variant="tonal" class="mb-4">
      Failed to load Arena data. The scribes are fixing the scrolls.
    </v-alert>
  </div>

  <div v-else class="dashboard-container">
    <ArenaPointsBanner :clement="clementPoints" :celio="celioPoints" />

    <div class="ornament-divider my-8"></div>

    <h2 class="text-center mb-6 section-title text-h4 d-flex align-center justify-center">
      <v-icon icon="mdi-sword-cross" class="mr-3" color="secondary"></v-icon>
      Sport Arena
      <v-icon icon="mdi-sword-cross" class="ml-3" color="secondary"></v-icon>
    </h2>

    <v-row class="mb-6">
      <v-col cols="12" lg="6">
        <v-card class="bg-surface-light border-iron pa-4 h-100">
          <WarriorSportPanel userName="Clément" :stats="clementSportStats" />
        </v-card>
      </v-col>
      <v-col cols="12" lg="6">
        <v-card class="bg-surface-light border-iron pa-4 h-100">
          <WarriorSportPanel userName="Celio" :stats="celioSportStats" />
        </v-card>
      </v-col>
    </v-row>

    <SportComparisonTable
        :exercises="allExercises"
        :clementSets="clementSets"
        :celioSets="celioSets"
    />

    <div class="ornament-divider my-8"></div>

    <h2 class="text-center mb-6 section-title text-h4 d-flex align-center justify-center">
      <v-icon icon="mdi-feather" class="mr-3" color="primary"></v-icon>
      English Sanctum
      <v-icon icon="mdi-feather" class="ml-3" color="primary"></v-icon>
    </h2>

    <v-row class="mb-6">
      <v-col cols="12" lg="6">
        <v-card class="bg-surface-light border-iron pa-4 h-100">
          <WarriorEnglishPanel userName="Clément" :stats="clementEnglishStats" />
        </v-card>
      </v-col>
      <v-col cols="12" lg="6">
        <v-card class="bg-surface-light border-iron pa-4 h-100">
          <WarriorEnglishPanel userName="Celio" :stats="celioEnglishStats" />
        </v-card>
      </v-col>
    </v-row>

    <GrammarComparisonTable
        :topics="allTopics"
        :clementProgress="clementGrammarProgress"
        :celioProgress="celioGrammarProgress"
    />

    <div class="ornament-divider my-8"></div>

    <ChartPanel :exercises="allExercises" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

import ArenaPointsBanner from '@/components/dashboard/ArenaPointsBanner.vue'
import WarriorSportPanel from '@/components/dashboard/WarriorSportPanel.vue'
import SportComparisonTable from '@/components/dashboard/SportComparisonTable.vue'
import WarriorEnglishPanel from '@/components/dashboard/WarriorEnglishPanel.vue'
import GrammarComparisonTable from '@/components/dashboard/GrammarComparisonTable.vue'
import ChartPanel from '@/components/dashboard/ChartPanel.vue'

const loading = ref(true)
const error = ref(false)

// Data Stores
const allExercises = ref([])
const allTopics = ref([])

// Clément
const clementPoints = ref({})
const clementSportStats = ref({})
const clementEnglishStats = ref({})
const clementSets = ref([])
const clementGrammarProgress = ref([])

// Celio
const celioPoints = ref({})
const celioSportStats = ref({})
const celioEnglishStats = ref({})
const celioSets = ref([])
const celioGrammarProgress = ref([])

onMounted(async () => {
  try {
    loading.value = true

    const [
      workoutsRes, setsRes, exercisesRes,
      topicsRes, progressRes,
      vocabRes, oralRes, readingRes
    ] = await Promise.all([
      supabase.from('workouts').select('id, user_name, duration, date'),
      supabase.from('workout_sets').select('workout_id, exercise_id, reps, weight, workouts(user_name, date)'),
      supabase.from('exercises').select('id, name'),
      supabase.from('grammar_topics').select('id, name, cefr_level'),
      supabase.from('grammar_progress').select('user_name, topic_id, mastery_score, validated'),
      supabase.from('vocabulary_logs').select('user_name, words_learned, words_reviewed'),
      supabase.from('oral_sessions').select('user_name, duration'),
      supabase.from('reading_logs').select('user_name, pages_translated')
    ])

    if (workoutsRes.error || setsRes.error || topicsRes.error) throw new Error('Data fetch failed')

    allExercises.value = exercisesRes.data || []
    allTopics.value = topicsRes.data || []

    // Helper process for user
    const processUser = (name) => {
      const isUser = (row) => row.user_name?.toLowerCase() === name
      const isUserSet = (row) => row.workouts?.user_name?.toLowerCase() === name

      const w = workoutsRes.data?.filter(isUser) || []
      const s = setsRes.data?.filter(isUserSet) || []
      const gp = progressRes.data?.filter(isUser) || []
      const v = vocabRes.data?.filter(isUser) || []
      const o = oralRes.data?.filter(isUser) || []
      const r = readingRes.data?.filter(isUser) || []

      // Calcs: Sport
      const totalSessions = w.length
      const totalMinutes = w.reduce((acc, curr) => acc + (curr.duration || 0), 0)

      // Personal Records Count
      const prs = {}
      s.forEach(set => {
        if (!prs[set.exercise_id] || set.weight > prs[set.exercise_id]) {
          prs[set.exercise_id] = set.weight
        }
      })
      const prCount = Object.keys(prs).length // Rough proxy: 1 PR per exercise max achieved.

      // Calcs: English
      const validatedTopicsCount = gp.filter(p => p.validated).length
      const totalWords = v.reduce((acc, curr) => acc + (curr.words_learned || 0) + (curr.words_reviewed || 0), 0)
      const oralMinutes = o.reduce((acc, curr) => acc + (curr.duration || 0), 0)
      const readingPages = r.reduce((acc, curr) => acc + (curr.pages_translated || 0), 0)

      // Cefr Level deduction (highest validated)
      const cefrOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
      let highestCefr = 'A1'
      gp.filter(p => p.validated).forEach(p => {
        const t = allTopics.value.find(top => top.id === p.topic_id)
        if (t && cefrOrder.indexOf(t.cefr_level) > cefrOrder.indexOf(highestCefr)) {
          highestCefr = t.cefr_level
        }
      })

      // Points calculation
      const sportPoints = (totalSessions * 15) + (prCount * 25)
      const grammarPoints = validatedTopicsCount * 30
      const vocabPoints = Math.floor(totalWords / 100) * 10
      const oralPoints = Math.floor(oralMinutes / 60) * 20
      const readingPoints = Math.floor(readingPages / 10) * 5
      const total = sportPoints + grammarPoints + vocabPoints + oralPoints + readingPoints

      return {
        points: { total, sportPoints, grammarPoints, vocabPoints, oralPoints, readingPoints },
        sportStats: { totalSessions, totalMinutes, weeklyFrequency: Math.round((totalSessions / Math.max(1, (new Date() - new Date('2024-01-01')) / (1000 * 60 * 60 * 24 * 7)))) || 0 },
        englishStats: { cefrLevel: highestCefr, validatedTopics: validatedTopicsCount, totalTopics: allTopics.value.length, totalWords, oralHours: Math.floor(oralMinutes / 60) },
        sets: s.map(set => ({ ...set, date: set.workouts?.date })),
        grammarProgress: gp
      }
    }

    const clementData = processUser('clement')
    const celioData = processUser('celio')

    clementPoints.value = clementData.points
    clementSportStats.value = clementData.sportStats
    clementEnglishStats.value = clementData.englishStats
    clementSets.value = clementData.sets
    clementGrammarProgress.value = clementData.grammarProgress

    celioPoints.value = celioData.points
    celioSportStats.value = celioData.sportStats
    celioEnglishStats.value = celioData.englishStats
    celioSets.value = celioData.sets
    celioGrammarProgress.value = celioData.grammarProgress

  } catch (err) {
    console.error(err)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>