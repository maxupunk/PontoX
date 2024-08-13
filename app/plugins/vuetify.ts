// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { pt } from 'vuetify/locale'

import { createVuetify } from 'vuetify'
import { VSnackbarQueue } from 'vuetify/labs/VSnackbarQueue'
import { VTimePicker } from 'vuetify/labs/VTimePicker'
import { VDateInput } from 'vuetify/labs/VDateInput'
import { VCalendar } from 'vuetify/labs/VCalendar'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components: {
      VSnackbarQueue,
      VTimePicker,
      VDateInput,
      VCalendar
    },
    locale: {
      locale: 'pt',
      fallback: 'pt',
      messages: { pt },
    },
  })
  app.vueApp.use(vuetify)
})