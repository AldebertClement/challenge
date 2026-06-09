<template>
  <v-card class="surface border-iron pa-4">
    <v-card-title class="text-primary font-weight-bold d-flex align-center px-0 pb-4 class-cinzel">
      <v-icon color="secondary" class="mr-2">mdi-sword-cross</v-icon>
      Chronicle a New Battle
    </v-card-title>

    <v-card-text class="px-0">
      <v-form ref="form" @submit.prevent="submitBattle">
        <v-select
            v-model="chosenTemplateId"
            :items="sportStore.templates"
            item-title="name"
            item-value="id"
            label="Select Battle Blueprint Template (Optional)"
            clearable
            variant="outlined"
            color="primary"
            class="mb-4"
            prepend-inner-icon="mdi-scroll"
        ></v-select>

        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
                v-model="date"
                label="Date of Engagement"
                type="date"
                variant="outlined"
                color="primary"
                required
                prepend-inner-icon="mdi-calendar"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
                v-model.number="duration"
                label="Duration (Minutes)"
                type="number"
                variant="outlined"
                color="primary"
                required
                prepend-inner-icon="mdi-clock-outline"
                :rules="[v => !!v || 'Duration is required', v => v > 0 || 'Must survive longer than 0 min']"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-textarea
            v-model="notes"
            label="Battle Chronicles & Lore (Notes)"
            variant="outlined"
            color="primary"
            rows="2"
            auto-grow
            class="mb-4"
            prepend-inner-icon="mdi-book-open-variant"
        ></v-textarea>

        <div class="ornament-divider my-4"></div>

        <div class="text-subtitle-1 text-primary mb-2 font-weight-bold class-cinzel">Maneuvers Executed</div>

        <div v-if="battleExercises.length === 0" class="text-center py-6 text-on-surface opacity-60 border-iron-dashed rounded mb-4">
          No combat maneuvers recorded yet. Choose a blueprint template above or select a maneuver from the armory below.
        </div>

        <div v-for="(group, gIdx) in battleExercises" :key="gIdx" class="mb-6 pa-3 rounded border-iron bg-surface position-relative">
          <div class="d-flex justify-between align-center mb-2">
            <div class="text-subtitle-2 text-primary font-weight-bold d-flex align-center class-cinzel">
              <v-icon size="small" color="secondary" class="mr-1">mdi-shield-sword</v-icon>
              {{ getExerciseName(group.exercise_id) }}
            </div>
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="removeExerciseGroup(gIdx)"></v-btn>
          </div>

          <v-row no-gutters class="text-caption text-iron font-weight-bold px-3 mb-1 d-none d-sm-flex text-uppercase class-cinzel">
            <v-col cols="1">Set</v-col>
            <v-col cols="3" class="px-1">Weight</v-col>
            <v-col cols="3" class="px-1">Reps</v-col>
            <v-col cols="4" class="px-1">Lore</v-col>
            <v-col cols="1"></v-col>
          </v-row>

          <div v-for="(set, sIdx) in group.sets" :key="sIdx">
            <SetInputRow
                v-model="group.sets[sIdx]"
                @remove="removeSetFromExercise(group, sIdx)"
            />
          </div>

          <v-btn
              variant="text"
              color="primary"
              size="small"
              prepend-icon="mdi-plus"
              class="mt-2"
              @click="addSetToExercise(group)"
          >
            Add Set
          </v-btn>
        </div>

        <v-row class="mt-4 px-1" align="center">
          <v-col cols="12" sm="8">
            <v-select
                v-model="selectedExerciseToAdd"
                :items="sportStore.exercises"
                item-title="name"
                item-value="id"
                label="Select Combat Maneuver from Armory"
                variant="outlined"
                color="primary"
                density="comfortable"
                hide-details
                prepend-inner-icon="mdi-anvil"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" class="text-sm-right mt-2 mt-sm-0">
            <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-plus"
                block
                @click="addExerciseGroup"
                :disabled="!selectedExerciseToAdd"
            >
              Add Maneuver
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions class="px-0 pt-4">
      <v-btn color="iron" variant="text" @click="$emit('cancel')">Retreat</v-btn>
      <v-spacer></v-spacer>
      <v-btn
          color="primary"
          variant="elevated"
          :loading="submitting"
          prepend-icon="mdi-scroll-feather"
          @click="submitBattle"
          :disabled="battleExercises.length === 0"
      >
        Record Battle
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useSportStore } from '@/stores/sport.store'
import { useAuthStore } from '@/stores/auth.store'
import SetInputRow from './SetInputRow.vue'

