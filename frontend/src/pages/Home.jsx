import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarPlus, Video, BookOpen, X, Bell, ArrowRight, Radio, Library, Award, TrendingUp, Quote,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { getHomework, getBookings, getLessons, getMyProgress } from '../lib/api'
import { localizeClassType } from '../i18n/labels'
import { TEACHER_PHOTO } from '../lib/brand'
import MaterialView from '../components/MaterialView'

const LEVEL_NEXT = { A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C1' }
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

const parseWhen = (b) => {
  if (!b?.date || !b?.time) return null
  const d = new Date(`${b.date}T${b.time}:00`)
  return isNaN(d.getTime()) ? null : d
}

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

  const loc = i18n.language && i18n.language.startsWith('fr') ? 'fr-FR' : 'es-ES'
  const ct = (n) => localizeClassType(n, i18n.language)

  const next = useMemo(() => {
    const up = bookings.filter((b) => b.status === 'confirmed').map((b) => ({ b, when: parseWhen(b) }))
      .filter((x) => x.when && x.when > now).sort((a, z) => a.when - z.when)
    return up[0] || null
  }, [bookings, now])

  // Lección "actual" (primera sin completar) para la tarjeta de Biblioteca.
  const current = useMemo(() => {
    const idx = lessons.findIndex((l) => !doneIds.has(l.id))
    const i = idx === -1 ? lessons.length - 1 : idx
    const l = lessons[i]
    return l ? { n: i + 1, title: l.title, pct: doneIds.has(l.id) ? 100 : (l.progress || 0) } : null
  }, [lessons, doneIds])

  // Etiqueta de fecha: "HOY 17:00" o "MIÉ 21 · 10:00".
  const whenLabel = (d) => {
    if (!d) return ''
    const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const time = d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
    if (dd.getTime() === t0.getTime()) return `${t('home.todayUpper')} ${time}`
    const wd = new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(d).replace('.', '').toUpperCase()
    return `${wd} ${d.getDate()} · ${time}`
  }
  // Cuenta atrás → {prefix, body}: "empieza en" + "2 h 14 min" (body en coral).
  const cdText = (d) => {
    const s = Math.max(0, Math.floor((d - now) / 1000))
    const days = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
    if (s < 60) return { prefix: '', body: t('home.cdNow') }
    const body = days > 0 ? `${days} ${t('home.uDay')} ${h} ${t('home.uHour')}` : `${h} ${t('home.uHour')} ${m} ${t('home.uMin')}`
    return { prefix: t('home.startsIn'), body }
  }

  const streak = me?.streak ?? 0
  const level = me?.level || 'A1'

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[15px] font-bold text-brand-600">{t('home.greeting', { name: me?.name?.split(' ')[0] || '…' })}</p>
          <h1 className="mt-1 font-display text-3xl lg:text-[34px] font-bold tracking-tight leading-none">
            {t('home.titleLead')} <span className="text-brand-600">Manolo</span>
          </h1>
          <p className="mt-2 text-slate-500 text-sm">{t('home.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => hw?.has && setShowHw(true)} className="relative w-10 h-10 rounded-xl bg-white ring-1 ring-slate-200 grid place-items-center text-slate-500 shadow-soft">
            <Bell className="w-[18px] h-[18px]" />{hw?.has && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-coral-500 text-white text-[9px] font-bold grid place-items-center ring-2 ring-white">1</span>}
          </button>
          <Link to="/reservar" className="hidden sm:inline-flex items-center gap-2 bg-brand-600 text-white text-[13px] font-semibold rounded-xl px-4 py-2.5 shadow-soft">
            <CalendarPlus className="w-4 h-4" />{t('home.reservar')}
          </Link>
        </div>
      </div>

      {/* HERO */}
      <div className="mt-5 relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white shadow-lift flex items-stretch min-h-[220px]">
        <div className="flex-1 p-6 lg:p-7 min-w-0 relative z-10">
          {next ? (
            <>
              <div className="text-[11px] font-bold tracking-wide text-brand-200 flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-coral-300" />{t('home.proximaClase')} · {whenLabel(next.when)}</div>
              <div className="font-display text-2xl lg:text-[27px] font-bold mt-2 leading-tight">
                {ct(next.b.type)} {t('home.withManolo')}<br />
                <span>{cdText(next.when).prefix} <span className="text-coral-200">{cdText(next.when).body}</span></span>
              </div>
              <Link to={`/aula/${next.b.id}`} className="mt-5 inline-flex items-center gap-2 bg-white text-brand-700 text-[13px] font-bold rounded-xl px-5 py-3 shadow-lg">
                <Video className="w-4 h-4" />{t('common.enterAula')}
              </Link>
            </>
          ) : (
            <>
              <div className="text-[11px] font-bold tracking-wide text-brand-200 flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-coral-300" />{t('home.proximaClase')}</div>
              <div className="font-display text-2xl lg:text-[27px] font-bold mt-2 leading-tight">{t('home.noClass')}</div>
              <div className="text-[13px] text-brand-100 mt-1">{t('home.noClassSub')}</div>
              <Link to="/reservar" className="mt-5 inline-flex items-center gap-2 bg-white text-brand-700 text-[13px] font-bold rounded-xl px-5 py-3 shadow-lg">
                <CalendarPlus className="w-4 h-4" />{t('home.reservar')}
              </Link>
            </>
          )}
        </div>
        {/* foto Manolo */}
        <div className="relative w-[220px] shrink-0 hidden md:block self-end">
          <img src={TEACHER_PHOTO} alt="Manolo" className="absolute bottom-0 right-0 h-[210px] w-full object-cover object-top rounded-tl-[2rem]"
            style={{ maskImage: 'linear-gradient(to right, transparent, #000 24%)', WebkitMaskImage: 'linear-gradient(to right, transparent, #000 24%)' }} />
        </div>
        {/* cita */}
        <div className="relative w-[270px] shrink-0 hidden lg:flex items-center p-5 z-10">
          <div className="rounded-2xl bg-white/12 backdrop-blur ring-1 ring-white/20 p-5">
            <Quote className="w-5 h-5 text-white/50" />
            <p className="text-[14px] leading-snug mt-2">{t('home.quote')} <span className="text-brand-100">{t('home.quoteFr')}</span></p>
            <div className="text-[22px] text-white/90 mt-1" style={{ fontFamily: 'Caveat, cursive' }}>Manolo</div>
          </div>
        </div>
      </div>

      {/* deberes */}
      {hw?.has ? (
        <button onClick={() => setShowHw(true)} className="mt-4 w-full text-left rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-600 grid place-items-center shrink-0"><BookOpen className="w-6 h-6" /></div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('home.afterClass')}</div>
            <div className="text-[15px] font-bold text-slate-800">{t('home.homework')}</div>
            <div className="text-[12px] text-gold-600 font-semibold">{t('home.homeworkReady')}</div>
          </div>
          <span className="text-[13px] font-semibold text-brand-600 flex items-center gap-1 shrink-0">{t('home.seeAll')} <ArrowRight className="w-4 h-4" /></span>
        </button>
      ) : (
        <Link to="/biblioteca" className="mt-4 w-full rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 grid place-items-center shrink-0"><BookOpen className="w-6 h-6" /></div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-slate-800">{t('home.featLibTitle')}</div>
            <div className="text-[12px] text-slate-400">{t('home.featLibSub')}</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
        </Link>
      )}

      {/* TU NIVEL */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{t('home.yourLevel')}</span>
          <div className="flex gap-1.5">
            {LEVELS.map((l) => (
              <span key={l} className={`px-3 py-1 rounded-full text-[12px] font-bold ${l === level ? 'bg-brand-600 text-white' : 'ring-1 ring-slate-200 bg-white text-slate-400'}`}>{l}</span>
            ))}
          </div>
        </div>
        <Link to="/biblioteca" className="text-[13px] font-semibold text-brand-600 hidden sm:flex items-center gap-1">{t('home.seePath')} <ArrowRight className="w-4 h-4" /></Link>
      </div>

      {/* 4 tarjetas */}
      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/clases" className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white p-5 shadow-lift flex flex-col min-h-[160px]">
          <Video className="w-6 h-6" />
          <div className="font-bold text-[16px] mt-3">{t('home.featLiveTitle')}</div>
          <div className="text-[12px] text-brand-100">{t('home.featLiveSub')}</div>
          <div className="mt-auto pt-3 border-t border-white/20 text-[12px] text-brand-100">{next ? <>{t('home.featLiveNext')} <b className="text-white">{whenLabel(next.when)}</b></> : t('home.noClass')}</div>
        </Link>

        <Link to="/biblioteca" className="rounded-2xl bg-white ring-1 ring-slate-100 p-5 shadow-soft flex flex-col min-h-[160px]">
          <Library className="w-6 h-6 text-brand-600" />
          <div className="font-bold text-[16px] mt-3 text-slate-800">{t('home.featLibTitle')}</div>
          <div className="text-[12px] text-slate-500">{t('home.featLibSub')}</div>
          {current && (
            <div className="mt-auto pt-3">
              <div className="flex items-end justify-between text-[12px] gap-2">
                <span className="text-slate-500 min-w-0">{t('home.lastLesson')}<br /><b className="text-slate-800 truncate block">U{current.n} · {current.title}</b></span>
                <span className="font-bold text-slate-700 shrink-0">{current.pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-brand-500" style={{ width: `${current.pct}%` }} /></div>
            </div>
          )}
        </Link>

        <Link to="/delf" className="rounded-2xl bg-white ring-1 ring-slate-100 p-5 shadow-soft flex flex-col min-h-[160px]">
          <Award className="w-6 h-6 text-gold-600" />
          <div className="font-bold text-[16px] mt-3 text-slate-800">{t('home.featDelfTitle')}</div>
          <div className="text-[12px] text-slate-500">{t('home.featDelfSub')}</div>
          <div className="mt-auto pt-3 text-[12px]"><span className="text-slate-500">{t('home.delfTarget')} <b className="text-slate-800">{LEVEL_NEXT[level]}</b></span><div className="text-slate-400 mt-0.5">{t('home.delfSims')}</div></div>
        </Link>

        <Link to="/progreso" className="rounded-2xl bg-white ring-1 ring-slate-100 p-5 shadow-soft flex flex-col min-h-[160px] relative overflow-hidden">
          <TrendingUp className="w-6 h-6 text-brand-600" />
          <div className="font-bold text-[16px] mt-3 text-slate-800">{t('home.featProgTitle')}</div>
          <div className="text-[12px] text-slate-500">{t('home.featProgSub')}</div>
          <div className="mt-auto pt-3 text-[12px]"><span className="text-slate-500">{t('home.currentStreak')}</span><div className="font-bold text-slate-800">{t('home.dayCount', { count: streak })} 🔥</div></div>
          <svg viewBox="0 0 120 40" className="absolute bottom-0 right-0 w-28 h-12 opacity-70">
            <defs><linearGradient id="hsp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6366f1" stopOpacity=".3" /><stop offset="1" stopColor="#6366f1" stopOpacity="0" /></linearGradient></defs>
            <path d="M2,32 L20,28 L38,30 L56,20 L74,24 L92,10 L118,6" fill="none" stroke="#4F46E5" strokeWidth="2" />
            <path d="M2,32 L20,28 L38,30 L56,20 L74,24 L92,10 L118,6 L118,40 L2,40 Z" fill="url(#hsp)" />
          </svg>
        </Link>
      </div>

      {/* Consejo de Manolo */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-gold-50 to-gold-100 ring-1 ring-gold-400/30 p-5 flex items-center gap-4 relative overflow-hidden">
        <div className="flex-1">
          <div className="text-[13px] font-bold text-gold-600">{t('home.tipTitle')} 💡</div>
          <p className="text-[13px] text-slate-700 mt-1 leading-snug max-w-2xl">{t('home.tipBody')}</p>
        </div>
        <div className="text-5xl shrink-0">🥐</div>
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
