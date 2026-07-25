import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock, Upload, Clock, Plus, Video, ArrowLeft, Coffee,
  UserPlus, X, KeyRound, BookOpen, Check, Lightbulb, ChevronRight, Sparkles, SlidersHorizontal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  getAdminStats, getAdminToday, getStudents, createStudent, getStudentProgress, finalizeClass,
  getPendingBookings, confirmBooking, rejectBooking, getStudentSkills, setStudentSkills,
} from '../lib/api'
import { localizeTypeLabel } from '../i18n/labels'
import MaterialView from '../components/MaterialView'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
// Habilidades que evalúa Manolo (mismos colores que el donut del Progreso).
const SKILLS = [
  { key: 'oral_comp', label: 'prog.skOralComp', color: '#6366f1' },
  { key: 'oral_exp', label: 'prog.skOralExp', color: '#34d399' },
  { key: 'written_comp', label: 'prog.skWrittenComp', color: '#fbbf24' },
  { key: 'written_exp', label: 'prog.skWrittenExp', color: '#38bdf8' },
]

export default function PanelManolo() {
  const { t, i18n } = useTranslation()
  const [stats, setStats] = useState(null)
  const [today, setToday] = useState([])
  const [students, setStudents] = useState([])
  const [pending, setPending] = useState([])
  const [busy, setBusy] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [prep, setPrep] = useState(null)

  const typeL = (s) => localizeTypeLabel(s, i18n.language)

  function openPrep(s) {
    setPrep({ student: { id: s.id, name: s.name, level: s.level }, completed: null, count: 0, loading: true })
    getStudentProgress(s.id).then((p) => setPrep({ ...p, loading: false })).catch(() => setPrep(null))
  }

  useEffect(() => {
    getAdminStats().then(setStats).catch(() => {})
    getAdminToday().then(setToday).catch(() => {})
    refreshPending()
    refreshStudents()
  }, [])

  function refreshStudents() { getStudents().then(setStudents).catch(() => {}) }
  function refreshPending() { getPendingBookings().then(setPending).catch(() => {}) }

  async function decide(id, action) {
    setBusy(id)
    try {
      await (action === 'confirm' ? confirmBooking(id) : rejectBooking(id))
      setPending((list) => list.filter((b) => b.id !== id))
      getAdminToday().then(setToday).catch(() => {})
    } catch { /* deja el item */ } finally { setBusy(null) }
  }

  const classes = today.filter((b) => b.status !== 'free')
  const nextToday = classes[0]

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 min-w-0">
          <Link to="/" className="lg:hidden mt-1"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-coral-600 flex items-center gap-1.5"><Coffee className="w-4 h-4" />{t('panel.greeting', { name: 'Manolo' })}</div>
            <h1 className="font-display text-2xl lg:text-[30px] font-bold leading-none mt-1">{t('panel.classesToday', { count: classes.length })}</h1>
          </div>
        </div>
        {nextToday && nextToday.id != null && (
          <Link to={`/aula/${nextToday.id}`} className="inline-flex items-center gap-2 bg-coral-600 text-white text-[13px] font-bold rounded-xl px-4 py-2.5 shadow-lg shadow-coral-600/30 shrink-0">
            <Video className="w-4 h-4" /><span className="hidden sm:inline">{t('panel.startClass', { time: nextToday.time })}</span><span className="sm:hidden">{nextToday.time}</span>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat value={stats?.students ?? '—'} label={t('panel.statStudents')} color="text-brand-600" />
        <Stat value={stats?.classesWeek ?? '—'} label={t('panel.statClasses')} color="text-emerald-500" />
        <Stat value={pending.length} label={t('panel.statPending')} color="text-gold-500" />
        <Stat value={stats?.materials ?? '—'} label={t('panel.statMaterial')} color="text-coral-500" />
      </div>

      {/* Agenda + reservas/insight */}
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 rounded-2xl bg-white ring-1 ring-slate-100 p-4 shadow-soft">
          <div className="text-[12px] font-bold text-slate-700 mb-3">{t('panel.agendaTitle')}</div>
          <div className="space-y-2.5">
            {today.length === 0 && <div className="text-[13px] text-slate-400">—</div>}
            {today.map((b, i) => b.status === 'free' ? (
              <div key={i} className="flex items-center gap-3">
                <div className="font-mono text-[12px] font-bold text-slate-400 w-12 shrink-0">{b.time}</div>
                <div className="flex-1 rounded-xl ring-1 ring-dashed ring-slate-200 p-2.5 text-[12px] text-slate-400 flex items-center gap-2"><Plus className="w-3.5 h-3.5" />{t('panel.free')}</div>
              </div>
            ) : (
              <div key={i} className="flex items-center gap-3">
                <div className="font-mono text-[12px] font-bold text-slate-400 w-12 shrink-0">{b.time}</div>
                <div className={`flex-1 rounded-xl p-2.5 flex items-center gap-2.5 ${i === 0 ? 'bg-brand-50 ring-1 ring-brand-100' : 'ring-1 ring-slate-100'}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xs font-bold shrink-0">{(b.student || '?').charAt(0)}</div>
                  <div className="flex-1 min-w-0"><div className="text-[13px] font-bold truncate">{b.student} · {typeL(b.type)}</div></div>
                  {b.id != null
                    ? <Link to={`/aula/${b.id}`} className="text-[11px] font-bold bg-brand-600 text-white px-2.5 py-1 rounded-lg shrink-0">{t('panel.enter')}</Link>
                    : <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {pending.length > 0 && (
            <div className="rounded-2xl bg-gold-100 ring-1 ring-gold-400/40 p-4">
              <div className="text-[11px] font-bold text-gold-600 flex items-center gap-1.5 mb-2"><Clock className="w-3.5 h-3.5" />{t('panel.pendingTitle')} ({pending.length})</div>
              <div className="space-y-2">
                {pending.map((b) => (
                  <div key={b.id} className="rounded-xl bg-white p-2.5">
                    <div className="text-[13px] font-bold text-slate-800 truncate">{b.student} · {b.when}</div>
                    <div className="text-[10px] text-slate-400 mb-2">{typeL(b.type)}</div>
                    <div className="flex gap-1.5">
                      <button onClick={() => decide(b.id, 'confirm')} disabled={busy === b.id} className="flex-1 text-center text-[11px] font-bold bg-emerald-600 text-white rounded-lg py-1.5 disabled:opacity-60">{busy === b.id ? '…' : t('panel.confirm')}</button>
                      <button onClick={() => decide(b.id, 'reject')} disabled={busy === b.id} className="flex-1 text-center text-[11px] font-bold ring-1 ring-slate-200 text-slate-500 rounded-lg py-1.5 disabled:opacity-60">{t('panel.reject')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-2xl bg-white ring-1 ring-slate-100 p-4 shadow-soft">
            <div className="text-[11px] font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5 text-gold-500" />{t('panel.insightTitle')}</div>
            <div className="text-[13px] text-slate-700 leading-snug">{t('panel.insightBody')}</div>
          </div>
        </div>
      </div>

      {/* Alumnos */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('panel.studentsTitle')}</div>
          <button onClick={() => setModalOpen(true)} className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-brand-600 text-white flex items-center gap-1.5"><UserPlus className="w-3.5 h-3.5" />{t('panel.newStudent')}</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {students.length === 0 && <div className="sm:col-span-2 rounded-xl ring-1 ring-dashed ring-slate-200 p-4 text-[13px] text-slate-400 text-center">{t('panel.noStudents')}</div>}
          {students.map((s) => (
            <button key={s.id} onClick={() => openPrep(s)} className="text-left rounded-xl bg-white ring-1 ring-slate-100 p-3 flex items-center gap-3 hover:ring-brand-200 shadow-soft">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xs font-bold shrink-0">{s.name.charAt(0)}</div>
              <div className="flex-1 min-w-0"><div className="text-[13px] font-bold truncate">{s.name}</div><div className="text-[11px] text-slate-400 truncate">{s.email}</div></div>
              {s.level && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 shrink-0">{s.level}</span>}
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-white ring-1 ring-slate-200 text-slate-700 text-sm font-semibold rounded-xl py-3 flex items-center justify-center gap-2"><CalendarClock className="w-4 h-4" />{t('panel.availability')}</button>
        <button className="flex-1 bg-brand-600 text-white text-sm font-semibold rounded-xl py-3 flex items-center justify-center gap-2"><Upload className="w-4 h-4" />{t('panel.upload')}</button>
      </div>

      {modalOpen && (
        <NuevoAlumnoModal onClose={() => setModalOpen(false)} onCreated={() => { refreshStudents(); getAdminStats().then(setStats).catch(() => {}) }} />
      )}
      {prep && <PrepModal prep={prep} onClose={() => setPrep(null)} />}
    </div>
  )
}

function PrepModal({ prep, onClose }) {
  const { t } = useTranslation()
  const { student, completed, count, loading } = prep
  const [mode, setMode] = useState('prep')
  const [tab, setTab] = useState('progress') // progress | eval
  const [skills, setSkills] = useState({ oral_comp: 50, oral_exp: 50, written_comp: 50, written_exp: 50 })
  const [savingSk, setSavingSk] = useState(false)
  const [savedSk, setSavedSk] = useState(false)
  const [notes, setNotes] = useState('')
  const [generating, setGenerating] = useState(false)
  const [material, setMaterial] = useState(null)
  const [error, setError] = useState('')

  // Precarga la evaluación actual (o 50 por defecto si aún sin evaluar).
  useEffect(() => {
    getStudentSkills(student.id)
      .then((s) => setSkills({
        oral_comp: s.oral_comp ?? 50, oral_exp: s.oral_exp ?? 50,
        written_comp: s.written_comp ?? 50, written_exp: s.written_exp ?? 50,
      }))
      .catch(() => {})
  }, [student.id])

  const general = Math.round((skills.oral_comp + skills.oral_exp + skills.written_comp + skills.written_exp) / 4)

  async function saveSkills() {
    setSavingSk(true); setSavedSk(false)
    try { await setStudentSkills(student.id, skills); setSavedSk(true); setTimeout(() => setSavedSk(false), 2500) }
    catch { /* deja el estado */ } finally { setSavingSk(false) }
  }

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
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white grid place-items-center text-xs font-bold">{student.name.charAt(0)}</div>
            <div>
              <div className="font-extrabold leading-tight">{student.name}</div>
              <div className="text-[11px] text-slate-400">{t('mipanel.level', { level: student.level || '—' })}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400"><X className="w-5 h-5" /></button>
        </div>

        {mode === 'prep' && (
          <>
            {/* Conmutador Progreso | Evaluar */}
            <div className="flex gap-1 p-1 rounded-xl bg-slate-100 mb-4 text-[12px] font-bold">
              <button onClick={() => setTab('progress')} className={`flex-1 text-center py-1.5 rounded-lg ${tab === 'progress' ? 'bg-white text-brand-600 shadow-soft' : 'text-slate-500'}`}>{t('panel.skills.tabProgress')}</button>
              <button onClick={() => setTab('eval')} className={`flex-1 text-center py-1.5 rounded-lg ${tab === 'eval' ? 'bg-white text-coral-600 shadow-soft' : 'text-slate-500'}`}>{t('panel.skills.tabEval')}</button>
            </div>

            {tab === 'progress' ? (
              <>
                <div className="rounded-xl bg-brand-50 ring-1 ring-brand-100 p-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  <div className="text-[13px] text-brand-800">{loading ? '…' : t('panel.studiedLessons', { count })}</div>
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
                  <div className="text-[12px] text-amber-800"><b>{t('panel.recommendationLabel')}</b> {t('panel.recommendationBody')}</div>
                </div>
                <button onClick={() => setMode('finalize')} className="mt-4 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> {t('panel.finalize')}
                </button>
                <button onClick={onClose} className="mt-2 w-full text-slate-500 text-sm font-semibold py-2">{t('common.close')}</button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800"><SlidersHorizontal className="w-4 h-4 text-coral-500" /> {t('panel.skills.evalTitle')}</div>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-4">{t('panel.skills.evalNote')}</p>
                <div className="space-y-4">
                  {SKILLS.map((sk) => (
                    <div key={sk.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-2 text-[12.5px] text-slate-600 font-medium"><span className="w-2.5 h-2.5 rounded-full" style={{ background: sk.color }} /> {t(sk.label)}</span>
                        <span className="text-[12px] font-bold text-slate-800 tabular-nums">{skills[sk.key]}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" value={skills[sk.key]}
                        onChange={(e) => setSkills((s) => ({ ...s, [sk.key]: Number(e.target.value) }))}
                        style={{ accentColor: sk.color }}
                        className="w-full h-2 cursor-pointer"
                        aria-label={t(sk.label)}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
                  <div className="text-[12px] font-semibold text-slate-500">{t('panel.skills.general')}</div>
                  <div className="text-[20px] font-black text-slate-800">{general}%</div>
                </div>
                <button onClick={saveSkills} disabled={savingSk} className="mt-4 w-full bg-coral-600 hover:bg-coral-700 text-white text-sm font-bold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                  {savedSk ? <><Check className="w-4 h-4" /> {t('panel.skills.saved')}</> : <><Check className="w-4 h-4" /> {savingSk ? t('panel.skills.saving') : t('panel.skills.save')}</>}
                </button>
                <button onClick={onClose} className="mt-2 w-full text-slate-500 text-sm font-semibold py-2">{t('common.close')}</button>
              </>
            )}
          </>
        )}

        {mode === 'finalize' && (
          <>
            <div className="text-[13px] font-bold flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-brand-600" /> {t('panel.finalize')}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-3 mb-1">{t('panel.notesLabel')}</div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} placeholder={t('panel.notesPlaceholder')}
              className="w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500" />
            {error && <div className="mt-2 rounded-xl bg-coral-50 ring-1 ring-coral-200 text-coral-600 text-[13px] px-3 py-2">{error}</div>}
            <button onClick={generar} disabled={generating || !notes.trim()} className="mt-3 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3 disabled:opacity-60 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> {generating ? t('panel.generating') : t('panel.generate')}
            </button>
            <div className="text-center text-[10px] text-slate-400 mt-1">{t('panel.genHint')}</div>
          </>
        )}

        {mode === 'material' && (
          <>
            <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 text-[13px] p-2.5 mb-3 font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {t('panel.materialSent', { name: student.name })}
            </div>
            <MaterialView material={material} />
            <button onClick={onClose} className="mt-4 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3">{t('common.done')}</button>
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
  const [created, setCreated] = useState(null)

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
          <div className="font-extrabold text-lg flex items-center gap-2"><UserPlus className="w-5 h-5 text-brand-600" />{t('panel.newStudent')}</div>
          <button onClick={onClose} className="text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        {created ? (
          <div>
            <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-3 text-[13px] text-emerald-800">{t('panel.accountCreated', { name: created.student.name, level: created.student.level })}</div>
            <div className="mt-3 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1"><KeyRound className="w-3.5 h-3.5" />{t('panel.tempPassword')}</div>
              <div className="mono text-lg font-bold text-slate-800 break-all">{created.temp_password}</div>
              <div className="text-[11px] text-amber-600 mt-1">{t('panel.savePassword')}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t('panel.loginWith', { email: created.student.email })}</div>
            </div>
            <button onClick={onClose} className="mt-4 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3">{t('common.done')}</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">{t('panel.fName')}</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder={t('panel.fNamePlaceholder')} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">{t('panel.fEmail')}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500" placeholder={t('panel.fEmailPlaceholder')} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">{t('panel.fLevel')}</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1 w-full rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500">
                {LEVELS.map((l) => (<option key={l} value={l}>{l}</option>))}
              </select>
            </div>
            {error && <div className="rounded-xl bg-coral-50 ring-1 ring-coral-200 text-coral-600 text-[13px] px-3 py-2">{error}</div>}
            <button disabled={saving} className="w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3 disabled:opacity-60">{saving ? t('panel.creating') : t('panel.createAccount')}</button>
            <p className="text-center text-[11px] text-slate-400">{t('panel.autoPassword')}</p>
          </form>
        )}
      </div>
    </div>
  )
}

function Stat({ value, label, color }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-100 p-3.5 shadow-soft">
      <div className="text-[10px] font-bold text-slate-400 uppercase">{label}</div>
      <div className={`text-2xl font-black ${color} mt-1`}>{value}</div>
    </div>
  )
}
