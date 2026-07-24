import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock, Upload, BadgeCheck, Clock, Plus, Video, ArrowLeft,
  UserPlus, X, KeyRound,
} from 'lucide-react'
import { getAdminStats, getAdminToday, getStudents, createStudent } from '../lib/api'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function PanelManolo() {
  const [stats, setStats] = useState(null)
  const [today, setToday] = useState([])
  const [students, setStudents] = useState([])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {})
    getAdminToday().then(setToday).catch(() => {})
    refreshStudents()
  }, [])

  function refreshStudents() {
    getStudents().then(setStudents).catch(() => {})
  }

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

      {/* Reservas de hoy */}
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

      {/* Alumnos */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Alumnos</div>
          <button
            onClick={() => setModalOpen(true)}
            className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-brand-600 text-white flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Nuevo alumno
          </button>
        </div>
        <div className="space-y-2">
          {students.length === 0 && (
            <div className="rounded-xl ring-1 ring-dashed ring-slate-200 p-4 text-[13px] text-slate-400 text-center">
              Todavía no hay alumnos. Crea el primero con «Nuevo alumno».
            </div>
          )}
          {students.map((s) => (
            <div key={s.id} className="rounded-xl bg-white ring-1 ring-slate-100 p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-600 text-white grid place-items-center text-xs font-bold">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold truncate">{s.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{s.email}</div>
              </div>
              {s.level && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">{s.level}</span>
              )}
            </div>
          ))}
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

      {modalOpen && (
        <NuevoAlumnoModal
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            refreshStudents()
            getAdminStats().then(setStats).catch(() => {})
          }}
        />
      )}
    </div>
  )
}

function NuevoAlumnoModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [level, setLevel] = useState('A1')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null) // { student, temp_password }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await createStudent({ name: name.trim(), email: email.trim(), level })
      setCreated(res)
      onCreated()
    } catch (err) {
      setError(err.message?.includes('409') ? 'Ya existe una cuenta con ese email' : 'No se pudo crear la cuenta')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center p-0 sm:p-6">
      <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="font-extrabold text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brand-600" />
            Nuevo alumno
          </div>
          <button onClick={onClose} className="text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {created ? (
          <div>
            <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-3 text-[13px] text-emerald-800">
              ✓ Cuenta creada para <b>{created.student.name}</b> ({created.student.level}).
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                CONTRASEÑA TEMPORAL
              </div>
              <div className="mono text-lg font-bold text-slate-800 break-all">{created.temp_password}</div>
              <div className="text-[11px] text-amber-600 mt-1">
                Guárdala y dásela al alumno — no se vuelve a mostrar.
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Entra con: {created.student.email}</div>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3"
            >
              Hecho
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Nombre</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Sofía"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="sofia@correo.com"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">Nivel</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1 w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="rounded-xl bg-coral-50 ring-1 ring-coral-200 text-coral-600 text-[13px] px-3 py-2">
                {error}
              </div>
            )}

            <button
              disabled={saving}
              className="w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3 disabled:opacity-60"
            >
              {saving ? 'Creando…' : 'Crear cuenta'}
            </button>
            <p className="text-center text-[11px] text-slate-400">Se genera una contraseña temporal automática.</p>
          </form>
        )}
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
