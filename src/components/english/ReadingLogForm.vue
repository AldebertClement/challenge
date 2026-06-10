<template>
  <div>
    <v-btn
        color="primary"
        prepend-icon="mdi-feather"
        class="v-btn--variant-elevated v-btn--color-primary"
        @click="openAddDialog"
    >
      Log Reading Week
    </v-btn>

    <v-dialog v-model="dialog" :fullscreen="mobile" max-width="500px" transition="dialog-bottom-transition">
      <v-card color="surface">
        <v-toolbar color="surface" flat class="border-b border-iron">
          <v-toolbar-title class="text-primary text-h6">
            <v-icon icon="mdi-scroll" class="me-2" color="primary"></v-icon>
            {{ isEdit ? 'Amend Weekly Log' : 'Inscribe Weekly Log' }}
          </v-toolbar-title>
          <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="isFormValid" @submit.prevent="submitLog">
            <v-text-field
                v-model="logForm.weekStart"
                label="Week Start Date"
                type="date"
                bg-color="surface-light"
                :rules="[v => !!v || 'Date is required']"
                required
                :disabled="isEdit"
                class="mb-4"
            ></v-text-field>

            <v-text-field
                v-model.number="logForm.pagesTranslated"
                label="Pages Translated / Read"
                type="number"
                bg-color="surface-light"
                :rules="[v => (Number.isInteger(+v) && +v >= 0) || 'Must be 0 or more']"
                required
                class="mb-4"
            ></v-text-field>

            <v-textarea
                v-model="logForm.notes"
                label="Chronicle Notes & Discoveries"
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
                {{ isEdit ? 'Update Scroll' : 'Record Scroll' }}
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
import { useDisplay } from 'vuetify'

const englishStore = useEnglishStore()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const dialog = ref(false)
const isFormValid = ref(false)
const loading = ref(false)
const isEdit = ref(false)

const snackbar = ref({ show: false, text: '', color: 'success' })

const logForm = ref({
  weekStart: new Date().toISOString().substring(0, 10),
  pagesTranslated: 0,
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

const openAddDialog = () => {
  isEdit.value = false
  logForm.value = {
    weekStart: new Date().toISOString().substring(0, 10),
    pagesTranslated: 0,
    notes: ''
  }
  dialog.value = true
}

const openForEdit = (log) => {
  isEdit.value = true
  logForm.value = {
    weekStart: log.week_start,
    pagesTranslated: log.pages_translated,
    notes: log.notes || ''
  }
  dialog.value = true
}

defineExpose({ openForEdit })

async function submitLog() {
  if (!isFormValid.value) return
  loading.value = true
  try {
    const profile = normalizeUserName(authStore.selectedProfile)
    await englishStore.logReadingWeek(
        profile,
        logForm.value.weekStart,
        logForm.value.pagesTranslated,
        logForm.value.notes
    )
    dialog.value = false
    snackbar.value = { show: true, text: 'Entry saved to the tome!', color: 'success' }
  } catch (err) {
    console.error(err)
    snackbar.value = { show: true, text: getErrorMessage(err), color: 'error' }
  } finally {
    loading.value = false
  }
}
</script>