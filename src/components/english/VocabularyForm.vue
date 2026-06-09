<template>
  <v-card class="tome-card" elevation="0">
    <v-card-title class="text-h5 font-weight-bold text-center mb-4 border-bottom">
      Inscribe Records
    </v-card-title>
    <v-card-text>
      <v-form ref="form" @submit.prevent="submitLog">
        <v-text-field
            v-model.number="wordsLearned"
            label="New Words Conquered"
            type="number"
            variant="underlined"
            color="#5c4033"
            :rules="[v => v >= 0 || 'Quantity cannot be negative']"
            required
        ></v-text-field>

        <v-text-field
            v-model.number="wordsReviewed"
            label="Old Words Reviewed"
            type="number"
            variant="underlined"
            color="#5c4033"
            :rules="[v => v >= 0 || 'Quantity cannot be negative']"
            required
        ></v-text-field>

        <v-textarea
            v-model="notes"
            label="Scholar's Notes"
            variant="underlined"
            color="#5c4033"
            rows="3"
        ></v-textarea>

        <v-btn
            type="submit"
            color="#5c4033"
            class="mt-4 text-white w-100 font-weight-bold"
            :loading="loading"
        >
          Seal the Ledger
        </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/supabase'

const emit = defineEmits(['log-added'])

const wordsLearned = ref(0)
const wordsReviewed = ref(0)
const notes = ref('')
const loading = ref(false)
const form = ref(null)

const submitLog = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await supabase.from('vocabulary_logs').insert({
      date: new Date().toISOString().split('T')[0],
      learned: wordsLearned.value,
      reviewed: wordsReviewed.value,
      notes: notes.value
    })

    emit('log-added')
    wordsLearned.value = 0
    wordsReviewed.value = 0
    notes.value = ''
  } catch (error) {
    console.error('Error inscribing records:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.tome-card {
  background: transparent !important;
  border: 1px dashed #8b5a2b;
  border-radius: 4px;
  padding: 1rem;
}

.border-bottom {
  border-bottom: 1px solid #8b5a2b;
  padding-bottom: 0.5rem;
}

:deep(.v-field__input), :deep(.v-label) {
  font-family: 'Crimson Text', serif !important;
  color: #3e2723 !important;
}
</style>