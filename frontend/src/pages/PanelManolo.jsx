import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Upload, BadgeCheck, Clock, Plus, Video, ArrowLeft } from 'lucide-react'
import { getAdminStats, getAdminToday } from '../lib/api'

export default function PanelManolo() {
  const [stats, setStats] = useState(null)
  const [today, setToday] = useState([])

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {})
    getAdminToday().then(setToday).catch(() => {})
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl lg:text-3xl font-black">Panel de Manolo</h1>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-coral-500/10 text-coral-600 mono">ADMIN</span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 lg:gap-3 text-center">
        <Stat value={stats?.students ?? '—'} label="alumnos" color="text-brand-600" />
        <Stat value={stats?.classesWeek ?? '—'} label="clases/sem" color="text-emerald-500" />
        <Stat value={stats?.materials ?? '—'} label="material" color="text-coral-500" />
      </div>

      <div className="mt-6">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Reservas de hoy</div>
        <div className="space-y-2">
          {today.map((b, i) =>
            b.status === 'free' ? (
              <div
                key={i}
                className="rounded-xl ring-1 ring-dashed ring-slate-200 p-3 flex items-center gap-3 text-slate-400"
              >
                <div className="mono text-[13px] font-bold">{b.time}</div>
                <div className="flex-1 text-[13px]">Libre</div>
                <Plus className="w-4 h-4" />
              </div>
            ) : (
              <div key={i} className="rounded-xl bg-white ring-1 ring-slate-100 p-3 flex items-center gap-3">
                <div className="mono text-[13px] font-bold text-brand-600">{b.time}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold">
                    {b.student} · {b.type}
                  </div>
                  {b.status === 'paid' ? (
                    <div className="text-[11px] text-emerald-600 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      Pagado
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pago pendiente
                    </div>
                  )}
                </div>
                <Video className="w-4 h-4 text-slate-300" />
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button className="flex-1 bg-white ring-1 ring-slate-200 text-slate-700 text-sm font-semibold rounded-xl py-3 flex items-center justify-center gap-2">
          <CalendarClock className="w-4 h-4" />
          Disponibilidad
        </button>
        <button className="flex-1 bg-brand-600 text-white text-sm font-semibold rounded-xl py-3 flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" />
          Subir material
        </button>
      </div>
    </div>
  )
}

function Stat({ value, label, color }) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-slate-100 py-3">
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  )
}
