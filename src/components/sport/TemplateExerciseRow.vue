<template>
  <v-card class="surface-light mb-4 pa-3" variant="outlined" style="border-color: #3A3020;">
    <v-row dense align="center">
      <v-col cols="12" md="4">
        <v-autocomplete
            v-model="localRow.exercise_id"
            :items="exercises"
            item-title="name"
            item-value="id"
            label="Combat Maneuver"
            variant="underlined"
            color="primary"
            :rules="[v => !!v || 'Required']"
            hide-details="auto"
        ></v-autocomplete>
      </v-col>

      <v-col cols="6" sm="3" md="2">
        <v-text-field
            v-model="localRow.target_sets"
            label="Sets"
            type="number"
            variant="underlined"
            color="primary"
            :rules="sportRules.sets"
            hide-details="auto"
        ></v-text-field>
      </v-col>

      <v-col cols="6" sm="3" md="2">
        <v-text-field
            v-model="localRow.target_reps"
            label="Reps"
            type="number"
            variant="underlined"
            color="primary"
            :rules="sportRules.reps"
            hide-details="auto"
        ></v-text-field>
      </v-col>

      <v-col cols="6" sm="3" md="2">
        <v-text-field
            v-model="localRow.target_weight"
            label="Weight (kg)"
            type="number"
            variant="underlined"
            color="primary"
            :rules="sportRules.weight"
            hide-details="auto"
        ></v-text-field>
      </v-col>

      <v-col cols="6" sm="2" md="1">
        <v-text-field
            v-model="localRow.rest_time"
            label="Rest (s)"
            type="number"
            variant="underlined"
            color="primary"
            :rules="sportRules.restTime"
            hide-details="auto"
        ></v-text-field>
      </v-col>

      <v-col cols="12" sm="1" class="d-flex justify-end justify-sm-center">
        <v-btn
            icon="mdi-delete"
            color="error"
            variant="text"
            @click="$emit('remove')"
            title="Remove from plan"
        ></v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { sportRules } from '@/validators' // Adjust path if needed

const props = defineProps({
  modelValue: { type: Object, required: true },
  exercises: { type: Array, required: true }
})

const emit = defineEmits(['update:modelValue', 'remove'])

const localRow = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>