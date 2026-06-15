<template>
  <v-card
      hover
      color="surface"
      :class="['topic-card', { 'c2-mastered-glow': isC2Mastered }]"
      @click="$emit('click', topic)"
  >
    <v-card-item>
      <v-card-title class="text-primary font-weight-bold">{{ topic.name }}</v-card-title>
      <v-card-subtitle>Mastery Score: {{ masteryScore }}/100</v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <p class="text-body-2 mb-2">{{ topic.description }}</p>

      <div class="d-flex align-center justify-space-between mt-2">
        <v-chip
            :color="isValidated ? 'success' : 'grey-darken-1'"
            size="small"
            class="text-uppercase font-weight-bold"
        >
          {{ isValidated ? 'Mastered' : 'Uncharted' }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  topic: { type: Object, required: true }
})
defineEmits(['click'])

const masteryScore = computed(() => props.topic.progress?.mastery_score || 0)
const isValidated = computed(() => props.topic.progress?.validated || false)

const isC2Mastered = computed(() => {
  return props.topic.cefr_level === 'C2' && isValidated.value
})
</script>

<style scoped>
.topic-card {
  border: 1px solid #8b6508;
  transition: all 0.3s ease;
  cursor: pointer;
}

/* Glowing effect for C2 Mastery */
.c2-mastered-glow {
  box-shadow: 0 0 15px 5px rgba(255, 215, 0, 0.7) !important;
  border: 2px solid #ffd700 !important;
  animation: legendary-pulse 2s infinite alternate;
}

@keyframes legendary-pulse {
  from { box-shadow: 0 0 10px 2px rgba(255, 215, 0, 0.5); }
  to { box-shadow: 0 0 20px 8px rgba(255, 215, 0, 0.9); }
}
</style>