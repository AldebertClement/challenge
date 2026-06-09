<template>
  <v-container class="medieval-page">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 medieval-title text-center text-primary mb-6">
          Grammar Compendium
        </h1>
        <p class="text-center text-subtitle-1 mb-8">
          Master the ancient rules of syntax to ascend the ranks.
        </p>
      </v-col>
    </v-row>

    <RankTierSection
        v-for="rank in cefrRanks"
        :key="rank.level"
        :rank="rank"
        :topics="getTopicsByRank(rank.level)"
        @open-test="openTestDialog"
    />

    <TestScoreDialog
        v-model="dialogVisible"
        :topic="selectedTopic"
        @score-submitted="fetchTopics"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { cefrRanks } from '@/utils/cefrRanks'
import RankTierSection from '@/components/RankTierSection.vue'
import TestScoreDialog from '@/components/TestScoreDialog.vue'

const topics = ref([])
const dialogVisible = ref(false)
const selectedTopic = ref(null)

const fetchTopics = async () => {
  const { data, error } = await supabase.from('grammar_topics').select(`
    id, title, cefr_level, description,
    grammar_progress ( mastery_score, passed )
  `)
  if (!error && data) {
    topics.value = data
  } else {
    console.error('Failed to retrieve ancient scrolls:', error)
  }
}

const getTopicsByRank = (level) => {
  return topics.value.filter(t => t.cefr_level === level)
}

const openTestDialog = (topic) => {
  selectedTopic.value = topic
  dialogVisible.value = true
}

onMounted(() => {
  fetchTopics()
})
</script>