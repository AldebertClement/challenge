import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import MainLayout from '@/layouts/MainLayout.vue'

const routes = [
    { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue') },
    { path: '/select-profile', name: 'SelectProfile', component: () => import('@/views/ProfileSelectView.vue') },
    {
        path: '/',
        component: MainLayout,
        children: [
            { path: '', name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },

            // Sport Routes
            { path: 'sport', name: 'Sport', component: () => import('@/views/sport/SportView.vue') },
            { path: 'sport/exercises', name: 'Exercises', component: () => import('@/views/sport/ExercisesView.vue') },
            { path: 'sport/templates', name: 'Templates', component: () => import('@/views/sport/TemplatesView.vue') },
            { path: 'sport/history', name: 'WorkoutHistory', component: () => import('@/views/sport/WorkoutHistoryView.vue') },

            // English Routes
            { path: 'english', name: 'English', component: () => import('@/views/english/EnglishView.vue') },
            { path: 'english/grammar', name: 'Grammar', component: () => import('@/views/english/GrammarView.vue') },
            { path: 'english/vocabulary', name: 'Vocabulary', component: () => import('@/views/english/VocabularyView.vue') },
            { path: 'english/reading', name: 'Reading', component: () => import('@/views/english/ReadingView.vue') },
            { path: 'english/oral', name: 'Oral', component: () => import('@/views/english/OralView.vue') }
        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Wait for initial session load if necessary
    if (authStore.session === undefined) await authStore.initializeAuth()

    const isAuthenticated = !!authStore.session
    const hasProfileSelected = !!authStore.selectedProfile

    if (!isAuthenticated && to.name !== 'Login') {
        next({ name: 'Login' })
    } else if (isAuthenticated && !hasProfileSelected && to.name !== 'SelectProfile' && to.name !== 'Login') {
        next({ name: 'SelectProfile' })
    } else if (isAuthenticated && hasProfileSelected && (to.name === 'Login' || to.name === 'SelectProfile')) {
        next({ name: 'Dashboard' })
    } else {
        next()
    }
})

export default router