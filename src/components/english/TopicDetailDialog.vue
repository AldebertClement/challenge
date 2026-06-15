<template>
  <v-dialog v-model="isOpen" max-width="700">
    <v-card color="surface" class="border-gold">
      <v-card-title class="d-flex align-center py-4 bg-surface-light border-bottom">
        <h2 class="text-h5 text-primary medieval-font mb-0">{{ topic?.name }}</h2>
        <v-spacer></v-spacer>
        <v-chip v-if="topic" :color="getCefrColor(topic.cefr_level)" class="font-weight-bold">
          {{ topic.cefr_level }}
        </v-chip>
      </v-card-title>

      <v-tabs v-model="activeTab" color="primary" class="bg-surface-light">
        <v-tab value="training">Training Sessions</v-tab>
        <v-tab value="tests">Test Results</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item value="training">
          <v-card-text class="pt-6">
            <v-form ref="trainingForm" @submit.prevent="submitTraining" class="mb-6">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                      v-model="newTraining.date"
                      type="date"
                      label="Date"
                      variant="outlined"
                      :max="today"
                      required
                      :rules="[v => !!v || 'Date is required']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                      v-model.number="newTraining.duration"
                      type="number"
                      label="Duration (minutes)"
                      variant="outlined"
                      min="1"
                      max="300"
                      required
                      :rules="[v => (v > 0 && v <= 300) || 'Duration must be between 1 and 300']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                      v-model="newTraining.notes"
                      rows="2"
                      label="Notes (optional)"
                      variant="outlined"
                  ></v-textarea>
                </v-col>
              </v-row>
              <div class="d-flex justify-end">
                <v-btn color="primary" type="submit" :loading="loading" variant="elevated">
                  Record Training
                </v-btn>
              </div>
            </v-form>

            <v-divider class="mb-4"></v-divider>

            <v-list class="bg-transparent pa-0" v-if="liveTrainings.length">
              <v-list-item v-for="session in liveTrainings" :key="session.id" class="px-0 border-bottom-light">
                <div class="d-flex w-100 justify-space-between align-center">
                  <div>
                    <div class="text-subtitle-1 font-weight-bold text-on-surface">
                      {{ formatDate(session.date) }} - {{ session.duration }} mins
                    </div>
                    <div class="text-caption text-iron" v-if="session.notes">{{ session.notes }}</div>
                  </div>
                  <div>
                    <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEditTraining(session)"></v-btn>
                    <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDeleteTraining(session)"></v-btn>
                  </div>
                </div>
              </v-list-item>
            </v-list>
            <div v-else class="text-subtitle-1 text-disabled font-italic py-4 text-center">
              No training recorded yet. Begin your first session!
            </div>
          </v-card-text>
        </v-window-item>

        <v-window-item value="tests">
          <v-card-text class="pt-6">
            <v-form ref="testForm" @submit.prevent="submitScore" class="mb-6">
              <v-row align="center">
                <v-col cols="12" sm="8">
                  <v-text-field
                      v-model.number="newScore"
                      type="number"
                      label="Score (0-100)"
                      variant="outlined"
                      min="0"
                      max="100"
                      hint="Score ≥ 80 validates this topic"
                      persistent-hint
                      required
                      :rules="[v => (v !== null && v >= 0 && v <= 100) || 'Score must be between 0 and 100']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" class="text-right">
                  <v-btn color="success" type="submit" :loading="loading" variant="elevated" class="w-100">
                    Submit Trial
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>

            <v-divider class="mb-4"></v-divider>

            <v-list class="bg-transparent pa-0 mb-6" v-if="liveTests.length">
              <v-list-item v-for="test in liveTests" :key="test.id" class="px-0 border-bottom-light">
                <div class="d-flex w-100 justify-space-between align-center">
                  <div>
                    <span class="text-subtitle-1 text-on-surface">{{ formatDate(test.tested_at) }}</span>
                    <span class="ml-4 text-body-1 font-weight-bold">Score: {{ test.score }}</span>
                  </div>
                  <div class="d-flex align-center">
                    <v-chip size="small" :color="test.score >= 80 ? 'success' : 'error'" class="mr-4">
                      {{ test.score >= 80 ? 'Success' : 'Failed' }}
                    </v-chip>
                    <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="confirmDeleteTest(test)"></v-btn>
                  </div>
                </div>
              </v-list-item>
            </v-list>
            <div v-else class="text-subtitle-1 text-disabled font-italic py-4 text-center mb-6">
              No trials recorded yet.
            </div>

            <v-card color="surface-light" class="pa-4 border-gold">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-h6 text-primary">Current Mastery</span>
                <span class="text-h6">{{ liveProgress.mastery_score || 0 }} / 100</span>
              </div>
              <v-progress-linear
                  :model-value="liveProgress.mastery_score || 0"
                  color="primary"
                  height="12"
                  rounded
                  class="mb-4"
              ></v-progress-linear>
              <div class="text-center">
                <v-chip
                    :color="liveProgress.validated ? 'success' : 'grey-darken-1'"
                    class="font-weight-bold"
                >
                  <v-icon start v-if="liveProgress.validated">mdi-check</v-icon>
                  {{ liveProgress.validated ? '✓ Validated' : 'Uncharted' }}
                </v-chip>
              </div>
            </v-card>
          </v-card-text>
        </v-window-item>
      </v-window>

      <v-divider></v-divider>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="iron" variant="text" @click="isOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="editDialog" max-width="400">
    <v-card color="surface" class="border-gold">
      <v-card-title class="text-primary">Edit Training</v-card-title>
      <v-card-text class="pt-4">
        <v-form ref="editForm">
          <v-text-field v-model="editTrainingData.date" type="date" label="Date" variant="outlined" required></v-text-field>
          <v-text-field v-model.number="editTrainingData.duration" type="number" label="Duration (min)" variant="outlined" required></v-text-field>
          <v-textarea v-model="editTrainingData.notes" rows="2" label="Notes" variant="outlined"></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="iron" variant="text" @click="editDialog = false">Cancel</v-btn>
        <v-btn color="primary" @click="saveTrainingEdit" :loading="loading">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card color="surface" class="border-gold">
      <v-card-title class="text-error">{{ deleteType === 'training' ? 'Remove Training?' : 'Erase Trial?' }}</v-card-title>
      <v-card-text>
        {{ deleteType === 'training' ? 'Remove this training session?' : 'Erase this trial from the records?' }}
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="iron" variant="text" @click="deleteDialog = false">Cancel</v-btn>
        <v-btn color="error" @click="executeDelete" :loading="loading">Confirm</v-btn>
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
import { cefrRanks } from '@/utils/cefrRanks'

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

