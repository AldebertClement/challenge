<template>
  <v-form ref="form" @submit.prevent="submitTemplate" class="w-100">
    <v-container class="pa-3 pa-lg-6 mx-auto" style="max-width: 800px;">

      <div class="text-center mb-6">
        <h2 class="section-title">{{ isEditing ? 'Reforge Battle Plan' : 'Draft Battle Plan' }}</h2>
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
import { ref, onMounted, computed } from 'vue'
import { useSportStore } from '@/stores/sport.store'
import { useAuthStore } from '@/stores/auth.store'
import { sportRules } from '@/utils/validators'
import TemplateExerciseRow from './TemplateExerciseRow.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['saved', 'cancel'])

const sportStore = useSportStore()
const authStore = useAuthStore()
const form = ref(null)

const templateName = ref('')
const templateExercises = ref([])
const loading = ref(false)

const isEditing = computed(() => !!props.initialData?.id)

onMounted(async () => {
  if (sportStore.exercises.length === 0) {
    await sportStore.fetchExercises()
  }

  if (props.initialData) {
    templateName.value = props.initialData.name
    templateExercises.value = props.initialData.session_template_exercises.map((te) => ({
      _clientId: Date.now() + Math.random(),
      exercise_id: te.exercise_id,
      target_sets: te.target_sets,
      target_reps: te.target_reps,
      target_weight: te.target_weight,
      rest_time: te.rest_time
    }))
  }
})

const addExerciseRow = () => {
  templateExercises.value.push({
    _clientId: Date.now(),
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

    if (isEditing.value) {
      await sportStore.updateTemplate(props.initialData.id, templateName.value, templateExercises.value)
    } else {
      await sportStore.addTemplate(templateName.value, author, templateExercises.value)
    }

    emit('saved')
  } catch (error) {
    console.error('Failed to seal battle plan:', error)
  } finally {
    loading.value = false
  }
}
</script>