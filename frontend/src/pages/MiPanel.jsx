import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Radio, Video, Calendar, Check, Clock } from 'lucide-react'
import { getBookings } from '../lib/api'
import { useAuth } from '../auth/AuthContext'

export default function MiPanel() {
  const { user: me } = useAuth()
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    getBookings().then(setBookings).catch(() => {})
  }, [])

  const upcoming = bookings.filter((b) => b.status !== 'completed')
  const past = bookings.filter((b) => b.status === 'completed')

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-black">Hola, {me?.name || '…'}</h1>
        {me?.level && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-brand-100 text-brand-700">
            Nivel {me.level}
          </span>
        )}
      </div>

      {/* Próxima clase */}
      <div className="mt-5 rounded-2xl p-5 bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-lg shadow-brand-600/30">
        <div className="text-[11px] font-semibold text-brand-200 flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5" />
          PRÓXIMA CLASE
        </div>
        <div className="mt-1 font-bold text-xl">Conversación con Manolo</div>
        <div className="mt-0.5 text-sm text-brand-100">Hoy · 17:00 · empieza en 2 h 14 min</div>
        <Link
          to="/aula/demo"
          className="mt-3 flex items-center justify-center gap-2 bg-white text-brand-700 text-sm font-bold rounded-xl py-3"
        >
          <Video className="w-4 h-4" />
          Entrar al aula
        </Link>
        <div className="mt-1.5 text-center text-[10px] text-brand-200 mono">sala Jitsi · sin instalar nada</div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2 lg:gap-3 text-center">
        <Stat value={`🔥${me?.streak ?? 0}`} label="días racha" color="text-coral-500" />
        <Stat value={me?.lessons_done ?? 0} label="lecciones" color="text-brand-600" />
        <Stat value={`${me?.hours ?? 0}h`} label="en vivo" color="text-emerald-500" />
      </div>

      {/* Reservas */}
      <div className="mt-6">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Mis reservas</div>
        <div className="space-y-2">
          {upcoming.map((c) => (
            <div key={c.id} className="rounded-xl bg-white ring-1 ring-slate-100 p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 grid place-items-center">
                <Calendar className="w-4 h-4 text-brand-600" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold">
                  {c.type} {c.level}
                </div>
                <div className="text-[11px] text-slate-400">{c.when}</div>
              </div>
              {c.payment === 'paid' ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Pagado
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pago pendiente
                </span>
              )}
            </div>
          ))}
          {past.map((c) => (
            <div
              key={c.id}
              className="rounded-xl bg-white ring-1 ring-slate-100 p-3 flex items-center gap-3 opacity-70"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 grid place-items-center">
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold">
                  {c.type} {c.level}
                </div>
                <div className="text-[11px] text-slate-400">{c.when}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label, color }) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-slate-100 py-3">
      <div className={`text-lg font-black ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  )
}
