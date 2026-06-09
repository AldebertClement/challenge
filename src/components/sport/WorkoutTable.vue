<template>
  <v-data-table
      :headers="headers"
      :items="workouts"
      :loading="loading"
      item-value="id"
      class="bg-surface border-iron rounded"
      hover
  >
    <template #loading>
      <div class="text-center py-4">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
    </template>

    <template #[`item.date`]="{ item }">
      <span class="font-weight-bold text-primary class-cinzel">{{ formatDate(item.date) }}</span>
    </template>

    <template #[`item.user_name`]="{ item }">
      <span class="text-on-surface font-weight-medium">{{ item.user_name || 'Unknown Knight' }}</span>
    </template>

    <template #[`item.duration`]="{ item }">
      <v-chip size="small" color="primary" variant="outlined" prepend-icon="mdi-clock-outline">
        {{ item.duration }} mins
      </v-chip>
    </template>

    <template #[`item.notes`]="{ item }">
      <div class="text-truncate text-caption italic text-on-surface opacity-70" style="max-width: 220px;" :title="item.notes">
        {{ item.notes || 'No notes logged.' }}
      </div>
    </template>

    <template #[`item.workout_sets`]="{ item }">
      <div class="py-2">
        <div v-for="(sets, exerciseName) in groupSets(item.workout_sets)" :key="exerciseName" class="mb-1 text-caption">
          <span class="text-primary font-weight-bold d-inline-flex align-center mr-1">
            <v-icon size="x-small" color="secondary" class="mr-1">mdi-sword-cross</v-icon>
            {{ exerciseName }}:
          </span>
          <span class="text-on-surface bg-surface-light px-2 py-0.5 rounded border-iron-thin">
            {{ formatSets(sets) }}
          </span>
        </div>
        <div v-if="!item.workout_sets || item.workout_sets.length === 0" class="text-iron italic text-caption">
          No combat logs.
        </div>
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
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

const headers = [
  { title: 'Date of Battle', key: 'date', align: 'start', width: '15%' },
  { title: 'Warrior', key: 'user_name', align: 'start', width: '15%' },
  { title: 'Duration', key: 'duration', align: 'center', width: '12%' },
  { title: 'Chronicles / Notes', key: 'notes', align: 'start', width: '23%' },
  { title: 'Maneuvers Executed', key: 'workout_sets', align: 'start', sortable: false, width: '35%' }
]

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

const groupSets = (setsArray) => {
  if (!setsArray || !Array.isArray(setsArray)) return {}
  const groups = {}
  const sorted = [...setsArray].sort((a, b) => a.set_number - b.set_number)
  sorted.forEach(s => {
    const name = s.exercises?.name || 'Unknown Maneuver'
    if (!groups[name]) groups[name] = []
    groups[name].push(s)
  })
  return groups
}

const formatSets = (sets) => {
  return sets.map(s => `#${s.set_number} [${s.weight}kg×${s.reps}]`).join(', ')
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
.border-iron-thin {
  border: 1px solid rgba(107, 107, 107, 0.15);
}
</style>