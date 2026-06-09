<template>
  <div class="mb-10 rank-tier">
    <v-card :color="rank.color" dark class="mb-4 elevation-3 border-gold">
      <v-card-title class="text-h5 font-weight-bold d-flex align-center">
        <v-icon start :icon="rank.icon" class="mr-3"></v-icon>
        {{ rank.level }} - {{ rank.title }}
      </v-card-title>
    </v-card>
    <v-row>
      <v-col
          v-for="topic in topics"
          :key="topic.id"
          cols="12" sm="6" md="4" lg="3"
      >
        <GrammarTopicCard
            :topic="topic"
            @click="$emit('open-test', topic)"
        />
      </v-col>
      <v-col v-if="!topics.length" cols="12">
        <p class="text-subtitle-1 text-disabled font-italic pl-4">
          No records discovered for this tier yet...
        </p>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import GrammarTopicCard from './GrammarTopicCard.vue'

defineProps({
  rank: { type: Object, required: true },
  topics: { type: Array, required: true }
})
defineEmits(['open-test'])
</script>

<style scoped>
.border-gold {
  border: 2px solid #d4af37 !important;
}
</style>