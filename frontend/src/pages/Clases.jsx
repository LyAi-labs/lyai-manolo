import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  History, CalendarPlus, Video, User, ArrowRight, Bookmark, Clock, MessageCircle, BookOpen,
  MonitorPlay, CheckCircle2, CalendarX,
} from 'lucide-react'
import { getBookings } from '../lib/api'
import { localizeClassType } from '../i18n/labels'
import { TEACHER_PHOTO } from '../lib/brand'

const parseWhen = (b) => {
  if (!b?.date || !b?.time) return null
  const d = new Date(`${b.date}T${b.time}:00`)
  return isNaN(d.getTime()) ? null : d
}
const tagColor = (name) =>
  /gram/i.test(name) ? 'bg-emerald-50 text-emerald-600'
    : /delf|dalf/i.test(name) ? 'bg-gold-100 text-gold-600'
      : /libre|tema/i.test(name) ? 'bg-sky-50 text-sky-600'
        : 'bg-brand-100 text-brand-700'

export default function Clases() {
  const { t, i18n } = useTranslation()
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState('prox')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    getBookings().then(setBookings).catch(() => {})
    const iv = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(iv)
  }, [])

  const loc = i18n.language && i18n.language.startsWith('fr') ? 'fr-FR' : 'es-ES'
  const ct = (n) => localizeClassType(n, i18n.language)

  const rows = useMemo(() => bookings
    .filter((b) => b.status !== 'rejected')
    .map((b) => ({ ...b, when: parseWhen(b) }))
    .filter((x) => x.when), [bookings])
  const prox = useMemo(() => rows.filter((x) => x.when > now).sort((a, z) => a.when - z.when), [rows, now])
  const ant = useMemo(() => rows.filter((x) => x.when <= now).sort((a, z) => z.when - a.when), [rows, now])
  const featured = prox[0] || null
  const list = tab === 'prox' ? prox : ant

  const fmtWhen = (d) => {
    const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const time = d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
    if (dd.getTime() === t0.getTime()) return `${t('clases.today')} · ${time}`
    const wd = new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(d).replace('.', '')
    return `${wd.charAt(0).toUpperCase() + wd.slice(1)} · ${time}`
  }
  const dayDiff = (d) => {
    const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    return Math.round((dd - t0) / 86400000)
  }
  const countdown = (d) => {
    const mins = Math.round((d - now) / 60000)
    const dd = dayDiff(d)
    if (dd === 0 && mins < 60 && mins >= 0) return { label: t('clases.startsIn'), big: `${mins} min` }
    if (dd === 0) return { label: '', big: t('clases.today') }
    if (dd === 1) return { label: '', big: t('clases.tomorrow') }
    if (dd > 1) return { label: '', big: t('clases.inDays', { n: dd }) }
    return { label: '', big: fmtWhen(d) }
  }
  const isLive = (d) => { const m = (d - now) / 60000; return m <= 10 && m > -60 }

  // Horario semanal (lunes–domingo de esta semana).
  const week = useMemo(() => {
    const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0)
    const days = Array.from({ length: 5 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d })
    const inWeek = rows.filter((x) => x.when >= monday && x.when < new Date(monday.getTime() + 7 * 86400000)).sort((a, z) => a.when - z.when)
    return { days, inWeek }
  }, [rows, now])

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-[30px] font-bold text-slate-900 leading-none">{t('clases.title')}</h1>
          <p className="text-slate-500 text-sm mt-2">{t('clases.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => setTab('ant')} className="px-4 h-10 rounded-xl ring-1 ring-slate-200 text-slate-600 font-semibold text-[13px] flex items-center gap-2 bg-white hover:bg-slate-50"><History className="w-4 h-4" /> {t('clases.historial')}</button>
          <Link to="/reservar" className="px-4 h-10 rounded-xl bg-brand-600 text-white font-semibold text-[13px] flex items-center gap-2 shadow-soft"><CalendarPlus className="w-4 h-4" /> {t('clases.reservar')}</Link>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-5 flex gap-6 border-b border-slate-200 text-[14px] font-semibold">
        <button onClick={() => setTab('prox')} className={`pb-2.5 ${tab === 'prox' ? 'text-brand-700 border-b-2 border-brand-600' : 'text-slate-400'}`}>{t('clases.tabProx')}</button>
        <button onClick={() => setTab('ant')} className={`pb-2.5 ${tab === 'ant' ? 'text-brand-700 border-b-2 border-brand-600' : 'text-slate-400'}`}>{t('clases.tabAnt')}</button>
      </div>

      <div className="mt-5 grid xl:grid-cols-[1fr_320px] gap-4 items-start">
        {/* lista */}
        <div>
          {list.length ? (
            <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft divide-y divide-slate-100">
              {list.map((b) => {
                const cd = countdown(b.when)
                const live = tab === 'prox' && isLive(b.when)
                const past = tab === 'ant'
                return (
                  <div key={b.id} className="flex items-center gap-4 p-4">
                    <div className="relative w-36 h-24 rounded-xl overflow-hidden shrink-0 hidden sm:block">
                      <img src={TEACHER_PHOTO} alt="Manolo" className="w-full h-full object-cover object-top" />
                      {live && <span className="absolute top-2 left-2 text-[9px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-white" /> {t('clases.live')}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold text-slate-400">{fmtWhen(b.when)}</div>
                      <div className="text-[16px] font-bold text-slate-800 truncate">{ct(b.type)} {t('home.withManolo')}</div>
                      <div className="text-[12px] text-slate-500 flex items-center gap-2 mt-0.5">{ct(b.type)} · {b.level} <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagColor(b.type)}`}>{ct(b.type)}</span></div>
                      <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {t('clases.individual')}</div>
                    </div>
                    <div className="w-36 shrink-0 text-center hidden md:block">
                      {!past && (
                        <div className="rounded-xl bg-slate-50 py-2.5 mb-2">
                          {cd.label && <div className="text-[11px] text-slate-400">{cd.label}</div>}
                          <div className="text-[15px] font-black text-slate-800">{cd.big}</div>
                        </div>
                      )}
                      <Link to={`/aula/${b.id}`} className={`w-full h-9 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 ${live ? 'bg-brand-600 text-white shadow-soft' : 'ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                        {live && <Video className="w-3.5 h-3.5" />}{live ? t('clases.enter') : t('clases.details')}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 grid place-items-center mx-auto mb-3"><CalendarX className="w-7 h-7" /></div>
              <div className="text-[14px] font-semibold text-slate-500">{tab === 'prox' ? t('clases.emptyProx') : t('clases.emptyAnt')}</div>
              {tab === 'prox' && <Link to="/reservar" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-[13px] font-semibold"><CalendarPlus className="w-4 h-4" /> {t('clases.reservar')}</Link>}
            </div>
          )}

          {list.length > 0 && <Link to="/reservar" className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 mt-3">{t('clases.seeAll')} <ArrowRight className="w-4 h-4" /></Link>}

          {/* banda */}
          <div className="mt-4 rounded-2xl bg-brand-50/50 ring-1 ring-brand-100 p-5 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 grid place-items-center shrink-0"><MonitorPlay className="w-8 h-8" /></div>
            <div className="flex-1">
              <div className="text-[15px] font-bold text-slate-800 mb-2">{t('clases.bandTitle')}</div>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px] text-slate-600">
                {['b1', 'b2', 'b3', 'b4'].map((k) => (
                  <span key={k} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {t(`clases.${k}`)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* lateral */}
        <div className="space-y-4">
          {featured && (
            <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white p-4 shadow-lift">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold bg-coral-500 px-2 py-0.5 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {isLive(featured.when) ? t('clases.live') : t('clases.next')}</span>
                <Bookmark className="w-4 h-4 text-white/70" />
              </div>
              <div className="rounded-xl overflow-hidden h-32 mb-3"><img src={TEACHER_PHOTO} alt="Manolo" className="w-full h-full object-cover object-top" /></div>
              <div className="text-[12px] text-brand-100">{fmtWhen(featured.when)}</div>
              <div className="font-display text-[18px] font-bold leading-tight">{ct(featured.type)} {t('home.withManolo')}</div>
              <div className="text-[12px] text-brand-100 mb-3">{ct(featured.type)} · {featured.level}</div>
              <Link to={`/aula/${featured.id}`} className="w-full h-10 rounded-xl bg-white text-brand-700 font-bold text-[13px] flex items-center justify-center gap-2"><Video className="w-4 h-4" /> {t('clases.enter')}</Link>
            </div>
          )}

          {/* horario */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-4">
            <div className="text-[14px] font-bold text-slate-800 mb-3">{t('clases.schedule')}</div>
            <div className="flex gap-1 mb-3">
              {week.days.map((d, i) => {
                const today = dayDiff(d) === 0
                const wd = new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(d).replace('.', '')
                return (
                  <div key={i} className={`flex-1 text-center py-1.5 rounded-lg ${today ? 'bg-brand-600 text-white' : 'text-slate-500'}`}>
                    <div className="text-[10px] capitalize">{wd}</div><div className="text-[13px] font-bold">{d.getDate()}</div>
                  </div>
                )
              })}
            </div>
            {week.inWeek.length ? (
              <div className="space-y-2.5 text-[12px]">
                {week.inWeek.map((b) => (
                  <div key={b.id} className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 w-10">{b.time}</span>
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    <span className="flex-1 text-slate-700 font-medium truncate">{ct(b.type)}</span>
                    {isLive(b.when) ? <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{t('clases.live')}</span>
                      : <span className="text-[10px] text-slate-400">{new Intl.DateTimeFormat(loc, { weekday: 'short' }).format(b.when).replace('.', '')}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[12px] text-slate-400 py-2">{t('clases.weekEmpty')}</div>
            )}
            <Link to="/reservar" className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-600 mt-3">{t('clases.seeCalendar')} <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>

          {/* consejos */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-4">
            <div className="text-[14px] font-bold text-slate-800 mb-3">{t('clases.tips')}</div>
            <div className="space-y-3">
              <Tip icon={Clock} tile="bg-brand-50 text-brand-600" title={t('clases.tip1t')} sub={t('clases.tip1s')} />
              <Tip icon={MessageCircle} tile="bg-coral-50 text-coral-600" title={t('clases.tip2t')} sub={t('clases.tip2s')} />
              <Tip icon={BookOpen} tile="bg-emerald-50 text-emerald-600" title={t('clases.tip3t')} sub={t('clases.tip3s')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Tip({ icon: Icon, tile, title, sub }) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${tile}`}><Icon className="w-4 h-4" /></div>
      <div><div className="text-[13px] font-bold text-slate-800">{title}</div><div className="text-[11.5px] text-slate-500 leading-snug">{sub}</div></div>
    </div>
  )
}
