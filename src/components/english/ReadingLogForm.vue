<template>
  <div>
    <v-btn
        color="primary"
        prepend-icon="mdi-feather"
        class="v-btn--variant-elevated v-btn--color-primary"
        @click="dialog = true"
    >
      Log Reading Week
    </v-btn>

    <v-dialog v-model="dialog" :fullscreen="mobile" max-width="500px" transition="dialog-bottom-transition">
      <v-card color="surface">
        <v-toolbar color="surface" flat class="border-b border-iron">
          <v-toolbar-title class="text-primary text-h6">
            <v-icon icon="mdi-scroll" class="me-2" color="primary"></v-icon>
            Inscribe Weekly Log
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
              <v-btn color="primary" type="submit" :disabled="!isFormValid" :loading="loading">
                Record Scroll
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
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

const logForm = ref({
  weekStart: new Date().toISOString().substring(0, 10),
  pagesTranslated: 0,
  notes: ''
})

async function submitLog() {
  if (!isFormValid.value) return
  loading.value = true
  try {
    const profile = authStore.selectedProfile
    await englishStore.logReadingWeek(
        profile,
        logForm.value.weekStart,
        logForm.value.pagesTranslated,
        logForm.value.notes
    )
    dialog.value = false
    logForm.value = {
      weekStart: new Date().toISOString().substring(0, 10),
      pagesTranslated: 0,
      notes: ''
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>