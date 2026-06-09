<template>
  <v-card class="pa-5 mb-6" color="surface">
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap gap-2">
      <div>
        <h3 class="text-h5 font-weight-bold mb-1 text-primary">
          {{ currentBook?.title || 'No Active Tome' }}
        </h3>
        <p class="text-caption text-on-surface mb-0" v-if="currentBook?.started_at">
          <v-icon icon="mdi-calendar-scroll" size="small" class="me-1" color="primary"></v-icon>
          Quest began: {{ currentBook.started_at }}
        </p>
      </div>
      <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-book-edit"
          size="small"
          @click="openUpdateDialog"
      >
        Update Book
      </v-btn>
    </div>

    <div class="mb-2 d-flex justify-space-between text-body-2">
      <span class="text-on-surface">Pages Conquered</span>
      <span class="font-weight-bold text-primary">
        {{ totalPagesRead }} / {{ currentBook?.total_pages || 0 }} Pages
      </span>
    </div>

    <v-progress-linear
        :model-value="progressPercentage"
        height="14"
        class="rounded mb-2"
    ></v-progress-linear>

    <div class="text-end text-caption text-on-surface font-italic">
      {{ progressPercentage.toFixed(1) }}% completed
    </div>

    <v-dialog v-model="dialog" :fullscreen="mobile" max-width="500px" transition="dialog-bottom-transition">
      <v-card color="surface">
        <v-toolbar color="surface" flat class="border-b border-iron">
          <v-toolbar-title class="text-primary text-h6">
            <v-icon icon="mdi-book-open-page-variant" class="me-2" color="primary"></v-icon>
            Inscribe Current Tome
          </v-toolbar-title>
          <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="isFormValid" @submit.prevent="saveBook">
            <v-text-field
                v-model="bookForm.title"
                label="Book Title"
                bg-color="surface-light"
                :rules="[v => !!v || 'Title is required']"
                required
                class="mb-4"
            ></v-text-field>

            <v-text-field
                v-model.number="bookForm.totalPages"
                label="Total Pages"
                type="number"
                bg-color="surface-light"
                :rules="englishRules.totalPages"
                required
                class="mb-4"
            ></v-text-field>

            <v-text-field
                v-model="bookForm.startedAt"
                label="Start Date"
                type="date"
                bg-color="surface-light"
                :rules="[v => !!v || 'Start date is required']"
                required
                class="mb-4"
            ></v-text-field>

            <div class="d-flex justify-end gap-2 mt-4">
              <v-btn color="secondary" variant="text" @click="dialog = false">Cancel</v-btn>
              <v-btn color="primary" type="submit" :disabled="!isFormValid" :loading="loading">
                Inscribe Book
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEnglishStore } from '@/stores/english.store'
import { useAuthStore } from '@/stores/auth.store'
import { englishRules } from '@/validators'
import { useDisplay } from 'vuetify'

const englishStore = useEnglishStore()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const dialog = ref(false)
const isFormValid = ref(false)
const loading = ref(false)

const bookForm = ref({
  title: '',
  totalPages: 100,
  startedAt: new Date().toISOString().substring(0, 10)
})

const currentBook = computed(() => {
  const profile = authStore.selectedProfile
  return englishStore.readingBooks.find(b => b.user_name === profile) || null
})

const totalPagesRead = computed(() => {
  const profile = authStore.selectedProfile
  return englishStore.readingLogs
      .filter(log => log.user_name === profile)
      .reduce((sum, log) => sum + (log.pages_translated || 0), 0)
})

const progressPercentage = computed(() => {
  const total = currentBook.value?.total_pages || 0
  if (total <= 0) return 0
  return Math.min((totalPagesRead.value / total) * 100, 100)
})

function openUpdateDialog() {
  if (currentBook.value) {
    bookForm.value = {
      title: currentBook.value.title,
      totalPages: currentBook.value.total_pages,
      startedAt: currentBook.value.started_at ? currentBook.value.started_at.substring(0, 10) : new Date().toISOString().substring(0, 10)
    }
  } else {
    bookForm.value = {
      title: '',
      totalPages: 100,
      startedAt: new Date().toISOString().substring(0, 10)
    }
  }
  dialog.value = true
}

async function saveBook() {
  if (!isFormValid.value) return
  loading.value = true
  try {
    const profile = authStore.selectedProfile
    await englishStore.updateReadingBook(
        profile,
        bookForm.value.title,
        bookForm.value.totalPages,
        bookForm.value.startedAt
    )
    dialog.value = false
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>