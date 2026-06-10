<template>
  <v-card class="surface-light border-iron mb-4" elevation="3" @click="handleCardClick">
    <v-card-item>
      <div class="d-flex justify-between align-center border-bottom-iron pb-2 mb-2">
        <div>
          <div class="text-h6 text-primary font-weight-bold class-cinzel">
            Campaign: {{ formatDate(workout.date) }}
          </div>
          <div class="text-caption text-iron">
            Warrior: <span class="text-on-surface">{{ workout.user_name || 'Unknown Knight' }}</span>
          </div>
        </div>
        <v-spacer></v-spacer>
        <div class="text-right d-flex align-center gap-2">
          <v-chip size="small" color="primary" variant="outlined" prepend-icon="mdi-clock">
            {{ workout.duration }} mins
          </v-chip>
          <v-icon color="primary">
            {{ isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
          </v-icon>
        </div>
      </div>
    </v-card-item>

    <v-card-text>
      <div v-if="workout.notes" class="text-body-2 italic text-on-surface opacity-80 mb-1 bg-surface pa-2 rounded border-iron-thin">
        <v-icon size="x-small" color="secondary" class="mr-1">mdi-book-open-variant</v-icon>
        "{{ workout.notes }}"
      </div>
    </v-card-text>

    <v-expand-transition>
      <div v-if="isExpanded" class="border-top-iron pa-4 bg-surface" @click.stop>
        <div class="text-subtitle-2 text-primary font-weight-bold class-cinzel mb-2">
          Maneuvers Executed Details
        </div>
        <v-table density="compact" class="bg-surface-light border-iron rounded mb-4">
          <thead>
          <tr>
            <th class="text-left text-primary text-caption px-2">Exercise</th>
            <th class="text-center text-primary text-caption px-1">Set</th>
            <th class="text-center text-primary text-caption px-1">Reps</th>
            <th class="text-center text-primary text-caption px-1">Wt</th>
            <th class="text-left text-primary text-caption px-2">Notes</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="set in sortedSets(workout.workout_sets)" :key="set.id">
            <td class="text-caption text-on-surface font-weight-bold px-2">{{ set.exercises?.name || 'Unknown' }}</td>
            <td class="text-center text-caption text-on-surface px-1">#{{ set.set_number }}</td>
            <td class="text-center text-caption text-on-surface px-1">{{ set.reps }}</td>
            <td class="text-center text-caption text-on-surface px-1">{{ set.weight == 0 ? '—' : set.weight + 'kg' }}</td>
            <td class="text-caption text-on-surface italic opacity-80 px-2">{{ set.notes || '—' }}</td>
          </tr>
          <tr v-if="!workout.workout_sets || workout.workout_sets.length === 0">
            <td colspan="5" class="text-center text-iron italic py-2 text-caption">No combat logs.</td>
          </tr>
          </tbody>
        </v-table>

        <div class="d-flex gap-2 justify-start">
          <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-pencil"
              size="small"
              @click.stop="openEditDialog"
          >
            Edit Battle
          </v-btn>
          <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-delete"
              size="small"
              @click.stop="openDeleteDialog"
          >
            Delete Battle
          </v-btn>
        </div>
      </div>
    </v-expand-transition>

    <v-dialog v-model="editDialog" max-width="600px" persistent @click.stop>
      <v-card class="surface-light border-iron text-on-background pa-4">
        <v-card-title class="text-h5 text-primary class-cinzel border-bottom-iron pb-2 mb-4">
          Edit Campaign Chronicles
        </v-card-title>
        <v-card-text>
          <v-form ref="editForm" v-model="isFormValid">
            <v-text-field
                v-model="editData.date"
                label="Date of Battle"
                type="date"
                color="primary"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                required
            ></v-text-field>

            <v-text-field
                v-model.number="editData.duration"
                label="Duration (minutes)"
                type="number"
                color="primary"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                required
            ></v-text-field>

            <v-textarea
                v-model="editData.notes"
                label="Chronicles / Notes"
                color="primary"
                variant="outlined"
                density="comfortable"
                rows="2"
                class="mb-4"
            ></v-textarea>

            <div class="text-subtitle-2 text-primary font-weight-bold class-cinzel mb-2">
              Maneuvers Log
            </div>

            <div v-for="set in editData.sets" :key="set.id" class="border-iron-thin rounded pa-2 mb-3 bg-surface">
              <div class="text-caption text-primary font-weight-bold mb-1">
                {{ set.exercises?.name || 'Maneuver' }} - Set #{{ set.set_number }}
              </div>
              <v-row dense>
                <v-col cols="4">
                  <v-text-field
                      v-model.number="set.reps"
                      label="Reps"
                      type="number"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      required
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                      v-model.number="set.weight"
                      label="Weight (kg)"
                      type="number"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      required
                  ></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                      v-model="set.notes"
                      label="Set Notes"
                      color="primary"
                      variant="outlined"
                      density="compact"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end gap-2">
          <v-btn color="iron" variant="outlined" @click="editDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" :loading="saving" @click="saveEdit">Save Scroll</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="450px" persistent @click.stop>
      <v-card class="surface-light border-iron text-on-background pa-4">
        <v-card-title class="text-h5 text-error class-cinzel mb-2">
          Banish Campaign
        </v-card-title>
        <v-card-text class="text-body-1 text-on-surface">
          Erase this battle from the chronicles?
        </v-card-text>
        <v-card-actions class="justify-end gap-2 mt-4">
          <v-btn color="iron" variant="outlined" @click="deleteDialog = false">Retain</v-btn>
          <v-btn color="error" variant="elevated" :loading="deleting" @click="confirmDelete">Erase</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useSportStore } from '@/stores/sport.store'

const props = defineProps({
  workout: {
    type: Object,
    required: true
  },
  isExpanded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle'])

const sportStore = useSportStore()
const editDialog = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const isFormValid = ref(true)

const editData = ref({
  id: null,
  date: '',
  duration: 0,
  notes: '',
  sets: []
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

const handleCardClick = () => {
  emit('toggle')
}

const sortedSets = (setsArray) => {
  if (!setsArray || !Array.isArray(setsArray)) return []
  return [...setsArray].sort((a, b) => {
    const nameA = a.exercises?.name || ''
    const nameB = b.exercises?.name || ''
    if (nameA !== nameB) return nameA.localeCompare(nameB)
    return a.set_number - b.set_number
  })
}

const openEditDialog = () => {
  editData.value = {
    id: props.workout.id,
    date: props.workout.date ? props.workout.date.split('T')[0] : '',
    duration: props.workout.duration,
    notes: props.workout.notes || '',
    sets: props.workout.workout_sets ? JSON.parse(JSON.stringify(props.workout.workout_sets)).sort((a, b) => a.set_number - b.set_number) : []
  }
  editDialog.value = true
}

const saveEdit = async () => {
  try {
    saving.value = true
    await sportStore.updateWorkout(editData.value.id, {
      date: editData.value.date,
      duration: editData.value.duration,
      notes: editData.value.notes
    }, editData.value.sets)
    editDialog.value = false
    emit('toggle')
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

const openDeleteDialog = () => {
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    deleting.value = true
    await sportStore.deleteWorkout(props.workout.id)
    deleteDialog.value = false
    emit('toggle')
  } catch (err) {
    console.error(err)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.class-cinzel {
  font-family: 'Cinzel', serif !important;
}
.border-bottom-iron {
  border-bottom: 1px solid #3A3020;
}
.border-top-iron {
  border-top: 1px solid #3A3020;
}
.border-iron-thin {
  border: 1px solid rgba(107, 107, 107, 0.2);
}
.border-iron {
  border: 1px solid #3A3020;
}
.italic {
  font-style: italic;
}
.gap-2 {
  gap: 6px;
}
</style>