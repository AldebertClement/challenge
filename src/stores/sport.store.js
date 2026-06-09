import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useSportStore = defineStore('sport', () => {
    const exercises = ref([])
    const templates = ref([])
    const workouts = ref([])
    const loading = ref(false)

    async function fetchExercises() {
        loading.value = true
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .order('name')
        if (!error) exercises.value = data
        loading.value = false
    }

    async function addExercise(name, description, createdBy) {
        const { data, error } = await supabase
            .from('exercises')
            .insert([{ name, description, created_by: createdBy }])
            .select()
        if (!error && data) {
            exercises.value.push(data[0])
            exercises.value.sort((a, b) => a.name.localeCompare(b.name))
        }
        if (error) throw error
    }

    async function fetchTemplates() {
        loading.value = true
        const { data, error } = await supabase
            .from('session_templates')
            .select(`
        *,
        session_template_exercises (
          *,
          exercises (*)
        )
      `)
        if (!error) templates.value = data
        loading.value = false
    }

    async function addTemplate(name, createdBy, templateExercises) {
        const { data: templateData, error: templateError } = await supabase
            .from('session_templates')
            .insert([{ name, created_by: createdBy }])
            .select()

        if (templateError) throw templateError
        const templateId = templateData[0].id

        if (templateExercises && templateExercises.length > 0) {
            const rows = templateExercises.map((te, index) => ({
                template_id: templateId,
                exercise_id: te.exercise_id,
                order_index: index,
                target_sets: parseInt(te.target_sets),
                target_reps: parseInt(te.target_reps),
                target_weight: te.target_weight ? parseFloat(te.target_weight) : null,
                rest_time: parseInt(te.rest_time)
            }))
            const { error: exercisesError } = await supabase
                .from('session_template_exercises')
                .insert(rows)
            if (exercisesError) throw exercisesError
        }

        await fetchTemplates()
    }

    async function fetchWorkouts() {
        loading.value = true
        const { data, error } = await supabase
            .from('workouts')
            .select(`
        *,
        workout_sets (
          *,
          exercises (*)
        )
      `)
            .order('date', { ascending: false })
        if (!error) workouts.value = data
        loading.value = false
    }

    async function logWorkout(userName, templateId, date, duration, notes, sets) {
        const { data: workoutData, error: workoutError } = await supabase
            .from('workouts')
            .insert([{ user_name: userName, template_id: templateId || null, date, duration: parseInt(duration), notes }])
            .select()

        if (workoutError) throw workoutError
        const workoutId = workoutData[0].id

        if (sets && sets.length > 0) {
            const rows = sets.map(s => ({
                workout_id: workoutId,
                exercise_id: s.exercise_id,
                set_number: parseInt(s.set_number),
                reps: parseInt(s.reps),
                weight: parseFloat(s.weight),
                notes: s.notes || null
            }))
            const { error: setsError } = await supabase
                .from('workout_sets')
                .insert(rows)
            if (setsError) throw setsError
        }

        await fetchWorkouts()
    }

    return {
        exercises, templates, workouts, loading,
        fetchExercises, addExercise, fetchTemplates, addTemplate, fetchWorkouts, logWorkout
    }
})