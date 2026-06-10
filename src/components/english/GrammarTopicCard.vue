<template>
  <v-card
      hover
      :class="['topic-card', 'bg-surface', { 'c2-mastered-glow': isC2Mastered }]"
      @click="$emit('click', topic)"
  >
    <v-card-item>
      <v-card-title class="text-primary font-weight-bold">{{ topic.name }}</v-card-title>
      <v-card-subtitle>Mastery Score: {{ masteryScore }}/100</v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <p class="text-body-2 mb-2">{{ topic.description }}</p>

      <div class="d-flex align-center justify-space-between mt-2">
        <v-chip
            :color="isValidated ? 'success' : 'grey-darken-1'"
            size="small"
            class="text-uppercase font-weight-bold"
        >
          {{ isValidated ? 'Mastered' : 'Uncharted' }}
        </v-chip>
        <v-btn icon size="small" variant="text" color="iron" @click.stop="expanded = !expanded">
          <v-icon>{{ expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </div>
    </v-card-text>

    <v-expand-transition>
      <div v-show="expanded">
        <v-divider></v-divider>
        <v-card-text class="pt-2">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="text-subtitle-2 text-primary">Past Trials</span>
            <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click.stop="deleteDialog = true"></v-btn>
          </div>

          <v-list density="compact" class="bg-transparent pa-0" v-if="topic.tests && topic.tests.length">
            <v-list-item v-for="test in topic.tests" :key="test.id" class="px-0 min-h-0 py-1">
              <template v-slot:title>
                <span class="text-caption text-on-surface">{{ formatDate(test.tested_at) }}</span>
              </template>
              <template v-slot:append>
                <v-chip size="x-small" :color="test.score >= 80 ? 'success' : 'error'">
                  {{ test.score }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
          <div v-else class="text-caption text-iron font-italic">No trials recorded yet.</div>
        </v-card-text>
      </div>
    </v-expand-transition>

    <v-dialog v-model="deleteDialog" max-width="400" @click.stop>
      <v-card class="bg-surface border-gold">
        <v-card-title class="text-error bg-surface-light">Erase Knowledge?</v-card-title>
        <v-card-text class="pt-4">
          Are you certain you wish to purge all progress and trial history for <strong>{{ topic.name }}</strong>? This cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" color="iron" @click="deleteDialog = false">Retreat</v-btn>
          <v-btn color="error" variant="elevated" :loading="deleting" @click="confirmDelete">Purge</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEnglishStore } from '@/stores/english.store'
import { useAuthStore } from '@/stores/auth.store'

const props = defineProps({
  topic: { type: Object, required: true }
})
defineEmits(['click'])

const store = useEnglishStore()
const authStore = useAuthStore()

const expanded = ref(false)
const deleteDialog = ref(false)
const deleting = ref(false)

const masteryScore = computed(() => props.topic.progress?.mastery_score || 0)
const isValidated = computed(() => props.topic.progress?.validated || false)

const isC2Mastered = computed(() => {
  return props.topic.cefr_level === 'C2' && isValidated.value
})

function getNormalizedUser() {
  return (authStore.selectedProfile || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    await store.deleteGrammarProgress(getNormalizedUser(), props.topic.id)
    deleteDialog.value = false
    expanded.value = false
  } catch (error) {
    console.error("Failed to purge knowledge:", error)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.topic-card {
  border: 1px solid #8b6508;
  transition: all 0.3s ease;
  cursor: pointer;
}

.border-gold {
  border: 1px solid #8b6508 !important;
}

/* Glowing effect for C2 Mastery */
.c2-mastered-glow {
  box-shadow: 0 0 15px 5px rgba(255, 215, 0, 0.7) !important;
  border: 2px solid #ffd700 !important;
  animation: legendary-pulse 2s infinite alternate;
}

@keyframes legendary-pulse {
  from { box-shadow: 0 0 10px 2px rgba(255, 215, 0, 0.5); }
  to { box-shadow: 0 0 20px 8px rgba(255, 215, 0, 0.9); }
}
</style>