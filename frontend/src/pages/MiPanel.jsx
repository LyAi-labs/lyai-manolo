import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Pencil, Calendar, Trophy, Clock, BookOpen, CheckCircle2, TrendingUp, Video, Check, Play,
  ChevronRight, GitBranch, MessageSquareQuote, BookMarked, Mic, Star, X,
} from 'lucide-react'
import { getProgressFull } from '../lib/api'
import { useAuth } from '../auth/AuthContext'
import { localizeClassType } from '../i18n/labels'
import { isManolo, TEACHER_AVATAR } from '../lib/brand'
import LangSwitch from '../components/LangSwitch'

export default function MiPanel() {
  const { t, i18n } = useTranslation()
  const { user: me } = useAuth()
  const [d, setD] = useState(null)
  const [edit, setEdit] = useState(false)

  useEffect(() => { getProgressFull().then(setD).catch(() => {}) }, [])

  const loc = i18n.language && i18n.language.startsWith('fr') ? 'fr-FR' : 'es-ES'
  const ct = (n) => localizeClassType(n, i18n.language)
  const manolo = isManolo(me)
  const initial = me?.name?.charAt(0) || 'A'
  const firstName = (me?.name || '').split(' ')[0] || '—'

  const fmtHM = (min) => {
    const h = Math.floor((min || 0) / 60), m = (min || 0) % 60
    return h > 0 ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`
  }
  const fmtMonth = (iso) => {
    if (!iso) return '—'
    const dt = new Date(iso)
    if (isNaN(dt)) return '—'
    const s = new Intl.DateTimeFormat(loc, { month: 'short', year: 'numeric' }).format(dt)
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  const fmtWhen = (ts) => {
    const dt = new Date(ts), now = new Date()
    const day = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
    const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diff = Math.round((t0 - day) / 86400000)
    return diff === 0 ? t('prog.today') : diff === 1 ? t('prog.yesterday')
      : new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short' }).format(dt)
  }

  if (!d) return <div className="max-w-5xl mx-auto px-5 py-20 text-center text-slate-400">{t('common.loading')}</div>
  const s = d.stats
  const units = (d.units || []).slice(0, 5)
  const weekPct = s.week_goal_min ? Math.min(100, Math.round((s.week_done_min / s.week_goal_min) * 100)) : 0

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="font-display text-2xl lg:text-[30px] font-bold text-slate-900 leading-none">{t('mipanel.title')}</h1><p className="text-slate-500 text-sm mt-2">{t('mipanel.subtitle')}</p></div>
        <button onClick={() => setEdit(true)} className="px-4 h-10 rounded-xl ring-1 ring-slate-200 text-slate-600 font-semibold text-[13px] flex items-center gap-2 bg-white hover:bg-slate-50"><Pencil className="w-4 h-4" /> {t('mipanel.editProfile')}</button>
      </div>

      {/* identidad + metas */}
      <div className="mt-5 rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5 flex flex-col lg:flex-row lg:items-center gap-5">
        <div className="flex items-center gap-4 lg:w-[290px] shrink-0">
          {manolo
            ? <img src={TEACHER_AVATAR} alt={firstName} className="w-16 h-16 rounded-full object-cover ring-2 ring-white shadow-soft" />
            : <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white text-2xl font-black ring-2 ring-white shadow-soft">{initial}</div>}
          <div>
            <div className="font-display text-xl font-bold text-slate-900">{firstName} 👋</div>
            <div className="text-[12px] text-slate-400">{me?.email}</div>
            <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">{s.level} · {t('mipanel.levelPath', { next: s.level_next })}</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 lg:border-l lg:border-slate-100 lg:pl-5">
          <Meta icon={Calendar} label={t('mipanel.memberSince')} value={fmtMonth(s.member_since)} />
          <Meta icon={Trophy} label={t('mipanel.goalCurrent')} value={`${s.level_next} · ${t('mipanel.goalBasic')}`} />
          <div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {t('mipanel.goalWeekly')}</div>
            <div className="text-[15px] font-bold text-slate-800 mt-1 flex items-center gap-2">{fmtHM(s.week_done_min)} / {fmtHM(s.week_goal_min)}
              <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${weekPct}%` }} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        {/* resumen */}
        <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
          <div className="flex items-center justify-between mb-3"><div className="text-[15px] font-bold text-slate-800">{t('mipanel.summary')}</div><span className="px-2.5 py-1 rounded-lg ring-1 ring-slate-200 text-slate-500 text-[12px] font-semibold">{t('prog.range30')}</span></div>
          <div className="grid grid-cols-2 gap-3">
            <MiniStat icon={Clock} tile="bg-brand-50 text-brand-600" label={t('mipanel.stTime')} value={fmtHM(s.study_min)} />
            <MiniStat icon={BookOpen} tile="bg-emerald-50 text-emerald-600" label={t('mipanel.stClasses')} value={s.classes_done} />
            <MiniStat icon={CheckCircle2} tile="bg-gold-100 text-gold-600" label={t('mipanel.stLessons')} value={s.lessons_done} />
            <MiniStat icon={TrendingUp} tile="bg-coral-50 text-coral-600" label={t('mipanel.stLevel')} value={s.level} />
          </div>
        </div>
        {/* actividad */}
        <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
          <div className="flex items-center justify-between mb-3"><div className="text-[15px] font-bold text-slate-800">{t('prog.activityTitle')}</div><Link to="/progreso" className="text-[12px] font-semibold text-brand-600">{t('prog.activityAll')} →</Link></div>
          {d.activity.length ? (
            <div className="space-y-2.5">
              {d.activity.slice(0, 4).map((a, i) => {
                const isC = a.kind === 'class'
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${isC ? 'bg-brand-50 text-brand-600' : 'bg-emerald-50 text-emerald-600'}`}>{isC ? <Video className="w-4 h-4" /> : <Check className="w-4 h-4" />}</div>
                    <div className="flex-1 min-w-0"><div className="text-[13px] font-bold text-slate-800 truncate">{isC ? t('prog.actClass') : t('prog.actLesson')}</div><div className="text-[11.5px] text-slate-500 truncate">{isC ? ct(a.title) : a.title}</div></div>
                    <div className="text-right shrink-0"><div className="text-[11px] font-semibold text-slate-500">{fmtWhen(a.ts)}</div><div className="text-[11px] text-slate-400">{a.minutes} min</div></div>
                  </div>
                )
              })}
            </div>
          ) : <div className="h-32 grid place-items-center text-center text-[13px] text-slate-400">{t('prog.activityEmpty')}</div>}
        </div>
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        {/* unidades */}
        <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
          <div className="flex items-center justify-between mb-3"><div className="text-[15px] font-bold text-slate-800">{t('prog.unitsTitle')} <span className="text-brand-400 text-[12px]">{s.level}</span></div><Link to="/biblioteca" className="text-[12px] font-semibold text-brand-600">{t('mipanel.unitsAll')} →</Link></div>
          <div className="space-y-3">
            {units.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${u.done ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>{u.done ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4" />}</div>
                <div className="min-w-0 w-40"><div className="text-[13px] font-bold text-slate-800 truncate">{u.title}</div></div>
                <div className="flex-1 flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-brand-500" style={{ width: `${u.pct}%` }} /></div><span className="text-[12px] font-bold text-slate-700 w-9 text-right">{u.pct}%</span></div>
                <div className="hidden sm:block w-16 text-right text-[11px] font-semibold text-emerald-600">{u.done ? `✓ ${t('mipanel.unitDone')}` : ''}</div>
              </div>
            ))}
          </div>
        </div>
        {/* recursos */}
        <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
          <div className="flex items-center justify-between mb-3"><div className="text-[15px] font-bold text-slate-800">{t('mipanel.resources')}</div><Link to="/biblioteca" className="text-[12px] font-semibold text-brand-600">{t('mipanel.resAll')} →</Link></div>
          <div className="space-y-1">
            <Res icon={GitBranch} tile="bg-brand-50 text-brand-600" title={t('mipanel.res1t')} sub={t('mipanel.res1s')} />
            <Res icon={MessageSquareQuote} tile="bg-coral-50 text-coral-600" title={t('mipanel.res2t')} sub={t('mipanel.res2s')} />
            <Res icon={BookMarked} tile="bg-gold-100 text-gold-600" title={t('mipanel.res3t')} sub={t('mipanel.res3s')} />
            <Res icon={Mic} tile="bg-emerald-50 text-emerald-600" title={t('mipanel.res4t')} sub={t('mipanel.res4s')} />
          </div>
        </div>
      </div>

      {/* consejo */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/60 ring-1 ring-brand-100 p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-white text-brand-600 grid place-items-center shrink-0 shadow-soft"><Star className="w-5 h-5" /></div>
        <div className="flex-1"><div className="text-[13px] font-bold text-brand-700">{t('home.tipTitle')} 💡</div><p className="text-[13px] text-slate-700 mt-0.5">{t('mipanel.tipBody')}</p></div>
        <div className="text-4xl shrink-0">🥐</div>
      </div>

      {/* Editar perfil */}
      {edit && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center p-0 sm:p-6" onClick={() => setEdit(false)}>
          <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><div className="font-extrabold text-lg flex items-center gap-2"><Pencil className="w-5 h-5 text-brand-600" /> {t('mipanel.editProfile')}</div><button onClick={() => setEdit(false)} className="text-slate-400"><X className="w-5 h-5" /></button></div>
            <div className="flex items-center justify-between mb-3"><span className="text-[13px] font-semibold text-slate-600">{t('mipanel.editLang')}</span><LangSwitch /></div>
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3 space-y-1.5 text-[13px]">
              <Row2 k={t('mipanel.editName')} v={me?.name} /><Row2 k={t('mipanel.editEmail')} v={me?.email} /><Row2 k={t('mipanel.editLevel')} v={me?.level} />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">{t('mipanel.editNote')}</p>
            <button onClick={() => setEdit(false)} className="mt-4 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3">{t('common.close')}</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Meta({ icon: Icon, label, value }) {
  return <div><div className="text-[11px] text-slate-400 flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" /> {label}</div><div className="text-[15px] font-bold text-slate-800 mt-1">{value}</div></div>
}
function MiniStat({ icon: Icon, tile, label, value }) {
  return <div className="rounded-xl ring-1 ring-slate-100 p-3.5"><div className={`w-9 h-9 rounded-lg grid place-items-center ${tile}`}><Icon className="w-4 h-4" /></div><div className="text-[11px] text-slate-500 mt-2">{label}</div><div className="text-[20px] font-black text-slate-900">{value}</div></div>
}
function Res({ icon: Icon, tile, title, sub }) {
  return <Link to="/biblioteca" className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50"><div className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${tile}`}><Icon className="w-4 h-4" /></div><div className="flex-1 min-w-0"><div className="text-[13px] font-bold text-slate-800 truncate">{title}</div><div className="text-[11px] text-slate-400 truncate">{sub}</div></div><ChevronRight className="w-4 h-4 text-slate-300" /></Link>
}
function Row2({ k, v }) {
  return <div className="flex items-center justify-between"><span className="text-slate-400">{k}</span><span className="font-semibold text-slate-700">{v || '—'}</span></div>
}
