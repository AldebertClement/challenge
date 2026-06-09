<template>
  <v-row align="center" no-gutters class="py-2 px-3 my-1 set-input-row rounded bg-surface-light border-iron-thin">
    <v-col cols="2" sm="1" class="text-subtitle-2 text-primary font-weight-bold class-cinzel">
      #{{ modelValue.set_number }}
    </v-col>

    <v-col cols="4" sm="3" class="px-1">
      <v-text-field
          v-model.number="modelValue.weight"
          label="Weight (kg)"
          type="number"
          density="compact"
          variant="outlined"
          color="primary"
          hide-details="auto"
          :rules="weightRules"
      ></v-text-field>
    </v-col>

    <v-col cols="4" sm="3" class="px-1">
      <v-text-field
          v-model.number="modelValue.reps"
          label="Reps"
          type="number"
          density="compact"
          variant="outlined"
          color="primary"
          hide-details="auto"
          :rules="repsRules"
      ></v-text-field>
    </v-col>

    <v-col cols="10" sm="4" class="px-1 pt-2 pt-sm-0">
      <v-text-field
          v-model="modelValue.notes"
          label="Maneuver Notes"
          density="compact"
          variant="outlined"
          color="primary"
          hide-details="auto"
          placeholder="e.g., Smooth, to failure"
      ></v-text-field>
    </v-col>

    <v-col cols="2" sm="1" class="text-right">
      <v-btn
          icon="mdi-delete-variant"
          size="small"
          variant="text"
          color="error"
          @click="$emit('remove')"
          title="Strike down this set"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
import { sportRules } from '@/validators'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

defineEmits(['update:modelValue', 'remove'])

// Fallback logic to protect initialization, ensuring compatibility with validators.js
const repsRules = sportRules?.reps || [
  v => v !== null && v !== undefined && v !== '' || 'Required',
  v => parseInt(v) >= 0 || 'Must be positive'
]

const weightRules = sportRules?.weight || [
  v => v !== null && v !== undefined && v !== '' || 'Required',
  v => parseFloat(v) >= 0 || 'Must be positive'
]
</script>

<style scoped>
.class-cinzel {
  font-family: 'Cinzel', serif !important;
}
.border-iron-thin {
  border: 1px solid rgba(107, 107, 107, 0.2);
}
</style>