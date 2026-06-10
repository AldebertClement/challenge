<template>
  <div class="h-100 d-flex flex-column">
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon icon="mdi-book-open-variant" color="primary" size="28" class="mr-2"></v-icon>
        <h3 class="text-h5 text-uppercase mb-0" style="font-family: 'Cinzel', serif !important; color: #D4C5A9;">
          {{ userName }}
        </h3>
      </div>

      <v-chip v-if="cefrRank" :color="cefrRank.color" variant="flat" class="font-weight-bold text-black px-4">
        <v-icon start :icon="cefrRank.icon"></v-icon>
        {{ cefrRank.label }} ({{ stats.cefrLevel }})
      </v-chip>
    </div>

    <v-row class="mt-auto">
      <v-col cols="12" sm="4">
        <v-chip color="primary" variant="outlined" class="w-100 justify-center font-weight-bold">
          {{ stats.validatedTopics }} / {{ stats.totalTopics }} Topics
        </v-chip>
      </v-col>
      <v-col cols="12" sm="4">
        <v-chip color="secondary" variant="outlined" class="w-100 justify-center font-weight-bold">
          {{ stats.totalWords }} Words
        </v-chip>
      </v-col>
      <v-col cols="12" sm="4">
        <v-chip color="on-surface" variant="outlined" class="w-100 justify-center font-weight-bold">
          {{ stats.oralHours }} Oral Hrs
        </v-chip>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { cefrRanks } from '@/utils/cefrRanks'

const props = defineProps({
  userName: { type: String, required: true },
  stats: { type: Object, required: true }
})

const cefrRank = computed(() => {
  return cefrRanks[props.stats.cefrLevel] || null
})
</script>