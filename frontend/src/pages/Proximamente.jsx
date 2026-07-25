import { useTranslation } from 'react-i18next'
import { Radio, Award, Sparkles } from 'lucide-react'

// Página puente para secciones del sidebar aún sin diseñar (Clases en vivo,
// Prep DELF). No es un enlace muerto: explica qué llegará. Se sustituye por la
// pantalla real cuando Ignacio comparta su diseño.
const ICONS = { radio: Radio, award: Award }

export default function Proximamente({ icon = 'radio', tKey }) {
  const { t } = useTranslation()
  const Icon = ICONS[icon] || Sparkles
  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-10 py-16 lg:py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center mx-auto shadow-lift">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="inline-flex items-center gap-1.5 mt-5 px-3 py-1 rounded-full bg-gold-100 text-gold-600 text-[11px] font-bold">
        <Sparkles className="w-3.5 h-3.5" /> {t('soon.badge')}
      </div>
      <h1 className="font-display text-2xl lg:text-3xl font-bold text-slate-900 mt-3">{t(`${tKey}.title`)}</h1>
      <p className="text-slate-500 mt-2 leading-relaxed">{t(`${tKey}.body`)}</p>
    </div>
  )
}
