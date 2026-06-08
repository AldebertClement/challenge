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
            { path: 'sport', name: 'Sport', component: () => import('@/views/sport/SportView.vue') },
            { path: 'english', name: 'English', component: () => import('@/views/english/EnglishView.vue') }
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