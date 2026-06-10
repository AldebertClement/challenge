<template>
  <v-card color="surface" class="pa-4">
    <div class="text-h6 text-primary mb-4 d-flex align-center">
      <v-icon icon="mdi-history" class="me-2" color="primary"></v-icon>
      Oral Chronicles
    </div>

    <v-data-table
        :headers="headers"
        :items="filteredSessions"
        :loading="englishStore.loading"
        class="bg-transparent"
        density="comfortable"
    >
      <template #[`item.date`]="{ item }">
        <span class="text-on-background font-mono">{{ item.date }}</span>
      </template>

      <template #[`item.activity_type`]="{ item }">
        <div class="d-flex align-center gap-2">
          <v-icon :icon="getActivityIcon(item.activity_type)" color="primary" size="small"></v-icon>
          <span class="text-on-background font-weight-bold">{{ formatActivityLabel(item.activity_type) }}</span>
        </div>
      </template>

      <template #[`item.duration`]="{ item }">
        <span class="text-primary font-weight-bold">{{ item.duration }} min</span>
      </template>

      <template #[`item.self_evaluation`]="{ item }">
        <div class="d-flex align-center">
          <v-icon
              v-for="i in 5"
              :key="i"
              :icon="i <= item.self_evaluation ? 'mdi-shield' : 'mdi-shield-outline'"
              :color="i <= item.self_evaluation ? 'primary' : 'iron'"
              size="small"
          ></v-icon>
        </div>
      </template>

      <template #[`item.notes`]="{ item }">
        <span class="text-on-surface text-caption font-italic">{{ item.notes || '—' }}</span>
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex gap-1">
          <v-btn icon="mdi-pencil" size="small" variant="text" color="primary" @click="openEdit(item)"></v-btn>
          <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="openDelete(item)"></v-btn>
        </div>
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="editDialog" max-width="500">
    <v-card class="bg-surface border-gold">
      <v-card-title class="bg-primary text-white text-h6 py-3">Amend Chronicle</v-card-title>
      <v-card-text class="pt-6">
        <v-form ref="editForm" @submit.prevent="saveEdit">
          <v-text-field v-model="editData.date" label="Date of Lore" type="date" required variant="outlined"></v-text-field>
          <v-text-field v-model.number="editData.duration" label="Duration (min)" type="number" required variant="outlined"></v-text-field>
          <v-select v-model="editData.activity_type" :items="activityTypes" item-title="label" item-value="value" label="Activity Type" required variant="outlined"></v-select>

          <div class="mt-4 mb-6">
            <span class="text-caption text-on-surface d-block text-center mb-2">Shields Earned (Self Evaluation)</span>
            <v-slider
                v-model="editData.self_evaluation"
                min="1" max="5" step="1"
                color="primary"
                hide-details
            ></v-slider>
            <div class="d-flex justify-center mt-2">
              <v-icon
                  v-for="i in 5"
                  :key="i"
                  :icon="i <= editData.self_evaluation ? 'mdi-shield' : 'mdi-shield-outline'"
                  :color="i <= editData.self_evaluation ? 'primary' : 'iron'"
                  class="mx-1"
              ></v-icon>
            </div>
          </div>

          <v-textarea v-model="editData.notes" label="Chronicler Notes" rows="3" variant="outlined"></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" color="iron" @click="editDialog = false">Retreat</v-btn>
        <v-btn color="primary" variant="elevated" :loading="saving" @click="saveEdit">Inscribe Changes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card class="bg-surface border-gold">
      <v-card-title class="text-error bg-surface-light">Silence Chronicle?</v-card-title>
      <v-card-text class="pt-4">
        Are you certain you wish to silence this chronicle forever? It will be lost to the void.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" color="iron" @click="deleteDialog = false">Retreat</v-btn>
        <v-btn color="error" variant="elevated" :loading="deleting" @click="confirmDelete">Silence Forever</v-btn>
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

const englishStore = useEnglishStore()
const authStore = useAuthStore()

const editDialog = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editData = ref({})
const itemToModify = ref(null)
const snackbar = ref({ show: false, color: '', message: '' })

const activityTypes = [
  { label: 'Conversation', value: 'conversation' },
  { label: 'Shadowing', value: 'shadowing' },
  { label: 'Active Listening', value: 'active_listening' },
  { label: 'Presentation', value: 'presentation' },
]

const headers = [
  { title: 'Date of Lore', key: 'date', sortable: true },
  { title: 'Activity Type', key: 'activity_type', sortable: true },
  { title: 'Duration', key: 'duration', sortable: true },
  { title: 'Shields Earned', key: 'self_evaluation', sortable: true },
  { title: 'Chronicler Notes', key: 'notes', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
]

function getNormalizedUser() {
  return (authStore.selectedProfile || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
}

const filteredSessions = computed(() => {
  const profile = getNormalizedUser()
  return englishStore.oralSessions.filter(s => s.user_name === profile)
})

function formatActivityLabel(type) {
  const match = activityTypes.find(a => a.value === type)
  return match ? match.label : type
}

function getActivityIcon(type) {
  if (!type) return 'mdi-scroll'
  const text = type.toLowerCase()
  if (text.includes('shadow')) return 'mdi-shield-text'
  if (text.includes('convers') || text.includes('chat')) return 'mdi-forum'
  if (text.includes('present')) return 'mdi-bullhorn'
  if (text.includes('listen')) return 'mdi-ear-hearing'
  return 'mdi-scroll-horn'
}

function openEdit(item) {
  itemToModify.value = item
  editData.value = {
    date: item.date,
    duration: item.duration,
    activity_type: item.activity_type,
    self_evaluation: item.self_evaluation,
    notes: item.notes
  }
  editDialog.value = true
}

function openDelete(item) {
  itemToModify.value = item
  deleteDialog.value = true
}

async function saveEdit() {
  saving.value = true
  try {
    await englishStore.updateOralSession(itemToModify.value.id, editData.value)
    editDialog.value = false
    snackbar.value = { show: true, color: 'success', message: 'Chronicle amended successfully.' }
  } catch (error) {
    console.error('Failed to update session:', error)
    snackbar.value = { show: true, color: 'error', message: error.message || 'Failed to amend chronicle.' }
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  deleting.value = true
  try {
    await englishStore.deleteOralSession(itemToModify.value.id)
    deleteDialog.value = false
    snackbar.value = { show: true, color: 'success', message: 'Chronicle silenced.' }
  } catch (error) {
    console.error('Failed to delete session:', error)
    snackbar.value = { show: true, color: 'error', message: error.message || 'Failed to silence chronicle.' }
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.border-gold {
  border: 1px solid #8b6508 !important;
}
</style>