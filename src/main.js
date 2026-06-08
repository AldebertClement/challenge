import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { medievalTheme } from './assets/theme/medieval.js'

// ApexCharts
import VueApexCharts from 'vue3-apexcharts'

// Global CSS
import './assets/main.css'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'medievalTheme',
        themes: { medievalTheme }
    }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(VueApexCharts)

app.mount('#app')