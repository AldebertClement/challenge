<template>
  <v-card class="surface-light border-iron mb-4" elevation="3">
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
        <div class="text-right">
          <v-chip size="small" color="primary" variant="outlined" prepend-icon="mdi-clock">
            {{ workout.duration }} mins
          </v-chip>
        </div>
      </div>
    </v-card-item>

    <v-card-text>
      <div v-if="workout.notes" class="text-body-2 italic text-on-surface opacity-80 mb-3 bg-surface pa-2 rounded border-iron-thin">
        <v-icon size="x-small" color="secondary" class="mr-1">mdi-book-open-variant</v-icon>
        "{{ workout.notes }}"
      </div>

      <div class="mt-2">
        <div class="text-subtitle-2 text-primary font-weight-bold mb-1 text-uppercase class-cinzel">Maneuvers Executed</div>

        <div v-if="!groupedSets || Object.keys(groupedSets).length === 0" class="text-caption text-iron italic">
          No records of steel in this scroll.
        </div>

        <div v-for="(sets, exerciseName) in groupedSets" :key="exerciseName" class="mb-3">
          <div class="text-body-2 font-weight-bold text-on-surface d-flex align-center">
            <v-icon size="x-small" color="secondary" class="mr-1">mdi-shield</v-icon>
            {{ exerciseName }}
          </div>

          <div class="pl-2 d-flex flex-wrap gap-2 mt-1">
            <v-chip
                v-for="set in sets"
                :key="set.id"
                size="x-small"
                color="iron"
                variant="flat"
                class="bg-surface border-iron-thin text-on-surface py-1 px-2"
                :title="set.notes || ''"
            >
              <span class="text-primary font-weight-bold mr-1">#{{ set.set_number }}:</span>
              {{ set.weight }}kg × {{ set.reps }}
              <v-icon v-if="set.notes" size="x-small" color="primary" class="ml-1">mdi-comment-text-outline</v-icon>
            </v-chip>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  workout: {
    type: Object,
    required: true
  }
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

const groupedSets = computed(() => {
  if (!props.workout.workout_sets || !Array.isArray(props.workout.workout_sets)) return {}
  const groups = {}
  const sortedSets = [...props.workout.workout_sets].sort((a, b) => a.set_number - b.set_number)

  sortedSets.forEach(set => {
    const exName = set.exercises?.name || 'Unknown Maneuver'
    if (!groups[exName]) groups[exName] = []
    groups[exName].push(set)
  })
  return groups
})
</script>

<style scoped>
.class-cinzel {
  font-family: 'Cinzel', serif !important;
}
.border-bottom-iron {
  border-bottom: 1px solid #3A3020;
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