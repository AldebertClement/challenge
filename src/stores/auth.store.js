import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useAuthStore = defineStore('auth', () => {
    const session = ref(null)
    const selectedProfile = ref(localStorage.getItem('selectedProfile') || null)

    async function login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        session.value = data.session
    }

    async function logout() {
        await supabase.auth.signOut()
        session.value = null
        selectedProfile.value = null
        localStorage.removeItem('selectedProfile')
    }

    function selectProfile(profileName) {
        selectedProfile.value = profileName
        localStorage.setItem('selectedProfile', profileName)
    }

    async function initializeAuth() {
        const { data } = await supabase.auth.getSession()
        session.value = data.session

        supabase.auth.onAuthStateChange((_event, newSession) => {
            session.value = newSession
        })
    }

    return { session, selectedProfile, login, logout, selectProfile, initializeAuth }
})