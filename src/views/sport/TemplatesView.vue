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

    <v-row v-else>
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

          <v-card-actions class="d-flex justify-space-between px-4 pb-3">
            <span class="text-caption text-iron">Strategist: {{ template.created_by }}</span>
            <v-btn color="primary" variant="outlined" size="small">Select Plan</v-btn>
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
        class="ma-4 ma-md-6"
        size="x-large"
        @click="dialog = true"
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
          <TemplateForm @saved="onTemplateSaved" @cancel="dialog = false" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSportStore } from '@/stores/sport.store'
import TemplateForm from '@/components/sport/TemplateForm.vue'

const sportStore = useSportStore()
const dialog = ref(false)

onMounted(() => {
  sportStore.fetchTemplates()
})

const onTemplateSaved = () => {
  dialog.value = false
  // The store function addTemplate handles refetching the templates automatically.
}
</script>