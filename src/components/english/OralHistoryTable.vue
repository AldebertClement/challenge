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
          <span class="text-on-background font-weight-bold">{{ item.activity_type }}</span>
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
    </v-data-table>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useEnglishStore } from '@/stores/english.store'
import { useAuthStore } from '@/stores/auth.store'

const englishStore = useEnglishStore()
const authStore = useAuthStore()

const headers = [
  { title: 'Date of Lore', key: 'date', sortable: true },
  { title: 'Activity Type', key: 'activity_type', sortable: true },
  { title: 'Duration', key: 'duration', sortable: true },
  { title: 'Shields Earned', key: 'self_evaluation', sortable: true },
  { title: 'Chronicler Notes', key: 'notes', sortable: false },
]

const filteredSessions = computed(() => {
  const profile = authStore.selectedProfile
  return englishStore.oralSessions.filter(s => s.user_name === profile)
})

function getActivityIcon(type) {
  if (!type) return 'mdi-scroll'
  const text = type.toLowerCase()
  if (text.includes('shadow')) return 'mdi-shield-text'
  if (text.includes('convers') || text.includes('chat')) return 'mdi-forum'
  if (text.includes('declam') || text.includes('rhetoric') || text.includes('speech')) return 'mdi-bullhorn'
  return 'mdi-scroll-horn'
}
</script>