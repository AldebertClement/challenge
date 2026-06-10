<template>
  <div>
    <v-data-table
        v-model:expanded="expanded"
        :headers="headers"
        :items="workouts"
        :loading="loading"
        item-value="id"
        class="bg-surface border-iron rounded"
        hover
        @click:row="toggleRow"
    >
      <template #loading>
        <div class="text-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </template>

      <template #[`item.date`]="{ item }">
        <span class="font-weight-bold text-primary class-cinzel">{{ formatDate(item.date) }}</span>
      </template>

      <template #[`item.template`]="{ item }">
        <span class="text-on-surface font-weight-medium">{{ item.session_templates?.name || 'Custom Battle' }}</span>
      </template>

      <template #[`item.duration`]="{ item }">
        <v-chip size="small" color="primary" variant="outlined" prepend-icon="mdi-clock-outline">
          {{ item.duration }} mins
        </v-chip>
      </template>

      <template #[`item.user_name`]="{ item }">
        <span class="text-on-surface font-weight-medium">{{ item.user_name || 'Unknown Knight' }}</span>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-icon color="primary">
          {{ expanded.includes(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
        </v-icon>
      </template>

      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" class="pa-4 bg-surface border-top-iron">
            <div class="text-subtitle-1 text-primary font-weight-bold class-cinzel mb-2">
              Maneuvers Executed Details
            </div>
            <v-table density="comfortable" class="bg-surface-light border-iron rounded mb-4">
              <thead>
              <tr>
                <th class="text-left text-primary">Exercise Name</th>
                <th class="text-center text-primary">Set Number</th>
                <th class="text-center text-primary">Reps</th>
                <th class="text-center text-primary">Weight</th>
                <th class="text-left text-primary">Notes</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="set in sortedSets(item.workout_sets)" :key="set.id">
                <td class="text-on-surface font-weight-bold">{{ set.exercises?.name || 'Unknown Maneuver' }}</td>
                <td class="text-center text-on-surface">#{{ set.set_number }}</td>
                <td class="text-center text-on-surface">{{ set.reps }}</td>
                <td class="text-center text-on-surface">{{ set.weight == 0 ? '—' : set.weight + ' kg' }}</td>
                <td class="text-on-surface italic opacity-80">{{ set.notes || '—' }}</td>
              </tr>
              <tr v-if="!item.workout_sets || item.workout_sets.length === 0">
                <td colspan="5" class="text-center text-iron italic py-2">No records of steel in this scroll.</td>
              </tr>
              </tbody>
            </v-table>

            <div class="d-flex gap-2 justify-start">
              <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-pencil"
                  size="small"
                  @click.stop="openEditDialog(item)"
              >
                Edit Battle
              </v-btn>
              <v-btn
                  color="error"
                  variant="outlined"
                  prepend-icon="mdi-delete"
                  size="small"
                  @click.stop="openDeleteDialog(item)"
              >
                Delete Battle
              </v-btn>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>

    <v-dialog v-model="editDialog" max-width="600px" persistent>
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

    <v-dialog v-model="deleteDialog" max-width="450px" persistent>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSportStore } from '@/stores/sport.store'

defineProps({
  workouts: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const sportStore = useSportStore()
const expanded = ref([])

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

const selectedWorkoutId = ref(null)

const headers = [
  { title: 'Date of Battle', key: 'date', align: 'start', width: '20%' },
  { title: 'Template', key: 'template', align: 'start', width: '25%' },
  { title: 'Duration', key: 'duration', align: 'center', width: '15%' },
  { title: 'Warrior', key: 'user_name', align: 'start', width: '25%' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false, width: '15%' }
]

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

const toggleRow = (event, { item }) => {
  if (expanded.value.includes(item.id)) {
    expanded.value = []
  } else {
    expanded.value = [item.id]
  }
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

const openEditDialog = (item) => {
  editData.value = {
    id: item.id,
    date: item.date ? item.date.split('T')[0] : '',
    duration: item.duration,
    notes: item.notes || '',
    sets: item.workout_sets ? JSON.parse(JSON.stringify(item.workout_sets)).sort((a, b) => a.set_number - b.set_number) : []
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
    expanded.value = []
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

const openDeleteDialog = (item) => {
  selectedWorkoutId.value = item.id
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    deleting.value = true
    await sportStore.deleteWorkout(selectedWorkoutId.value)
    deleteDialog.value = false
    expanded.value = []
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
.italic {
  font-style: italic;
}
.border-iron {
  border: 1px solid #3A3020;
}
.border-top-iron {
  border-top: 1px solid #3A3020;
}
.border-bottom-iron {
  border-bottom: 1px solid #3A3020;
}
.border-iron-thin {
  border: 1px solid rgba(107, 107, 107, 0.15);
}
.gap-2 {
  gap: 8px;
}
</style>