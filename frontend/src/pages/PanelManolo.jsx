import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock, Upload, BadgeCheck, Clock, Plus, Video, ArrowLeft,
  UserPlus, X, KeyRound, BookOpen, Check, Lightbulb, ChevronRight, Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  getAdminStats, getAdminToday, getStudents, createStudent, getStudentProgress, finalizeClass,
  getPendingBookings, confirmBooking, rejectBooking,
} from '../lib/api'
import { localizeTypeLabel } from '../i18n/labels'
import MaterialView from '../components/MaterialView'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

export default function PanelManolo() {
  const { t, i18n } = useTranslation()
  const [stats, setStats] = useState(null)
  const [today, setToday] = useState([])
  const [students, setStudents] = useState([])
  const [pending, setPending] = useState([])
  const [busy, setBusy] = useState(null) // id de la reserva en curso
  const [modalOpen, setModalOpen] = useState(false)
  const [prep, setPrep] = useState(null) // { student, completed, count }

  const typeL = (s) => localizeTypeLabel(s, i18n.language)

  function openPrep(s) {
    setPrep({ student: { id: s.id, name: s.name, level: s.level }, completed: null, count: 0, loading: true })
    getStudentProgress(s.id)
      .then((p) => setPrep({ ...p, loading: false }))
      .catch(() => setPrep(null))
  }

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {})
    getAdminToday().then(setToday).catch(() => {})
    refreshPending()
    refreshStudents()
  }, [])

  function refreshStudents() {
    getStudents().then(setStudents).catch(() => {})
  }

  function refreshPending() {
    getPendingBookings().then(setPending).catch(() => {})
  }

  async function decide(id, action) {
    setBusy(id)
    try {
      await (action === 'confirm' ? confirmBooking(id) : rejectBooking(id))
      setPending((list) => list.filter((b) => b.id !== id))
      getAdminToday().then(setToday).catch(() => {})
    } catch {
      /* deja el item; el profe puede reintentar */
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="lg:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl lg:text-3xl font-black">{t('panel.title')}</h1>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-coral-500/10 text-coral-600 mono">ADMIN</span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 lg:gap-3 text-center">
        <Stat value={stats?.students ?? '—'} label={t('panel.statStudents')} color="text-brand-600" />
        <Stat value={stats?.classesWeek ?? '—'} label={t('panel.statClasses')} color="text-emerald-500" />
        <Stat value={stats?.materials ?? '—'} label={t('panel.statMaterial')} color="text-coral-500" />
      </div>

      {/* Reservas por confirmar */}
      {pending.length > 0 && (
        <div className="mt-6">
          <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {t('panel.pendingTitle')}
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{pending.length}</span>
          </div>
          <div className="space-y-2">
            {pending.map((b) => (
              <div key={b.id} className="rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3">
                <div className="flex items-center gap-3">
                  <div className="mono text-[13px] font-bold text-slate-500">{b.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold truncate">{b.student} · {typeL(b.type)}</div>
                    <div className="text-[11px] text-slate-400">{b.when}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={() => decide(b.id, 'confirm')}
                    disabled={busy === b.id}
                    className="flex-1 bg-emerald-600 text-white text-xs font-bold rounded-lg py-2 flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {busy === b.id ? '…' : t('panel.confirm')}
                  </button>
                  <button
                    onClick={() => decide(b.id, 'reject')}
                    disabled={busy === b.id}
                    className="flex-1 bg-white ring-1 ring-slate-300 text-slate-600 text-xs font-bold rounded-lg py-2 flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <X className="w-3.5 h-3.5" />
                    {t('panel.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reservas de hoy */}
      <div className="mt-6">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">{t('panel.todayTitle')}</div>
        <div className="space-y-2">
          {today.map((b, i) =>
            b.status === 'free' ? (
              <div
                key={i}
                className="rounded-xl ring-1 ring-dashed ring-slate-200 p-3 flex items-center gap-3 text-slate-400"
              >
                <div className="mono text-[13px] font-bold">{b.time}</div>
                <div className="flex-1 text-[13px]">{t('panel.free')}</div>
                <Plus className="w-4 h-4" />
              </div>
            ) : (
              <div key={i} className="rounded-xl bg-white ring-1 ring-slate-100 p-3 flex items-center gap-3">
                <div className="mono text-[13px] font-bold text-brand-600">{b.time}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold">
                    {b.student} · {typeL(b.type)}
                  </div>
                  {b.status === 'paid' ? (
                    <div className="text-[11px] text-emerald-600 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      {t('status.paid')}
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t('status.payPending')}
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
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('panel.studentsTitle')}</div>
          <button
            onClick={() => setModalOpen(true)}
            className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-brand-600 text-white flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {t('panel.newStudent')}
          </button>
        </div>
        <div className="space-y-2">
          {students.length === 0 && (
            <div className="rounded-xl ring-1 ring-dashed ring-slate-200 p-4 text-[13px] text-slate-400 text-center">
              {t('panel.noStudents')}
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
          {t('panel.availability')}
        </button>
        <button className="flex-1 bg-brand-600 text-white text-sm font-semibold rounded-xl py-3 flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" />
          {t('panel.upload')}
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
  const { t } = useTranslation()
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
      setError(t('panel.genError'))
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
              <div className="text-[11px] text-slate-400">{t('mipanel.level', { level: student.level || '—' })}</div>
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
                {loading ? '…' : t('panel.studiedLessons', { count })}
              </div>
            </div>

            <div className="mt-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">{t('panel.completedLessons')}</div>
              {loading ? (
                <div className="text-[13px] text-slate-400">{t('common.loading')}</div>
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
                <div className="text-[13px] text-slate-400">{t('panel.noCompleted')}</div>
              )}
            </div>

            <div className="mt-3 rounded-xl bg-amber-50 ring-1 ring-amber-100 p-3 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-[12px] text-amber-800">
                <b>{t('panel.recommendationLabel')}</b> {t('panel.recommendationBody')}
              </div>
            </div>

            <button
              onClick={() => setMode('finalize')}
              className="mt-4 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> {t('panel.finalize')}
            </button>
            <button onClick={onClose} className="mt-2 w-full text-slate-500 text-sm font-semibold py-2">
              {t('common.close')}
            </button>
          </>
        )}

        {mode === 'finalize' && (
          <>
            <div className="text-[13px] font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" /> {t('panel.finalize')}
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-3 mb-1">{t('panel.notesLabel')}</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder={t('panel.notesPlaceholder')}
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
              <Sparkles className="w-4 h-4" /> {generating ? t('panel.generating') : t('panel.generate')}
            </button>
            <div className="text-center text-[10px] text-slate-400 mt-1">
              {t('panel.genHint')}
            </div>
          </>
        )}

        {mode === 'material' && (
          <>
            <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 text-[13px] p-2.5 mb-3 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {t('panel.materialSent', { name: student.name })}
            </div>
            <MaterialView material={material} />
            <button onClick={onClose} className="mt-4 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3">
              {t('common.done')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function NuevoAlumnoModal({ onClose, onCreated }) {
  const { t } = useTranslation()
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
      setError(err.message?.includes('409') ? t('panel.errExists') : t('panel.errGeneric'))
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
            {t('panel.newStudent')}
          </div>
          <button onClick={onClose} className="text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {created ? (
          <div>
            <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-3 text-[13px] text-emerald-800">
              {t('panel.accountCreated', { name: created.student.name, level: created.student.level })}
            </div>
            <div className="mt-3 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                <KeyRound className="w-3.5 h-3.5" />
                {t('panel.tempPassword')}
              </div>
              <div className="mono text-lg font-bold text-slate-800 break-all">{created.temp_password}</div>
              <div className="text-[11px] text-amber-600 mt-1">
                {t('panel.savePassword')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('panel.loginWith', { email: created.student.email })}</div>
            </div>
            <button
              onClick={onClose}
              className="mt-4 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3"
            >
              {t('common.done')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">{t('panel.fName')}</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t('panel.fNamePlaceholder')}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">{t('panel.fEmail')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={t('panel.fEmailPlaceholder')}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">{t('panel.fLevel')}</label>
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
              {saving ? t('panel.creating') : t('panel.createAccount')}
            </button>
            <p className="text-center text-[11px] text-slate-400">{t('panel.autoPassword')}</p>
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
