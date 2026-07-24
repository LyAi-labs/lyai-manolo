import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock, Upload, BadgeCheck, Clock, Plus, Video, ArrowLeft,
  UserPlus, X, KeyRound, BookOpen, Check, Lightbulb, ChevronRight, Sparkles,
} from 'lucide-react'
import {
  getAdminStats, getAdminToday, getStudents, createStudent, getStudentProgress, finalizeClass,
} from '../lib/api'
import MaterialView from '../components/MaterialView'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function PanelManolo() {
  const [stats, setStats] = useState(null)
  const [today, setToday] = useState([])
  const [students, setStudents] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [prep, setPrep] = useState(null) // { student, completed, count }

  function openPrep(s) {
    setPrep({ student: { id: s.id, name: s.name, level: s.level }, completed: null, count: 0, loading: true })
    getStudentProgress(s.id)
      .then((p) => setPrep({ ...p, loading: false }))
      .catch(() => setPrep(null))
  }

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
            <button
              key={s.id}
              onClick={() => openPrep(s)}
              className="w-full text-left rounded-xl bg-white ring-1 ring-slate-100 p-3 flex items-center gap-3 hover:ring-brand-200"
            >
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
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
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

      {prep && <PrepModal prep={prep} onClose={() => setPrep(null)} />}
    </div>
  )
}

function PrepModal({ prep, onClose }) {
  const { student, completed, count, loading } = prep
  const [mode, setMode] = useState('prep') // prep | finalize | material
  const [notes, setNotes] = useState('')
  const [generating, setGenerating] = useState(false)
  const [material, setMaterial] = useState(null)
  const [error, setError] = useState('')

  async function generar() {
    setError('')
    setGenerating(true)
    try {
      const res = await finalizeClass({ student_id: student.id, notes: notes.trim() })
      setMaterial(res.material)
      setMode('material')
    } catch (e) {
      setError('La IA no pudo generar el material. Reinténtalo.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center p-0 sm:p-6">
      <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white grid place-items-center text-xs font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="font-extrabold leading-tight">{student.name}</div>
              <div className="text-[11px] text-slate-400">Nivel {student.level || '—'}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'prep' && (
          <>
            <div className="rounded-xl bg-brand-50 ring-1 ring-brand-100 p-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-600" />
              <div className="text-[13px] text-brand-800">
                Ha estudiado <b>{loading ? '…' : count}</b> {count === 1 ? 'lección' : 'lecciones'} en la biblioteca
              </div>
            </div>

            <div className="mt-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Lecciones completadas</div>
              {loading ? (
                <div className="text-[13px] text-slate-400">Cargando…</div>
              ) : completed && completed.length ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {completed.map((l) => (
                    <div key={l.id} className="flex items-center gap-2 text-[13px]">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium">{l.title}</span>
                      <span className="text-[10px] text-slate-400">{l.level}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[13px] text-slate-400">Aún no ha completado ninguna lección.</div>
              )}
            </div>

            <div className="mt-3 rounded-xl bg-amber-50 ring-1 ring-amber-100 p-3 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[12px] text-amber-800">
                <b>Recomendación:</b> empieza repasando lo que ha estudiado y refuerza la pronunciación.
              </div>
            </div>

            <button
              onClick={() => setMode('finalize')}
              className="mt-4 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Finalizar clase
            </button>
            <button onClick={onClose} className="mt-2 w-full text-slate-500 text-sm font-semibold py-2">
              Cerrar
            </button>
          </>
        )}

        {mode === 'finalize' && (
          <>
            <div className="text-[13px] font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" /> Finalizar clase
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-3 mb-1">NOTAS DE HOY (unas líneas)</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Hoy: saludos, verbo être (je suis / tu es)… Necesita practicar preguntas."
              className="w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
            {error && (
              <div className="mt-2 rounded-xl bg-coral-50 ring-1 ring-coral-200 text-coral-600 text-[13px] px-3 py-2">
                {error}
              </div>
            )}
            <button
              onClick={generar}
              disabled={generating || !notes.trim()}
              className="mt-3 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> {generating ? 'Generando…' : 'Generar material (IA)'}
            </button>
            <div className="text-center text-[10px] text-slate-400 mt-1">
              La IA prepara resumen, ejercicios, flashcards y deberes
            </div>
          </>
        )}

        {mode === 'material' && (
          <>
            <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 text-[13px] p-2.5 mb-3 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Material generado y enviado a {student.name}
            </div>
            <MaterialView material={material} />
            <button onClick={onClose} className="mt-4 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3">
              Hecho
            </button>
          </>
        )}
      </div>
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
