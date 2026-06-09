<template>
  <v-card class="h-100 d-flex flex-column surface-light" elevation="4">
    <v-card-title class="text-primary font-weight-bold d-flex align-center pb-1">
      <v-icon color="secondary" class="mr-2" size="small">mdi-sword-cross</v-icon>
      <span class="text-truncate">{{ exercise.name }}</span>
    </v-card-title>

    <div class="px-4">
      <div class="ornament-divider"></div>
    </div>

    <v-card-text class="flex-grow-1 text-on-surface pt-3">
      {{ exercise.description || 'No lore or instructions provided for this maneuver.' }}
    </v-card-text>

    <v-card-actions class="pt-0 pb-2 px-4 text-caption text-iron d-flex justify-end">
      Forged by: {{ exercise.created_by || 'Unknown Warrior' }}
    </v-card-actions>
  </v-card>
</template>

<script setup>
defineProps({
  exercise: {
    type: Object,
    required: true
  }
})
</script>