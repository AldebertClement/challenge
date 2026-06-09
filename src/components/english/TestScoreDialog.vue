<template>
  <v-dialog v-model="isOpen" max-width="450">
    <v-card class="medieval-dialog border-gold">
      <v-card-title class="bg-primary text-white text-h6 py-3">
        Trial by Combat: {{ topic?.title }}
      </v-card-title>
      <v-card-text class="pt-6">
        <p class="mb-4">Submit the results of your recent trial to update your mastery standing.</p>
        <v-form ref="form" @submit.prevent="submitScore">
          <v-text-field
              v-model.number="score"
              label="Score Obtained (0-100)"
              type="number"
              variant="outlined"
              :rules="[v => (v >= 0 && v <= 100) || 'Score must be between 0 and 100']"
              required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-2" variant="text" @click="isOpen = false">Retreat</v-btn>
        <v-btn color="success" variant="elevated" :loading="loading" @click="submitScore">
          Declare Victory
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

const props = defineProps({
  modelValue: Boolean,
  topic: Object
})
const emit = defineEmits(['update:modelValue', 'score-submitted'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const score = ref(null)
const loading = ref(false)
const form = ref(null)

const submitScore = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  try {
    // 1. Log the test trial
    await supabase.from('grammar_tests').insert({
      topic_id: props.topic.id,
      score: score.value,
      tested_at: new Date().toISOString()
    })

    // 2. Fetch existing mastery to calculate new peak score
    const { data: existing } = await supabase
        .from('grammar_progress')
        .select('mastery_score')
        .eq('topic_id', props.topic.id)
        .single()

    const newMastery = Math.max(score.value, existing?.mastery_score || 0)
    const isPassed = newMastery >= 80 // Pass threshold

    // 3. Upsert overall progress
    await supabase.from('grammar_progress').upsert({
      topic_id: props.topic.id,
      mastery_score: newMastery,
      passed: isPassed
    })

    emit('score-submitted')
    isOpen.value = false
    score.value = null
  } catch (error) {
    console.error('Failed to submit score:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.border-gold {
  border: 2px solid #d4af37 !important;
}
</style>