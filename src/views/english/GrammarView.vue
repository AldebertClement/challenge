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

    <v-row v-if="store.loading" justify="center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 font-italic">Consulting the Grand Library...</p>
      </v-col>
    </v-row>

    <template v-else>
      <RankTierSection
          v-for="rank in cefrRanks"
          :key="rank.level"
          :rank="rank"
          :topics="getTopicsByRank(rank.level)"
          @open-test="openTestDialog"
      />
    </template>

    <TestScoreDialog
        v-model="dialogVisible"
        :topic="selectedTopic"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEnglishStore } from '@/stores/english.store'
import { cefrRanks } from '@/utils/cefrRanks'
import RankTierSection from '@/components/english/RankTierSection.vue'
import TestScoreDialog from '@/components/english/TestScoreDialog.vue'

const store = useEnglishStore()
const dialogVisible = ref(false)
const selectedTopic = ref(null)

// Map progress data reactively into grammar topics
const combinedTopics = computed(() => {
  return store.grammarTopics.map(topic => {
    const progress = store.grammarProgress.find(p => p.topic_id === topic.id)
    return {
      ...topic,
      progress: progress || { mastery_score: 0, validated: false }
    }
  })
})

const getTopicsByRank = (level) => {
  return combinedTopics.value.filter(t => t.cefr_level === level)
}

const openTestDialog = (topic) => {
  selectedTopic.value = topic
  dialogVisible.value = true
}

onMounted(() => {
  store.fetchGrammarData()
})
</script>