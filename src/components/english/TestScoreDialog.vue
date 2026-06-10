<template>
  <v-dialog v-model="isOpen" max-width="450">
    <v-card class="medieval-dialog border-gold bg-surface">
      <v-card-title class="bg-primary text-white text-h6 py-3">
        Trial by Combat: {{ topic?.name }}
      </v-card-title>
      <v-card-text class="pt-6">
        <p class="mb-4">Submit the results of your recent trial to update your mastery standing.</p>
        <v-form ref="form" @submit.prevent="submitScore">
          <v-text-field
              v-model.number="score"
              label="Score Obtained (0-100)"
              type="number"
              variant="outlined"
              :rules="[v => (v !== null && v >= 0 && v <= 100) || 'Score must be between 0 and 100']"
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

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEnglishStore } from '@/stores/english.store'
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps({
  modelValue: Boolean,
  topic: Object
})
const emit = defineEmits(['update:modelValue'])

const store = useEnglishStore()
const authStore = useAuthStore()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const score = ref(null)
const loading = ref(false)
const form = ref(null)
const snackbar = ref({ show: false, color: 'success', message: '' })

function getNormalizedUser() {
  return (authStore.selectedProfile || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
}

const submitScore = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await store.submitGrammarTest(getNormalizedUser(), props.topic.id, score.value)
    snackbar.value = { show: true, color: 'success', message: 'Trial recorded! Your mastery has been updated.' }
    setTimeout(() => {
      isOpen.value = false
      score.value = null
    }, 1000)
  } catch (error) {
    console.error('Failed to submit score via store:', error)
    snackbar.value = { show: true, color: 'error', message: 'Failed to record trial. Please try again.' }
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