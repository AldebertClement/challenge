<template>
  <div class="h-100 d-flex flex-column">
    <div class="d-flex align-center mb-4">
      <v-icon icon="mdi-shield-sword" color="primary" size="28" class="mr-2"></v-icon>
      <h3 class="text-h5 text-uppercase mb-0" style="font-family: 'Cinzel', serif !important; color: #D4C5A9;">
        {{ userName }}
      </h3>
    </div>

    <v-row class="mt-auto">
      <v-col cols="12" sm="4">
        <v-chip color="primary" variant="outlined" class="w-100 justify-center font-weight-bold">
          {{ stats.totalSessions }} Battles
        </v-chip>
      </v-col>
      <v-col cols="12" sm="4">
        <v-chip color="secondary" variant="outlined" class="w-100 justify-center font-weight-bold">
          {{ stats.totalMinutes }} Min
        </v-chip>
      </v-col>
      <v-col cols="12" sm="4">
        <v-chip color="on-surface" variant="outlined" class="w-100 justify-center font-weight-bold">
          {{ stats.weeklyFrequency }} / week
        </v-chip>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
defineProps({
  userName: { type: String, required: true },
  stats: { type: Object, required: true }
})
</script>