const emit = defineEmits(['success', 'cancel'])

const sportStore = useSportStore()
const authStore = useAuthStore()

const form = ref(null)
const submitting = ref(false)

const chosenTemplateId = ref(null)
const date = ref(new Date().toISOString().substr(0, 10))
const duration = ref(45)
const notes = ref('')
const battleExercises = ref([])
const selectedExerciseToAdd = ref(null)

onMounted(async () => {
  if (sportStore.exercises.length === 0) await sportStore.fetchExercises()
  if (sportStore.templates.length === 0) await sportStore.fetchTemplates()
})

// Auto-populates rules, sets, and reps based on blueprints templates selection
watch(chosenTemplateId, (newId) => {
  if (!newId) {
    battleExercises.value = []
    return
  }
  const template = sportStore.templates.find(t => t.id === newId)
  if (template && template.session_template_exercises) {
    battleExercises.value = template.session_template_exercises.map(te => {
      const sets = []
      const numSets = te.target_sets || 3
      for (let i = 1; i <= numSets; i++) {
        sets.push({
          set_number: i,
          weight: te.target_weight || 0,
          reps: te.target_reps || 10,
          notes: ''
        })
      }
      return {
        exercise_id: te.exercise_id,
        sets
      }
    })
  }
})

const addExerciseGroup = () => {
  if (!selectedExerciseToAdd.value) return
  battleExercises.value.push({
    exercise_id: selectedExerciseToAdd.value,
    sets: [{ set_number: 1, weight: 0, reps: 10, notes: '' }]
  })
  selectedExerciseToAdd.value = null
}

const addSetToExercise = (group) => {
  const nextSetNumber = group.sets.length + 1
  const prevSet = group.sets.length > 0 ? group.sets[group.sets.length - 1] : null
  group.sets.push({
    set_number: nextSetNumber,
    weight: prevSet ? prevSet.weight : 0,
    reps: prevSet ? prevSet.reps : 10,
    notes: ''
  })
}

const removeSetFromExercise = (group, setIndex) => {
  group.sets.splice(setIndex, 1)
  group.sets.forEach((s, idx) => {
    s.set_number = idx + 1
  })
}

const removeExerciseGroup = (index) => {
  battleExercises.value.splice(index, 1)
}

const getExerciseName = (id) => {
  const ex = sportStore.exercises.find(e => e.id === id)
  return ex ? ex.name : 'Unknown Maneuver'
}

const submitBattle = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  try {
    submitting.value = true
    const userName = authStore.selectedProfile || 'Anonymous Knight'

    const flattenedSets = []
    battleExercises.value.forEach(be => {
      be.sets.forEach(s => {
        flattenedSets.push({
          exercise_id: be.exercise_id,
          set_number: s.set_number,
          reps: s.reps,
          weight: s.weight,
          notes: s.notes || null
        })
      })
    })

    await sportStore.logWorkout(
        userName,
        chosenTemplateId.value,
        date.value,
        duration.value,
        notes.value,
        flattenedSets
    )

    // Reset components values
    chosenTemplateId.value = null
    date.value = new Date().toISOString().substr(0, 10)
    duration.value = 45
    notes.value = ''
    battleExercises.value = []

    emit('success')
  } catch (error) {
    console.error('Failed to record campaign:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.class-cinzel {
  font-family: 'Cinzel', serif !important;
}
.border-iron-dashed {
  border: 1px dashed #6B6B6B;
}
.border-iron {
  border: 1px solid #3A3020;
}
</style>