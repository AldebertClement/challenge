import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useEnglishStore = defineStore('english', () => {
    const grammarTopics = ref([])
    const grammarProgress = ref([])
    const grammarTests = ref([])
    const grammarTraining = ref([])
    const vocabularyLogs = ref([])
    const oralSessions = ref([])
    const readingBooks = ref([])
    const readingLogs = ref([])
    const loading = ref(false)

    async function fetchGrammarTests() {
        const { data, error } = await supabase
            .from('grammar_tests')
            .select('*')
            .order('tested_at', { ascending: false })
        if (!error) grammarTests.value = data
    }

    async function fetchGrammarTraining() {
        const { data, error } = await supabase
            .from('grammar_training')
            .select('*')
            .order('date', { ascending: false })
        if (!error) grammarTraining.value = data
    }

    async function fetchGrammarData() {
        loading.value = true
        const { data: topics, error: e1 } = await supabase.from('grammar_topics').select('*')
        const { data: progress, error: e2 } = await supabase.from('grammar_progress').select('*')

        if (!e1) grammarTopics.value = topics
        if (!e2) grammarProgress.value = progress

        await fetchGrammarTests()
        await fetchGrammarTraining()
        loading.value = false
    }

    // New logic: Fetch ALL tests for this topic to find the true max score
    async function submitGrammarTest(userName, topicId, score) {
        const parsedScore = parseInt(score)

        const { error: testError } = await supabase
            .from('grammar_tests')
            .insert([{ user_name: userName, topic_id: topicId, score: parsedScore }])
        if (testError) throw testError

        // Fetch all tests to find the highest historical score
        const { data: allTests } = await supabase
            .from('grammar_tests')
            .select('score')
            .eq('user_name', userName)
            .eq('topic_id', topicId)

        const maxScore = allTests && allTests.length > 0 ? Math.max(...allTests.map(t => t.score)) : parsedScore

        await supabase
            .from('grammar_progress')
            .upsert({
                user_name: userName,
                topic_id: topicId,
                mastery_score: maxScore,
                validated: maxScore >= 80,
                last_tested_at: new Date().toISOString()
            }, { onConflict: 'user_name,topic_id' })

        await fetchGrammarData()
    }

    async function deleteGrammarTest(id, userName, topicId) {
        // 1. Delete the specific test
        const { error } = await supabase.from('grammar_tests').delete().eq('id', id).eq('user_name', userName)
        if (error) throw error

        // 2. Fetch remaining tests to determine new mastery
        const { data: remainingTests } = await supabase
            .from('grammar_tests')
            .select('score')
            .eq('user_name', userName)
            .eq('topic_id', topicId)

        if (!remainingTests || remainingTests.length === 0) {
            // Nothing left: delete the progress record or set to 0
            await supabase.from('grammar_progress').delete().eq('user_name', userName).eq('topic_id', topicId)
        } else {
            // Something left: find the new maximum
            const maxScore = Math.max(...remainingTests.map(t => t.score))
            await supabase.from('grammar_progress').update({
                mastery_score: maxScore,
                validated: maxScore >= 80
            }).eq('user_name', userName).eq('topic_id', topicId)
        }

        await fetchGrammarData()
    }

    // ... (keep your existing training/vocabulary/oral/reading functions here)
    async function addGrammarTraining(userName, topicId, date, duration, notes) {
        const { error } = await supabase.from('grammar_training').insert([{ user_name: userName, topic_id: topicId, date, duration: parseInt(duration), notes: notes || null }])
        if (error) throw error
        await fetchGrammarTraining()
    }

    async function updateGrammarTraining(id, updates) {
        const { error } = await supabase.from('grammar_training').update(updates).eq('id', id)
        if (error) throw error
        await fetchGrammarTraining()
    }

    async function deleteGrammarTraining(id, userName) {
        const { error } = await supabase.from('grammar_training').delete().eq('id', id).eq('user_name', userName)
        if (error) throw error
        await fetchGrammarTraining()
    }

    return {
        grammarTopics, grammarProgress, grammarTests, grammarTraining, vocabularyLogs, oralSessions, readingBooks, readingLogs, loading,
        fetchGrammarData, fetchGrammarTests, fetchGrammarTraining, submitGrammarTest, deleteGrammarTest,
        addGrammarTraining, updateGrammarTraining, deleteGrammarTraining
    }
})