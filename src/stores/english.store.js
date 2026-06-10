import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useEnglishStore = defineStore('english', () => {
    const grammarTopics = ref([])
    const grammarProgress = ref([])
    const grammarTests = ref([])
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

    async function fetchGrammarData() {
        loading.value = true
        const { data: topics, error: e1 } = await supabase.from('grammar_topics').select('*')
        const { data: progress, error: e2 } = await supabase.from('grammar_progress').select('*')

        if (!e1) grammarTopics.value = topics
        if (!e2) grammarProgress.value = progress

        await fetchGrammarTests()
        loading.value = false
    }

    async function submitGrammarTest(userName, topicId, score) {
        const { error: testError } = await supabase
            .from('grammar_tests')
            .insert([{ user_name: userName, topic_id: topicId, score: parseInt(score) }])
        if (testError) throw testError

        const validated = score >= 80
        const { error: progressError } = await supabase
            .from('grammar_progress')
            .upsert({
                user_name: userName,
                topic_id: topicId,
                mastery_score: parseInt(score),
                validated,
                last_tested_at: new Date().toISOString()
            }, { onConflict: 'user_name,topic_id' })

        if (progressError) throw progressError
        await fetchGrammarData()
    }

    async function deleteGrammarProgress(userName, topicId) {
        const { error: e1 } = await supabase
            .from('grammar_tests')
            .delete()
            .eq('user_name', userName)
            .eq('topic_id', topicId)
        if (e1) throw e1

        const { error: e2 } = await supabase
            .from('grammar_progress')
            .delete()
            .eq('user_name', userName)
            .eq('topic_id', topicId)
        if (e2) throw e2

        await fetchGrammarData()
    }

    async function fetchVocabularyLogs() {
        loading.value = true
        const { data, error } = await supabase
            .from('vocabulary_logs')
            .select('*')
            .order('date', { ascending: false })
        if (!error) vocabularyLogs.value = data
        loading.value = false
    }

    async function logVocabulary(userName, date, wordsLearned, wordsReviewed, source, notes) {
        const { error } = await supabase
            .from('vocabulary_logs')
            .insert([{
                user_name: userName,
                date,
                words_learned: parseInt(wordsLearned),
                words_reviewed: parseInt(wordsReviewed),
                source,
                notes
            }])
        if (error) throw error
        await fetchVocabularyLogs()
    }

    async function fetchOralSessions() {
        loading.value = true
        const { data, error } = await supabase
            .from('oral_sessions')
            .select('*')
            .order('date', { ascending: false })
        if (!error) oralSessions.value = data
        loading.value = false
    }

    async function logOralSession(userName, date, duration, activityType, selfEvaluation, notes) {
        const { error } = await supabase
            .from('oral_sessions')
            .insert([{
                user_name: userName,
                date,
                duration: parseInt(duration),
                activity_type: activityType,
                self_evaluation: parseInt(selfEvaluation),
                notes
            }])
        if (error) throw error
        await fetchOralSessions()
    }

    async function updateOralSession(id, updates) {
        const { error } = await supabase
            .from('oral_sessions')
            .update(updates)
            .eq('id', id)
        if (error) throw error
        await fetchOralSessions()
    }

    async function deleteOralSession(id) {
        const { error } = await supabase
            .from('oral_sessions')
            .delete()
            .eq('id', id)
        if (error) throw error
        await fetchOralSessions()
    }

    async function fetchReadingData() {
        loading.value = true
        const { data: books, error: e1 } = await supabase.from('reading_books').select('*')
        const { data: logs, error: e2 } = await supabase.from('reading_logs').select('*').order('week_start', { ascending: false })

        if (!e1) readingBooks.value = books
        if (!e2) readingLogs.value = logs
        loading.value = false
    }

    async function updateReadingBook(userName, title, totalPages, startedAt) {
        const { error } = await supabase
            .from('reading_books')
            .upsert({
                user_name: userName,
                title,
                total_pages: parseInt(totalPages),
                started_at: startedAt
            }, { onConflict: 'user_name' })
        if (error) throw error
        await fetchReadingData()
    }

    async function logReadingWeek(userName, weekStart, pagesTranslated, notes) {
        const { error } = await supabase
            .from('reading_logs')
            .upsert({
                user_name: userName,
                week_start: weekStart,
                pages_translated: parseInt(pagesTranslated),
                notes
            }, { onConflict: 'user_name,week_start' })
        if (error) throw error
        await fetchReadingData()
    }

    return {
        grammarTopics, grammarProgress, grammarTests, vocabularyLogs, oralSessions, readingBooks, readingLogs, loading,
        fetchGrammarData, fetchGrammarTests, submitGrammarTest, deleteGrammarProgress, fetchVocabularyLogs, logVocabulary,
        fetchOralSessions, logOralSession, updateOralSession, deleteOralSession,
        fetchReadingData, updateReadingBook, logReadingWeek
    }
})