const activeTab = ref('training')
const loading = ref(false)
const snackbar = ref({ show: false, color: 'success', message: '' })

// Forms
const trainingForm = ref(null)
const testForm = ref(null)

const today = new Date().toISOString().split('T')[0]
const newTraining = ref({ date: today, duration: null, notes: '' })
const newScore = ref(null)

// Edit State
const editDialog = ref(false)
const editTrainingData = ref({})

// Delete State
const deleteDialog = ref(false)
const deleteType = ref(null)
const itemToDelete = ref(null)

function getUser() {
  return (authStore.selectedProfile || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
}

// Live computed data from store for UI updates
const liveTrainings = computed(() =>
    (store.grammarTraining || []).filter(
        tr => tr.topic_id === props.topic?.id && tr.user_name === getUser()
    )
)

const liveTests = computed(() =>
    (store.grammarTests || []).filter(
        t => t.topic_id === props.topic?.id && t.user_name === getUser()
    )
)

const liveProgress = computed(() =>
    store.grammarProgress.find(
        p => p.topic_id === props.topic?.id && p.user_name === getUser()
    ) || { mastery_score: 0, validated: false }
)

function getCefrColor(level) {
  return cefrRanks[level]?.color || 'primary'
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

// Training Logic
const submitTraining = async () => {
  const { valid } = await trainingForm.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await store.addGrammarTraining(
        getUser(),
        props.topic.id,
        newTraining.value.date,
        newTraining.value.duration,
        newTraining.value.notes
    )
    snackbar.value = { show: true, color: 'success', message: 'Training recorded!' }
    newTraining.value = { date: today, duration: null, notes: '' }
    if(trainingForm.value) trainingForm.value.resetValidation()
  } catch (error) {
    console.error(error)
    snackbar.value = { show: true, color: 'error', message: 'Failed to save. Try again.' }
  } finally {
    loading.value = false
  }
}

const openEditTraining = (session) => {
  editTrainingData.value = { ...session }
  editDialog.value = true
}

const saveTrainingEdit = async () => {
  loading.value = true
  try {
    await store.updateGrammarTraining(editTrainingData.value.id, {
      date: editTrainingData.value.date,
      duration: parseInt(editTrainingData.value.duration),
      notes: editTrainingData.value.notes
    })
    snackbar.value = { show: true, color: 'success', message: 'Training updated!' }
    editDialog.value = false
  } catch (error) {
    console.error(error)
    snackbar.value = { show: true, color: 'error', message: 'Failed to update.' }
  } finally {
    loading.value = false
  }
}

// Tests Logic
const submitScore = async () => {
  const { valid } = await testForm.value.validate()
  if (!valid) return

  loading.value = true
  try {
    await store.submitGrammarTest(getUser(), props.topic.id, newScore.value)
    snackbar.value = { show: true, color: 'success', message: 'Trial recorded!' }
    newScore.value = null
    if(testForm.value) testForm.value.resetValidation()
  } catch (error) {
    console.error(error)
    snackbar.value = { show: true, color: 'error', message: 'Failed to record trial.' }
  } finally {
    loading.value = false
  }
}

// Delete Logic
const confirmDeleteTraining = (session) => {
  deleteType.value = 'training'
  itemToDelete.value = session
  deleteDialog.value = true
}

const confirmDeleteTest = (test) => {
  deleteType.value = 'test'
  itemToDelete.value = test
  deleteDialog.value = true
}

const executeDelete = async () => {
  loading.value = true
  try {
    if (deleteType.value === 'training') {
      // Sent getUser() to the action so the Supabase filter can circumvent the RLS blocker
      await store.deleteGrammarTraining(itemToDelete.value.id, getUser())
      snackbar.value = { show: true, color: 'success', message: 'Training deleted.' }
    } else if (deleteType.value === 'test') {
      // Sent getUser() to the action so the Supabase filter can circumvent the RLS blocker
      await store.deleteGrammarTest(itemToDelete.value.id, getUser())
      snackbar.value = { show: true, color: 'success', message: 'Trial erased.' }
    }
    deleteDialog.value = false
  } catch (error) {
    console.error(error)
    snackbar.value = { show: true, color: 'error', message: 'Failed to delete item.' }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.border-gold {
  border: 2px solid #d4af37 !important;
}
.border-bottom {
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}
.border-bottom-light {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.medieval-font {
  font-family: 'Cinzel', serif;
}
</style>