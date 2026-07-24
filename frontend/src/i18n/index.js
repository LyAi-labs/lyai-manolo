import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './es'
import fr from './fr'

// Idioma inicial: cache local para arrancar instantáneo; luego AuthContext lo
// sincroniza con el idioma guardado en la cuenta (users.lang).
let stored = 'es'
try {
  const s = localStorage.getItem('af_lang')
  if (s === 'es' || s === 'fr') stored = s
} catch { /* SSR / storage bloqueado */ }

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, fr: { translation: fr } },
  lng: stored,
  fallbackLng: 'es',
  supportedLngs: ['es', 'fr'],
  interpolation: { escapeValue: false },
})

export default i18n
