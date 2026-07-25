import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, Video, BookOpen, X, Bell, ArrowRight, Check, Lock, GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { getHomework, getBookings, getLessons, getMyProgress } from '../lib/api'
import { localizeClassType } from '../i18n/labels'
import MaterialView from '../components/MaterialView'

// Cuando Manolo dé una foto suya, poner aquí su URL → el hero la usa.
const MANOLO_PHOTO = ''

const parseWhen = (b) => {
  if (!b?.date || !b?.time) return null
  const d = new Date(`${b.date}T${b.time}:00`)
  return isNaN(d.getTime()) ? null : d
}
const countdown = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), min: Math.floor((s % 3600) / 60), sec: s % 60 }
}
const pad = (n) => String(n).padStart(2, '0')

export default function Home() {
  const { t, i18n } = useTranslation()
  const { user: me } = useAuth()
  const [hw, setHw] = useState(null)
  const [showHw, setShowHw] = useState(false)
  const [bookings, setBookings] = useState([])
  const [lessons, setLessons] = useState([])
  const [doneIds, setDoneIds] = useState(new Set())
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    getHomework().then(setHw).catch(() => {})
    getBookings().then(setBookings).catch(() => {})
    getLessons().then(setLessons).catch(() => {})
    getMyProgress().then((p) => setDoneIds(new Set(p.completed))).catch(() => {})
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const next = useMemo(() => {
    const up = bookings.filter((b) => b.status === 'confirmed').map((b) => ({ b, when: parseWhen(b) }))
      .filter((x) => x.when && x.when > now).sort((a, z) => a.when - z.when)
    return up[0] || null
  }, [bookings, now])

  const path = useMemo(() => {
    let currentSet = false
    return lessons.slice(0, 4).map((l) => {
      const done = doneIds.has(l.id)
      let state = 'locked'
      if (done) state = 'done'
      else if (!currentSet) { state = 'current'; currentSet = true }
      return { ...l, state }
    })
  }, [lessons, doneIds])

  const cd = next ? countdown(next.when - now) : null
  const ct = (n) => localizeClassType(n, i18n.language)

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold text-brand-600">{t('home.greeting', { name: me?.name || '…' })}</p>
          <h1 className="mt-1 font-display text-3xl lg:text-[38px] font-bold tracking-tight leading-none">
            {t('home.titleLead')} <span className="text-brand-600">Manolo</span>
          </h1>
          <p className="mt-2 text-slate-500 text-sm">{t('home.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative w-9 h-9 rounded-full bg-white ring-1 ring-slate-200 grid place-items-center text-slate-500 shadow-soft">
            <Bell className="w-4 h-4" />{hw?.has && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-coral-500 ring-2 ring-white" />}
          </span>
          <Link to="/reservar" className="hidden sm:inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold rounded-xl px-4 py-2.5 shadow-lg shadow-brand-600/30">
            <CalendarPlus className="w-4 h-4" />{t('home.reservar')}
          </Link>
        </div>
      </div>

      {/* HERO próxima clase */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white shadow-lift">
        <div className="relative flex items-stretch">
          <div className="flex-1 p-5 lg:p-7 min-w-0">
            {next ? (
              <>
                <div className="text-[11px] font-bold tracking-wide text-brand-200 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-coral-400 animate-pulse" />{t('home.nextTagLive')}</div>
                <div className="font-display text-2xl lg:text-[26px] font-bold mt-2 leading-tight truncate">{ct(next.b.type)} · {t('home.withManolo')}</div>
                <div className="text-[13px] text-brand-100 mt-1">{next.b.level} · {next.b.when}</div>
                <div className="mt-4 flex gap-2">
                  {(cd.days > 0
                    ? [[cd.days, t('home.cdDays')], [cd.hours, t('home.cdHours')], [cd.min, t('home.cdMin')]]
                    : [[cd.hours, t('home.cdHours')], [cd.min, t('home.cdMin')], [cd.sec, t('home.cdSec')]]
                  ).map(([v, lbl], i) => (
                    <div key={i} className="rounded-xl bg-white/12 backdrop-blur px-3 py-2 text-center min-w-[3rem]">
                      <div className="font-mono text-xl font-bold">{pad(v)}</div><div className="text-[9px] text-brand-200">{lbl}</div>
                    </div>
                  ))}
                </div>
                <Link to={`/aula/${next.b.id}`} className="mt-5 inline-flex items-center gap-2 bg-white text-brand-700 text-[13px] font-bold rounded-xl px-5 py-2.5 shadow-lg">
                  <Video className="w-4 h-4" />{t('common.enterAula')}
                </Link>
              </>
            ) : (
              <>
                <div className="text-[11px] font-bold tracking-wide text-brand-200">{t('home.nextTag')}</div>
                <div className="font-display text-2xl lg:text-[26px] font-bold mt-2 leading-tight">{t('home.noClass')}</div>
                <div className="text-[13px] text-brand-100 mt-1">{t('home.noClassSub')}</div>
                <Link to="/reservar" className="mt-5 inline-flex items-center gap-2 bg-white text-brand-700 text-[13px] font-bold rounded-xl px-5 py-2.5 shadow-lg">
                  <CalendarPlus className="w-4 h-4" />{t('home.reservar')}
                </Link>
              </>
            )}
          </div>
          <div className="relative w-40 lg:w-52 shrink-0 hidden sm:block bg-gradient-to-br from-coral-400 to-brand-500">
            {MANOLO_PHOTO && <img src={MANOLO_PHOTO} alt="Manolo" className="absolute inset-0 w-full h-full object-cover" />}
            {!MANOLO_PHOTO && <div className="absolute inset-0 grid place-items-center"><div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur grid place-items-center text-4xl font-black">M</div></div>}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/45 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold"><GraduationCap className="w-3.5 h-3.5 text-coral-300" />Manolo · {t('role.teacher')}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <StatCard label={t('home.statStreak')} value={`🔥${me?.streak ?? 0}`} sub={t('home.statStreakSub')} color="text-coral-500"
          spark="0,20 12,16 24,18 36,10 48,12 60,4" stroke="#f43f5e" />
        <StatCard label={t('home.statLessons')} value={me?.lessons_done ?? 0} sub={t('home.statLessonsSub')} color="text-brand-600"
          spark="0,22 12,18 24,14 36,14 48,8 60,6" stroke="#6366f1" />
        <StatCard label={t('home.statLive')} value={`${me?.hours ?? 0}h`} sub={t('home.statLiveSub')} color="text-emerald-500" />
        <div className="rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 p-3.5 shadow-soft text-white">
          <div className="text-[10px] font-bold text-white/80 uppercase">{t('home.statLevel')}</div>
          <div className="text-xl font-black mt-1">{me?.level || 'A1'}</div>
          <div className="mt-1.5 h-1.5 rounded-full bg-white/30"><div className="h-full rounded-full bg-white" style={{ width: '40%' }} /></div>
        </div>
      </div>

      {/* Ruta de aprendizaje */}
      {path.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-100 p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12px] font-bold text-slate-700">{t('home.pathTitle')}</div>
            <Link to="/biblioteca" className="text-[11px] font-bold text-brand-600 flex items-center gap-1">{t('home.pathAll')}<ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="flex items-center gap-1">
            {path.map((l, i) => (
              <div key={l.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className={`w-8 h-8 rounded-full grid place-items-center text-[11px] font-bold ${
                    l.state === 'done' ? 'bg-emerald-500 text-white' : l.state === 'current' ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-white ring-1 ring-slate-200 text-slate-300'
                  }`}>
                    {l.state === 'done' ? <Check className="w-4 h-4" /> : l.state === 'locked' ? <Lock className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className={`text-[9px] max-w-[4.5rem] truncate ${l.state === 'current' ? 'text-brand-700 font-semibold' : 'text-slate-400'}`}>{l.title}</span>
                </div>
                {i < path.length - 1 && <span className={`flex-1 h-1 rounded-full mx-1 ${l.state === 'done' ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consejo + deberes */}
      <div className="grid sm:grid-cols-2 gap-3 mt-4">
        <div className="rounded-2xl bg-gold-100 ring-1 ring-gold-400/30 p-4 flex gap-3">
          <div className="text-2xl">💡</div>
          <div><div className="text-[12px] font-bold text-gold-600">{t('home.tipTitle')}</div>
            <div className="text-[12px] text-slate-700 mt-0.5 leading-snug">{t('home.tipBody')}</div></div>
        </div>
        {hw?.has ? (
          <button onClick={() => setShowHw(true)} className="rounded-2xl bg-white ring-1 ring-slate-100 p-4 shadow-soft flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-brand-50 grid place-items-center shrink-0"><BookOpen className="w-5 h-5 text-brand-600" /></div>
            <div className="flex-1 min-w-0"><div className="text-[10px] font-bold text-slate-400">{t('home.afterClass')}</div><div className="text-[13px] font-bold text-slate-800">{t('home.homework')}</div><div className="text-[11px] text-gold-600">{t('home.homeworkReady')}</div></div>
            <span className="text-brand-600 text-sm font-bold shrink-0">{t('home.see')}</span>
          </button>
        ) : (
          <Link to="/biblioteca" className="rounded-2xl bg-white ring-1 ring-slate-100 p-4 shadow-soft flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-50 grid place-items-center shrink-0"><BookOpen className="w-5 h-5 text-brand-600" /></div>
            <div className="flex-1"><div className="text-[13px] font-bold text-slate-800">{t('home.featLibTitle')}</div><div className="text-[11px] text-slate-400">{t('home.featLibSub')}</div></div>
            <ArrowRight className="w-4 h-4 text-slate-300" />
          </Link>
        )}
      </div>

      {showHw && hw?.has && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-end sm:place-items-center p-0 sm:p-6">
          <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="font-extrabold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-brand-600" /> {t('home.homeworkTitle')}</div>
              <button onClick={() => setShowHw(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <MaterialView material={hw.material} />
            <button onClick={() => setShowHw(false)} className="mt-4 w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3">{t('common.close')}</button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, color, spark, stroke }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-100 p-3.5 shadow-soft">
      <div className="text-[10px] font-bold text-slate-400 uppercase">{label}</div>
      <div className="flex items-end justify-between mt-1">
        <div className={`text-2xl font-black ${color}`}>{value}</div>
        {spark && <svg viewBox="0 0 60 24" className="w-14 h-6"><polyline points={spark} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" /></svg>}
      </div>
      <div className="text-[10px] text-slate-400">{sub}</div>
    </div>
  )
}
