import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { updateLang } from '../lib/api'
import { useAuth } from '../auth/AuthContext'

// Selector ES ⇄ FR. Cambia el idioma al instante, lo cachea local y —si hay
// sesión— lo guarda en la cuenta (users.lang) para que siga al usuario.
export default function LangSwitch({ className = '' }) {
  const { i18n } = useTranslation()
  const { user } = useAuth()
  const cur = (i18n.language || 'es').startsWith('fr') ? 'fr' : 'es'

  const set = (l) => {
    if (l === cur) return
    i18n.changeLanguage(l)
    try { localStorage.setItem('af_lang', l) } catch { /* storage bloqueado */ }
    if (user) updateLang(l).catch(() => {})
  }

  return (
    <div className={`flex items-center gap-0.5 rounded-full bg-slate-100 ring-1 ring-slate-200 p-0.5 ${className}`}>
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1" />
      {['es', 'fr'].map((l) => (
        <button
          key={l}
          onClick={() => set(l)}
          aria-pressed={cur === l}
          className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
            cur === l ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
