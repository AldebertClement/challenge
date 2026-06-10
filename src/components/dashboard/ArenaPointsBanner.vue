<template>
  <div class="mb-8">
    <div class="d-flex align-center justify-center mb-6">
      <v-icon icon="mdi-castle" color="primary" size="32" class="mr-3"></v-icon>
      <h2 class="text-h4 font-weight-bold text-center" style="font-family: 'Cinzel', serif !important; color: #C9A84C;">
        The Arena — Head to Head
      </h2>
      <v-icon icon="mdi-castle" color="primary" size="32" class="ml-3"></v-icon>
    </div>

    <v-row class="align-center d-flex flex-column flex-sm-row mb-4">
      <v-col cols="12" sm="4" class="text-center text-sm-right position-relative">
        <v-icon v-if="leader === 'clement'" icon="mdi-crown" class="crown-icon text-primary position-absolute" style="top: -20px; right: 20px; font-size: 2rem;"></v-icon>
        <div class="text-uppercase" style="font-family: 'Cinzel', serif !important; color: #D4C5A9; font-size: 1.5rem;">Clément</div>
        <div class="font-weight-bold" style="font-family: 'Cinzel', serif !important; color: #C9A84C; font-size: clamp(1.8rem, 4vw, 2.5rem);">
          {{ clement.total }}
        </div>
      </v-col>

      <v-col cols="12" sm="4" class="px-4">
        <v-progress-linear
            :model-value="clementPercentage"
            height="12"
            :color="leader === 'clement' ? 'primary' : 'secondary'"
            :bg-color="leader === 'celio' ? 'primary' : 'secondary'"
            bg-opacity="1"
            rounded
        ></v-progress-linear>
      </v-col>

      <v-col cols="12" sm="4" class="text-center text-sm-left position-relative">
        <v-icon v-if="leader === 'celio'" icon="mdi-crown" class="crown-icon text-primary position-absolute" style="top: -20px; left: 20px; font-size: 2rem;"></v-icon>
        <div class="text-uppercase" style="font-family: 'Cinzel', serif !important; color: #D4C5A9; font-size: 1.5rem;">Celio</div>
        <div class="font-weight-bold" style="font-family: 'Cinzel', serif !important; color: #C9A84C; font-size: clamp(1.8rem, 4vw, 2.5rem);">
          {{ celio.total }}
        </div>
      </v-col>
    </v-row>

    <v-card class="bg-surface-light border-iron mx-auto" max-width="600">
      <v-table class="bg-transparent">
        <thead>
        <tr>
          <th class="text-left text-primary font-weight-bold" style="font-family: 'Cinzel', serif !important;">Category</th>
          <th class="text-center text-primary font-weight-bold" style="font-family: 'Cinzel', serif !important;">Clément</th>
          <th class="text-center text-primary font-weight-bold" style="font-family: 'Cinzel', serif !important;">Celio</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="cat in categories" :key="cat.key">
          <td class="text-left text-on-surface">{{ cat.label }}</td>
          <td class="text-center font-weight-bold" :class="clement[cat.key] >= celio[cat.key] ? 'text-primary' : 'text-on-surface'">
            {{ clement[cat.key] }} pts
          </td>
          <td class="text-center font-weight-bold" :class="celio[cat.key] >= clement[cat.key] ? 'text-primary' : 'text-on-surface'">
            {{ celio[cat.key] }} pts
          </td>
        </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  clement: { type: Object, required: true },
  celio: { type: Object, required: true }
})

const leader = computed(() => {
  if (props.clement.total > props.celio.total) return 'clement'
  if (props.celio.total > props.clement.total) return 'celio'
  return 'tie'
})

const clementPercentage = computed(() => {
  const total = props.clement.total + props.celio.total
  if (total === 0) return 50
  return (props.clement.total / total) * 100
})

const categories = [
  { label: 'Sport', key: 'sportPoints' },
  { label: 'Grammar ', key: 'grammarPoints' },
  { label: 'Vocabulary', key: 'vocabPoints' },
  { label: 'Oral', key: 'oralPoints' },
  { label: 'Reading', key: 'readingPoints' }
]
</script>

<style scoped>
@keyframes crownGlow {
  0%, 100% { filter: drop-shadow(0 0 4px #C9A84C); }
  50%       { filter: drop-shadow(0 0 12px #C9A84C); }
}
.crown-icon { animation: crownGlow 2s ease-in-out infinite; }
</style>