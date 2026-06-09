<template>
  <v-container class="py-6">
    <div class="d-flex justify-space-between align-center mb-6 flex-wrap gap-4">
      <div>
        <h1 class="text-h4 font-weight-bold section-title mb-1">The Speaker's Arena</h1>
        <p class="text-subtitle-1 text-on-surface mb-0">Inscribe your oral sessions and train your rhetoric</p>
      </div>
      <OralSessionForm />
    </div>

    <div class="ornament-divider mb-6">
      <v-icon icon="mdi-bullhorn-variant" color="primary"></v-icon>
    </div>

    <v-row>
      <v-col cols="12">
        <OralHistoryTable />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useEnglishStore } from '@/stores/english.store'
import OralSessionForm from '@/components/OralSessionForm.vue'
import OralHistoryTable from '@/components/OralHistoryTable.vue'

const englishStore = useEnglishStore()

onMounted(() => {
  englishStore.fetchOralSessions()
})
</script>