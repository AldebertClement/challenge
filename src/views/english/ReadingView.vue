<template>
  <v-container class="py-6">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-h4 font-weight-bold section-title mb-1">The Great Library</h1>
        <p class="text-subtitle-1 text-on-surface mb-0">Track your epic reading journeys and translations</p>
      </div>
      <ReadingLogForm ref="logFormRef" />
    </div>

    <div class="ornament-divider mb-6">
      <v-icon icon="mdi-book-cross" color="primary"></v-icon>
    </div>

    <v-row>
      <v-col cols="12" md="4">
        <BookProgressCard />
      </v-col>

      <v-col cols="12" md="8">
        <v-card color="surface" class="pa-4">
          <div class="text-h6 text-primary mb-4 d-flex align-center">
            <v-icon icon="mdi-book-open-variant" class="me-2" color="primary"></v-icon>
            Library Chronicles
          </div>

          <v-data-table
              :headers="headers"
              :items="filteredLogs"
              :loading="englishStore.loading"
              class="bg-transparent"
              density="comfortable"
          >
            <template #[`item.week_start`]="{ item }">
              <span class="text-on-background font-mono">{{ item.week_start }}</span>
            </template>

            <template #[`item.pages_translated`]="{ item }">
              <span class="text-primary font-weight-bold">+{{ item.pages_translated }} Pages</span>
            </template>

            <template #[`item.notes`]="{ item }">
              <span class="text-on-surface text-caption font-italic">{{ item.notes || '—' }}</span>
            </template>

            <template #[`item.actions`]="{ item }">
              <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" @click="editLog(item)"></v-btn>
              <v-btn icon="mdi-delete" size="small" color="error" variant="text" @click="confirmDelete(item)"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card color="surface">
        <v-card-title class="text-h6 text-error">Confirm Deletion</v-card-title>
        <v-card-text>Remove this week's entry from the chronicles?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :disabled="deleting" :loading="deleting" @click="executeDelete">
            <template v-if="deleting">
              <v-progress-circular indeterminate size="20" color="white" class="me-2"></v-progress-circular>
            </template>
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useEnglishStore } from '@/stores/english.store'
import { useAuthStore } from '@/stores/auth.store'
import { supabase } from '@/services/supabase'
import BookProgressCard from '@/components/english/BookProgressCard.vue'
import ReadingLogForm from '@/components/english/ReadingLogForm.vue'

const englishStore = useEnglishStore()
const authStore = useAuthStore()

const logFormRef = ref(null)
const deleteDialog = ref(false)
const itemToDelete = ref(null)
const deleting = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

const headers = [
  { title: 'Week of Lore', key: 'week_start', sortable: true },
  { title: 'Pages Conquered', key: 'pages_translated', sortable: true },
  { title: 'Scribe Notes', key: 'notes', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
]

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

const filteredLogs = computed(() => {
  const profile = normalizeUserName(authStore.selectedProfile)
  return englishStore.readingLogs.filter(log => log.user_name === profile)
})

const editLog = (item) => {
  if (logFormRef.value) {
    logFormRef.value.openForEdit(item)
  }
}

const confirmDelete = (item) => {
  itemToDelete.value = item
  deleteDialog.value = true
}

const executeDelete = async () => {
  deleting.value = true
  try {
    const profile = normalizeUserName(authStore.selectedProfile)
    const { error } = await supabase
        .from('reading_logs')
        .delete()
        .match({ user_name: profile, week_start: itemToDelete.value.week_start })

    if (error) throw error

    snackbar.value = { show: true, text: 'Entry saved to the tome!', color: 'success' }
    await englishStore.fetchReadingData()
  } catch (error) {
    console.error(error)
    snackbar.value = { show: true, text: getErrorMessage(error), color: 'error' }
  } finally {
    deleting.value = false
    deleteDialog.value = false
  }
}

onMounted(() => {
  englishStore.fetchReadingData()
})
</script>