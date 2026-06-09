<template>
  <v-container class="py-6">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-h4 font-weight-bold section-title mb-1">The Great Library</h1>
        <p class="text-subtitle-1 text-on-surface mb-0">Track your epic reading journeys and translations</p>
      </div>
      <ReadingLogForm />
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
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useEnglishStore } from '@/stores/english.store'
import { useAuthStore } from '@/stores/auth.store'
import BookProgressCard from '@/components/english/BookProgressCard.vue'
import ReadingLogForm from '@/components/english/ReadingLogForm.vue'

const englishStore = useEnglishStore()
const authStore = useAuthStore()

const headers = [
  { title: 'Week of Lore', key: 'week_start', sortable: true },
  { title: 'Pages Conquered', key: 'pages_translated', sortable: true },
  { title: 'Scribe Notes', key: 'notes', sortable: false },
]

const filteredLogs = computed(() => {
  const profile = authStore.selectedProfile
  return englishStore.readingLogs.filter(log => log.user_name === profile)
})

onMounted(() => {
  englishStore.fetchReadingData()
})
</script>