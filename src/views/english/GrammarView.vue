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
          v-for="rank in cefrRanksArray"
          :key="rank.level"
          :rank="rank"
          :topics="getTopicsByRank(rank.level)"
          @open-topic="openTopicDialog"
      />
    </template>

    <TopicDetailDialog
        v-model="dialogVisible"
        :topic="selectedTopic"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEnglishStore } from '@/stores/english.store'
import { useAuthStore } from '@/stores/auth.store'
import { cefrRanks } from '@/utils/cefrRanks'
import RankTierSection from '@/components/english/RankTierSection.vue'
import TopicDetailDialog from '@/components/english/TopicDetailDialog.vue'

const store = useEnglishStore()
const authStore = useAuthStore()

const dialogVisible = ref(false)
const selectedTopic = ref(null)

const cefrRanksArray = computed(() => {
  return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => ({
    level,
    ...cefrRanks[level]
  }))
})

function getUser() {
  return (authStore.selectedProfile || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
}

// Map progress, test history, and training data reactively into grammar topics
const combinedTopics = computed(() => {
  const currentUser = getUser()
  return store.grammarTopics.map(topic => {
    const progress = store.grammarProgress.find(p => p.topic_id === topic.id && p.user_name === currentUser)
    const tests = store.grammarTests.filter(t => t.topic_id === topic.id && t.user_name === currentUser)
    const trainings = (store.grammarTraining || []).filter(tr => tr.topic_id === topic.id && tr.user_name === currentUser)

    return {
      ...topic,
      progress: progress || { mastery_score: 0, validated: false },
      tests: tests || [],
      trainings: trainings || []
    }
  })
})

const getTopicsByRank = (level) => {
  return combinedTopics.value.filter(t => t.cefr_level === level)
}

const openTopicDialog = (topic) => {
  selectedTopic.value = topic
  dialogVisible.value = true
}

onMounted(() => {
  store.fetchGrammarData()
})
</script>