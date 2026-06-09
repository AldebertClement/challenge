<template>
  <v-form ref="form" @submit.prevent="submitTemplate" class="w-100">
    <v-container class="pa-3 pa-lg-6 mx-auto" style="max-width: 800px;">

      <div class="text-center mb-6">
        <h2 class="section-title">Draft Battle Plan</h2>
        <div class="ornament-divider mt-2"></div>
      </div>

      <v-text-field
          v-model="templateName"
          label="Name of the Plan"
          variant="outlined"
          color="primary"
          bg-color="surface-light"
          :rules="sportRules.exerciseName"
          class="mb-6"
          prepend-inner-icon="mdi-script-text"
      ></v-text-field>

      <h3 class="text-primary mb-3 font-weight-regular d-flex justify-space-between align-center">
        Maneuvers Sequence
        <v-btn color="secondary" variant="outlined" size="small" @click="addExerciseRow">
          <v-icon left>mdi-plus</v-icon> Add Maneuver
        </v-btn>
      </h3>

      <v-scroll-y-transition group>
        <TemplateExerciseRow
            v-for="(row, index) in templateExercises"
            :key="row._clientId"
            v-model="templateExercises[index]"
            :exercises="sportStore.exercises"
            @remove="removeExerciseRow(index)"
        />
      </v-scroll-y-transition>

      <div v-if="templateExercises.length === 0" class="text-center text-iron py-6 border-iron rounded" style="border: 1px dashed;">
        No maneuvers added. Add combat techniques to complete the battle plan.
      </div>

      <div class="d-flex justify-end gap-4 mt-6">
        <v-btn color="iron" variant="text" @click="$emit('cancel')">Retreat</v-btn>
        <v-btn
            color="primary"
            type="submit"
            :loading="loading"
            :disabled="templateExercises.length === 0"
            elevation="4"
        >
          Seal Plan
        </v-btn>
      </div>

    </v-container>
  </v-form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSportStore } from '@/stores/sport.store'
import { useAuthStore } from '@/stores/auth.store'
import { sportRules } from '@/validators'
import TemplateExerciseRow from './TemplateExerciseRow.vue'

const emit = defineEmits(['saved', 'cancel'])

const sportStore = useSportStore()
const authStore = useAuthStore()
const form = ref(null)

const templateName = ref('')
const templateExercises = ref([])
const loading = ref(false)

onMounted(async () => {
  if (sportStore.exercises.length === 0) {
    await sportStore.fetchExercises()
  }
})

const addExerciseRow = () => {
  templateExercises.value.push({
    _clientId: Date.now(), // Internal unique ID for v-for keying
    exercise_id: null,
    target_sets: 3,
    target_reps: 10,
    target_weight: null,
    rest_time: 60
  })
}

const removeExerciseRow = (index) => {
  templateExercises.value.splice(index, 1)
}

const submitTemplate = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    loading.value = true
    const author = authStore.selectedProfile || 'Anonymous Knight'
    await sportStore.addTemplate(templateName.value, author, templateExercises.value)
    emit('saved')
  } catch (error) {
    console.error('Failed to seal battle plan:', error)
  } finally {
    loading.value = false
  }
}
</script>