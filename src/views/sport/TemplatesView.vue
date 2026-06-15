<template>
  <v-container class="pa-4 pa-md-6 h-100 position-relative" fluid>
    <div class="text-center mb-8">
      <h1 class="section-title">Battle Plans</h1>
      <p class="text-on-surface opacity-70">Pre-forged strategies for combat training.</p>
      <div class="ornament-divider mt-4 mx-auto" style="max-width: 300px;"></div>
    </div>

    <v-row v-if="sportStore.loading" justify="center" class="mt-10">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-row>

    <v-row v-else class="card-mobile">
      <v-col v-for="template in sportStore.templates" :key="template.id" cols="12" md="6" lg="4">
        <v-card class="surface-light border-iron h-100 d-flex flex-column">
          <v-card-title class="text-primary font-weight-bold d-flex align-center">
            <v-icon color="secondary" class="mr-2">mdi-script</v-icon>
            {{ template.name }}
          </v-card-title>

          <v-card-text class="flex-grow-1">
            <div class="text-subtitle-2 text-on-surface mb-2">Maneuvers:</div>
            <ul class="text-on-surface opacity-80 pl-4" style="list-style-type: square;">
              <li v-for="te in template.session_template_exercises.slice(0, 3)" :key="te.id">
                {{ te.exercises?.name }}
                <span class="text-iron text-caption">({{ te.target_sets }}x{{ te.target_reps }})</span>
              </li>
            </ul>
            <div v-if="template.session_template_exercises.length > 3" class="text-caption text-iron mt-1 font-italic">
              + {{ template.session_template_exercises.length - 3 }} more...
            </div>
          </v-card-text>

          <v-card-actions class="d-flex justify-space-between align-end px-4 pb-3 flex-wrap">
            <div class="w-100 mb-2 text-caption text-iron">Strategist: {{ template.created_by }}</div>
            <div class="d-flex gap-1">
              <v-btn icon="mdi-pencil" color="primary" variant="text" size="small" @click="editTemplate(template)"
                     title="Edit Plan"></v-btn>
              <v-btn icon="mdi-content-copy" color="secondary" variant="text" size="small"
                     @click="duplicateTemplate(template)" title="Duplicate Plan"></v-btn>
              <v-btn icon="mdi-delete" color="error" variant="text" size="small" @click="confirmDelete(template)"
                     title="Delete Plan"></v-btn>
            </div>
            <v-btn color="primary" variant="outlined" size="small" @click="useForBattle(template)">Use for Battle
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-btn
        icon="mdi-pencil-plus"
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

    <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
      <v-card class="surface d-flex flex-column">
        <v-toolbar color="surface-light" class="border-b" style="border-color: #3A3020 !important;">
          <v-btn icon color="iron" @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title class="font-weight-bold text-primary">War Room</v-toolbar-title>
        </v-toolbar>

        <v-card-text class="pa-0 flex-grow-1 overflow-y-auto">
          <TemplateForm
              v-if="dialog"
              :initial-data="selectedTemplate"
              @saved="onTemplateSaved"
              @cancel="dialog = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="surface border-error">
        <v-card-title class="text-error font-weight-bold d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Destroy Battle Plan
        </v-card-title>
        <v-card-text class="text-on-surface pt-2">
          Are you sure you want to permanently destroy this battle plan?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn color="iron" variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="executeDelete" :loading="deleting">Destroy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {useSportStore} from '@/stores/sport.store'
import {useAuthStore} from '@/stores/auth.store'
import TemplateForm from '@/components/sport/TemplateForm.vue'

const sportStore = useSportStore()
const authStore = useAuthStore()
const router = useRouter()

const dialog = ref(false)
const deleteDialog = ref(false)
const deleting = ref(false)

const selectedTemplate = ref(null)
const templateToDelete = ref(null)

onMounted(() => {
  sportStore.fetchTemplates()
})

const openAddDialog = () => {
  selectedTemplate.value = null
  dialog.value = true
}

const editTemplate = (template) => {
  selectedTemplate.value = template
  dialog.value = true
}

const onTemplateSaved = () => {
  dialog.value = false
  selectedTemplate.value = null
}

const duplicateTemplate = async (template) => {
  try {
    const newName = `Copy of ${template.name}`
    const author = authStore.selectedProfile || 'Anonymous Knight'
    const copiedExercises = template.session_template_exercises.map(te => ({
      exercise_id: te.exercise_id,
      target_sets: te.target_sets,
      target_reps: te.target_reps,
      target_weight: te.target_weight,
      rest_time: te.rest_time
    }))
    await sportStore.addTemplate(newName, author, copiedExercises)
  } catch (error) {
    console.error('Failed to duplicate battle plan:', error)
  }
}

const confirmDelete = (template) => {
  templateToDelete.value = template
  deleteDialog.value = true
}

const executeDelete = async () => {
  if (!templateToDelete.value) return
  try {
    deleting.value = true
    await sportStore.deleteTemplate(templateToDelete.value.id)
    deleteDialog.value = false
    templateToDelete.value = null
  } catch (error) {
    console.error('Failed to delete battle plan:', error)
  } finally {
    deleting.value = false
  }
}

const useForBattle = (template) => {
  router.push({path: '/workout', query: {template: template.id}})
}
</script>
<style scoped>
@media screen and (max-width: 600px) {
  .fab-mobile {
    bottom: 60px !important;
  }

  .card-mobile {
    padding-bottom: 80px !important;
  }
}
</style>