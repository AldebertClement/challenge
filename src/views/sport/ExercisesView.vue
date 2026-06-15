<template>
  <v-container class="pa-4 pa-md-6 h-100 position-relative" fluid>
    <div class="text-center mb-8">
      <h1 class="section-title">The Armory</h1>
      <p class="text-on-surface opacity-70">Catalog of known combat maneuvers and exercises.</p>
      <div class="ornament-divider mt-4 mx-auto" style="max-width: 300px;"></div>
    </div>

    <v-row v-if="sportStore.loading" justify="center" class="mt-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-row>

    <v-row v-else class="card-mobile">
      <v-col v-for="exercise in sportStore.exercises" :key="exercise.id" cols="12" sm="6" md="4" lg="3">
        <ExerciseCard
            :exercise="exercise"
            @edit="openEditDialog"
            @delete="confirmDelete"
        />
      </v-col>
    </v-row>

    <v-btn
        icon="mdi-plus-sword"
        color="primary"
        elevation="12"
        position="fixed"
        location="bottom right"
        class="ma-4 ma-md-6 fab-mobile"
        size="x-large"
        @click="openAddDialog"
    >
      <v-icon size="x-large">mdi-plus</v-icon>
    </v-btn>

    <v-dialog v-model="dialog" max-width="500">
      <v-card class="surface border-iron">
        <v-card-title class="text-primary font-weight-bold d-flex align-center">
          <v-icon color="secondary" class="mr-2">mdi-anvil</v-icon>
          {{ isEditing ? 'Reforge Maneuver' : 'Forge New Maneuver' }}
        </v-card-title>

        <v-card-text >
          <v-form ref="form" @submit.prevent="submitExercise">
            <v-text-field
                v-model="newExercise.name"
                label="Maneuver Name"
                variant="outlined"
                color="primary"
                :rules="sportRules.exerciseName"
                class="mb-4 mt-2"
            ></v-text-field>

            <v-textarea
                v-model="newExercise.description"
                label="Lore & Instructions"
                variant="outlined"
                color="primary"
                rows="4"
                auto-grow
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="iron" variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" variant="elevated" @click="submitExercise" :loading="submitting">
            {{ isEditing ? 'Save' : 'Forge' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="surface border-error">
        <v-card-title class="text-error font-weight-bold d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Discard Maneuver
        </v-card-title>
        <v-card-text class="text-on-surface pt-2">
          Are you sure you want to remove this weapon from the armory?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="iron" variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="executeDelete" :loading="deleting">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useSportStore} from '@/stores/sport.store'
import {useAuthStore} from '@/stores/auth.store'
import {sportRules} from '@/utils/validators'
import ExerciseCard from '@/components/sport/ExerciseCard.vue'

const sportStore = useSportStore()
const authStore = useAuthStore()

const dialog = ref(false)
const deleteDialog = ref(false)
const form = ref(null)
const submitting = ref(false)
const deleting = ref(false)

const isEditing = ref(false)
const editId = ref(null)
const exerciseToDelete = ref(null)

const newExercise = ref({
  name: '',
  description: ''
})

onMounted(() => {
  sportStore.fetchExercises()
})

const openAddDialog = () => {
  isEditing.value = false
  editId.value = null
  newExercise.value = {name: '', description: ''}
  dialog.value = true
}

const openEditDialog = (exercise) => {
  isEditing.value = true
  editId.value = exercise.id
  newExercise.value = {name: exercise.name, description: exercise.description}
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  setTimeout(() => {
    newExercise.value = {name: '', description: ''}
    isEditing.value = false
    editId.value = null
  }, 200)
}

const submitExercise = async () => {
  const {valid} = await form.value.validate()
  if (!valid) return

  try {
    submitting.value = true
    if (isEditing.value) {
      await sportStore.updateExercise(editId.value, newExercise.value.name, newExercise.value.description)
    } else {
      const author = authStore.selectedProfile || 'Anonymous Knight'
      await sportStore.addExercise(newExercise.value.name, newExercise.value.description, author)
    }
    closeDialog()
  } catch (error) {
    console.error('Failed to save maneuver:', error)
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (exercise) => {
  exerciseToDelete.value = exercise
  deleteDialog.value = true
}

const executeDelete = async () => {
  if (!exerciseToDelete.value) return
  try {
    deleting.value = true
    await sportStore.deleteExercise(exerciseToDelete.value.id)
    deleteDialog.value = false
    exerciseToDelete.value = null
  } catch (error) {
    console.error('Failed to delete maneuver:', error)
  } finally {
    deleting.value = false
  }
}
</script>
<style scoped>
@media screen and (max-width: 600px) {
  .card-mobile{
    padding-bottom: 80px !important;
  }
}
</style>