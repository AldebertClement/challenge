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

        <v-text-field
            v-model="source"
            label="Source Document (e.g., Book, Poem)"
            variant="underlined"
            color="#5c4033"
            required
            :rules="[v => !!v || 'A source scroll is required']"
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
            :disabled="loading"
            :loading="loading"
        >
          <template v-if="loading">
            <v-progress-circular indeterminate size="20" color="white" class="me-2"></v-progress-circular>
          </template>
          Seal the Ledger
        </v-btn>
      </v-form>
    </v-card-text>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useEnglishStore } from '@/stores/english.store'
import { useAuthStore } from '@/stores/auth.store'

const store = useEnglishStore()
const authStore = useAuthStore()

const wordsLearned = ref(0)
const wordsReviewed = ref(0)
const source = ref('Ancient Scroll')
const notes = ref('')
const form = ref(null)
const loading = ref(false)

const snackbar = ref({ show: false, text: '', color: 'success' })

const normalizeUserName = (name) => {
  return name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || ''
}

const getErrorMessage = (err) => {
  const msg = err?.message || ''
  const code = String(err?.code || '')
  if (code === '23514' || msg.includes('constraint') || msg.includes('400')) return "Invalid data. Please check your inputs and try again."
  if (code === '42501' || msg.includes('Access denied') || msg.includes('403')) return "Access denied. Please log in again."
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) return "Could not reach the server. Check your connection."
  return "Something went wrong. Please try again."
}

const submitLog = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    const userName = normalizeUserName(authStore.selectedProfile)

    await store.logVocabulary(
        userName,
        today,
        wordsLearned.value,
        wordsReviewed.value,
        source.value,
        notes.value
    )

    wordsLearned.value = 0
    wordsReviewed.value = 0
    source.value = 'Ancient Scroll'
    notes.value = ''

    snackbar.value = { show: true, text: 'Entry saved to the tome!', color: 'success' }
  } catch (error) {
    console.error('Error logging vocabulary to store:', error)
    snackbar.value = { show: true, text: getErrorMessage(error), color: 'error' }
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