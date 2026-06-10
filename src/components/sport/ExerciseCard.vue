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

    <v-card-actions class="pt-0 pb-2 px-4 d-flex align-center justify-space-between">
      <span class="text-caption text-iron">Forged by: {{ exercise.created_by || 'Unknown Warrior' }}</span>
      <div class="d-flex gap-1">
        <v-btn icon="mdi-pencil" color="primary" variant="text" size="small" @click="$emit('edit', exercise)" title="Edit Maneuver"></v-btn>
        <v-btn icon="mdi-delete" color="error" variant="text" size="small" @click="$emit('delete', exercise)" title="Delete Maneuver"></v-btn>
      </div>
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
defineEmits(['edit', 'delete'])
</script>