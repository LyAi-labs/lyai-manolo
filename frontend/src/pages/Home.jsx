import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, Video, Library, Award, TrendingUp, Radio } from 'lucide-react'
import { getMe } from '../lib/api'

export default function Home() {
  const [me, setMe] = useState(null)
  useEffect(() => {
    getMe().then(setMe).catch(() => {})
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-600">Bonjour, {me?.name || '…'} 👋</p>
          <h1 className="mt-1 text-3xl lg:text-4xl font-black tracking-tight">
            Aprende francés con <span className="text-brand-600">Manolo</span>
          </h1>
          <p className="mt-2 text-slate-500">Clases en vivo 1-a-1 y biblioteca a tu ritmo · A1–C1</p>
        </div>
        <Link
          to="/reservar"
          className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white text-sm font-semibold rounded-xl px-5 py-3 shadow-lg shadow-brand-600/30 shrink-0"
        >
          <CalendarPlus className="w-4 h-4" />
          Reservar clase
        </Link>
      </div>

      {/* Próxima clase */}
      <Link
        to="/aula/demo"
        className="mt-6 block rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 text-white p-5 lg:flex lg:items-center lg:justify-between"
      >
        <div>
          <div className="text-[11px] font-semibold text-brand-200 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            PRÓXIMA CLASE · HOY 17:00
          </div>
          <div className="mt-1 text-lg lg:text-xl font-bold">
            Conversación con Manolo · empieza en 2 h 14 min
          </div>
        </div>
        <span className="mt-3 lg:mt-0 inline-flex items-center gap-2 bg-white text-brand-700 text-sm font-bold rounded-xl px-5 py-2.5">
          <Video className="w-4 h-4" />
          Entrar al aula
        </span>
      </Link>

      {/* Niveles */}
      <div className="mt-6">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Tu nivel</div>
        <div className="mt-2 flex gap-1.5">
          {['A1', 'A2', 'B1', 'B2', 'C1'].map((l) => (
            <span
              key={l}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                l === me?.level ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Accesos */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Feature to="/reservar" icon={Video} title="Clases en vivo" sub="Aula Jitsi 1-a-1" primary />
        <Feature to="/biblioteca" icon={Library} title="Biblioteca" sub="Lecciones + ejercicios" />
        <Feature to="/biblioteca" icon={Award} title="Prep DELF" sub="Simulacros" />
        <Feature to="/panel" icon={TrendingUp} title="Progreso" sub="Racha y logros" />
      </div>
    </div>
  )
}

function Feature({ to, icon: Icon, title, sub, primary }) {
  return (
    <Link
      to={to}
      className={`rounded-2xl p-4 ${
        primary ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white' : 'bg-white ring-1 ring-slate-100'
      }`}
    >
      <Icon className={`w-5 h-5 ${primary ? 'text-white' : 'text-brand-600'}`} />
      <div className="mt-8 font-bold text-sm">{title}</div>
      <div className={`text-[11px] ${primary ? 'text-brand-200' : 'text-slate-500'}`}>{sub}</div>
    </Link>
  )
}
