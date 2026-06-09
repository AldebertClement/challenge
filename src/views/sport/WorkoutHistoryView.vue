<template>
  <v-container class="pa-4 pa-md-6 h-100 position-relative" fluid>
    <div class="d-flex flex-column flex-sm-row justify-between align-center mb-6 text-center text-sm-left">
      <div>
        <h1 class="section-title">Battle Chronicles</h1>
        <p class="text-on-surface opacity-70">Historical scroll of all campaigns and maneuvers survived.</p>
      </div>
      <v-spacer class="d-none d-sm-block"></v-spacer>
      <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-sword"
          class="mt-4 mt-sm-0"
          @click="logDialog = true"
      >
        Chronicle New Battle
      </v-btn>
    </div>

    <div class="ornament-divider mb-8 mx-auto mx-sm-0" style="max-width: 300px;"></div>

    <v-row v-if="sportStore.loading && $vuetify.display.smAndDown" justify="center" class="my-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-row>

    <div v-else>
      <template v-if="$vuetify.display.smAndDown">
        <div v-if="sportStore.workouts.length === 0" class="text-center py-10 text-iron italic border-iron-dashed rounded bg-surface-light">
          No campaigns logged in this age. Forge a new chronicle scroll above!
        </div>
        <div v-else>
          <WorkoutCard
              v-for="workout in sportStore.workouts"
              :key="workout.id"
              :workout="workout"
          />
        </div>
      </template>

      <template v-else>
        <WorkoutTable
            :workouts="sportStore.workouts"
            :loading="sportStore.loading"
        />
      </template>
    </div>

    <v-btn
        v-if="$vuetify.display.smAndDown"
        icon="mdi-sword"
        color="primary"
        elevation="12"
        position="fixed"
        location="bottom right"
        class="ma-4"
        size="large"
        @click="logDialog = true"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-dialog v-model="logDialog" max-width="850" persistent>
      <LogBattleForm
          @success="onBattleLogged"
          @cancel="logDialog = false"
      />
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSportStore } from '@/stores/sport.store'
import WorkoutCard from '@/components/sport/WorkoutCard.vue'
import WorkoutTable from '@/components/sport/WorkoutTable.vue'
import LogBattleForm from '@/components/sport/LogBattleForm.vue'

const sportStore = useSportStore()
const logDialog = ref(false)

onMounted(async () => {
  await sportStore.fetchWorkouts()
})

const onBattleLogged = () => {
  logDialog.value = false
  // sportStore.logWorkout automatically invokes fetchWorkouts() internally, so the history views update reactively
}
</script>

<style scoped>
.border-iron-dashed {
  border: 1px dashed #3A3020;
}
</style>