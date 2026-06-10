<template>
  <div>
    <v-btn
        color="primary"
        prepend-icon="mdi-bullhorn"
        class="v-btn--variant-elevated v-btn--color-primary"
        @click="dialog = true"
    >
      Log Oral Session
    </v-btn>

    <v-dialog v-model="dialog" :fullscreen="mobile" max-width="500px" transition="dialog-bottom-transition">
      <v-card color="surface">
        <v-toolbar color="surface" flat class="border-b border-iron">
          <v-toolbar-title class="text-primary text-h6">
            <v-icon icon="mdi-shield-crown" class="me-2" color="primary"></v-icon>
            Record Oral Discourse
          </v-toolbar-title>
          <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="isFormValid" @submit.prevent="submitOral">
            <v-text-field
                v-model="logForm.date"
                label="Date of Discourse"
                type="date"
                bg-color="surface-light"
                :rules="[v => !!v || 'Date is required']"
                required
                class="mb-4"
            ></v-text-field>

            <v-text-field
                v-model.number="logForm.duration"
                label="Duration (Minutes)"
                type="number"
                bg-color="surface-light"
                :rules="englishRules.oralDuration"
                required
                class="mb-4"
            ></v-text-field>

            <v-select
                v-model="logForm.activityType"
                label="Activity Type"
                :items="activityTypes"
                item-title="label"
                item-value="value"
                bg-color="surface-light"
                :rules="[v => !!v || 'Activity type is required']"
                required
                class="mb-4"
            ></v-select>

            <div class="mb-4">
              <label class="text-subtitle-2 text-on-surface d-block mb-2">Self Evaluation (Shields of Honor)</label>
              <div class="d-flex align-center gap-1 mb-2">
                <v-icon
                    v-for="i in 5"
                    :key="i"
                    :icon="i <= logForm.selfEvaluation ? 'mdi-shield' : 'mdi-shield-outline'"
                    :color="i <= logForm.selfEvaluation ? 'primary' : 'iron'"
                    size="large"
                    class="cursor-pointer"
                    @click="logForm.selfEvaluation = i"
                ></v-icon>
                <span class="text-primary font-weight-bold ms-3 text-body-2">Rank {{ logForm.selfEvaluation }} / 5</span>
              </div>
              <v-slider
                  v-model="logForm.selfEvaluation"
                  min="1"
                  max="5"
                  step="1"
                  color="primary"
                  track-color="iron"
                  :rules="englishRules.selfEval"
                  hide-details
              ></v-slider>
            </div>

            <v-textarea
                v-model="logForm.notes"
                label="Bardic Observations & Notes"
                bg-color="surface-light"
                rows="3"
                class="mb-4"
            ></v-textarea>

            <div class="d-flex justify-end gap-2 mt-4">
              <v-btn color="secondary" variant="text" @click="dialog = false">Cancel</v-btn>
              <v-btn color="primary" type="submit" :disabled="!isFormValid || loading" :loading="loading">
                <template v-if="loading">
                  <v-progress-circular indeterminate size="20" color="white" class="me-2"></v-progress-circular>
                </template>
                Inscribe Session
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEnglishStore } from '@/stores/english.store'
import { useAuthStore } from '@/stores/auth.store'
import { englishRules } from '@/utils/validators'
import { useDisplay } from 'vuetify'

const englishStore = useEnglishStore()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const dialog = ref(false)
const isFormValid = ref(false)
const loading = ref(false)

const snackbar = ref({ show: false, text: '', color: 'success' })

const activityTypes = [
  { label: 'Conversation',    value: 'conversation' },
  { label: 'Shadowing',       value: 'shadowing' },
  { label: 'Active Listening', value: 'active_listening' },
  { label: 'Presentation',    value: 'presentation' },
]

const logForm = ref({
  date: new Date().toISOString().substring(0, 10),
  duration: 15,
  activityType: 'shadowing',
  selfEvaluation: 3,
  notes: ''
})

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

async function submitOral() {
  if (!isFormValid.value) return
  loading.value = true
  try {
    const profile = normalizeUserName(authStore.selectedProfile)
    await englishStore.logOralSession(
        profile,
        logForm.value.date,
        logForm.value.duration,
        logForm.value.activityType,
        logForm.value.selfEvaluation,
        logForm.value.notes
    )
    dialog.value = false
    logForm.value = {
      date: new Date().toISOString().substring(0, 10),
      duration: 15,
      activityType: 'shadowing',
      selfEvaluation: 3,
      notes: ''
    }
    snackbar.value = { show: true, text: 'Entry saved to the tome!', color: 'success' }
  } catch (err) {
    console.error(err)
    snackbar.value = { show: true, text: getErrorMessage(err), color: 'error' }
  } finally {
    loading.value = false
  }
}
</script>