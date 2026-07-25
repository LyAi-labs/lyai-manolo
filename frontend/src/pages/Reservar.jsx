import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Video, BookOpen, PenSquare, MessageCircle, Check, ChevronLeft, ChevronRight, Info,
  Clock, Calendar, CalendarCheck, Clock4, ShieldCheck, X, Users, TrendingUp,
} from 'lucide-react'
import { getClassTypes, getAvailability, getAvailabilityMonth, createBooking, getBookings } from '../lib/api'
import { localizeClassType } from '../i18n/labels'
import { TEACHER_AVATAR } from '../lib/brand'

const REF_MONTH = '2026-07' // mes de referencia (DEMO_TODAY)
const typeMeta = {
  conv: { icon: Video, tile: 'bg-brand-100 text-brand-600', chip: 'bg-brand-100 text-brand-700', ring: 'ring-brand-500 bg-brand-50/50' },
  gram: { icon: BookOpen, tile: 'bg-emerald-50 text-emerald-600', chip: 'bg-emerald-50 text-emerald-600', ring: 'ring-brand-500 bg-brand-50/50' },
  delf: { icon: PenSquare, tile: 'bg-gold-100 text-gold-600', chip: 'bg-gold-100 text-gold-600', ring: 'ring-brand-500 bg-brand-50/50' },
  _: { icon: MessageCircle, tile: 'bg-sky-50 text-sky-600', chip: 'bg-sky-50 text-sky-600', ring: 'ring-brand-500 bg-brand-50/50' },
}
const metaFor = (code) => typeMeta[code] || typeMeta._

function fmtLongDate(dateStr, lang) {
  if (!dateStr) return '—'
  const loc = lang && lang.startsWith('fr') ? 'fr-FR' : 'es-ES'
  return new Intl.DateTimeFormat(loc, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr + 'T00:00:00'))
}
function fmtMonth(ym, lang) {
  const [y, m] = ym.split('-').map(Number)
  const loc = lang && lang.startsWith('fr') ? 'fr-FR' : 'es-ES'
  const s = new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1))
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function Reservar() {
  const { t, i18n } = useTranslation()
  const [classTypes, setClassTypes] = useState([])
  const [type, setType] = useState(null)
  const [ym, setYm] = useState(REF_MONTH)
  const [monthDays, setMonthDays] = useState([])
  const [date, setDate] = useState(null)
  const [slots, setSlots] = useState([])
  const [slot, setSlot] = useState(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [showMine, setShowMine] = useState(false)
  const [mine, setMine] = useState(null)

  useEffect(() => {
    getClassTypes().then((cts) => { setClassTypes(cts); if (cts.length) setType(cts[0].id) }).catch(() => {})
  }, [])

  // Carga del mes; auto-selecciona el primer día disponible si aún no hay día.
  function loadMonth(m, autopick = false) {
    getAvailabilityMonth(m).then((res) => {
      setMonthDays(res.days || [])
      if (autopick) {
        const first = (res.days || []).find((d) => d.state === 'available' || d.state === 'few')
        if (first) selectDay(first.date)
      }
    }).catch(() => {})
  }
  useEffect(() => { loadMonth(REF_MONTH, true) }, [])

  function selectDay(d) {
    setDate(d); setSlot(null)
    getAvailability(d).then((av) => {
      setSlots(av.slots || [])
      const free = (av.slots || []).find((s) => !s.is_booked)
      if (free) setSlot(free.time)
    }).catch(() => setSlots([]))
  }

  function navMonth(delta) {
    const [y, m] = ym.split('-').map(Number)
    const nd = new Date(y, m - 1 + delta, 1)
    const nm = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, '0')}`
    setYm(nm); loadMonth(nm)
  }

  async function confirm() {
    if (!type || !slot || !date) return
    setSaving(true)
    try {
      await createBooking({ class_type_id: type, date, time: slot })
      setDone(true)
      loadMonth(ym); selectDay(date)
    } catch (e) {
      alert(t('reservar.error', { msg: e.message }))
    } finally {
      setSaving(false)
    }
  }

  function openMine() {
    setShowMine(true)
    getBookings().then(setMine).catch(() => setMine([]))
  }

  const ct = classTypes.find((c) => c.id === type)

  // Rejilla del calendario (con días de meses vecinos en gris).
  const cells = useMemo(() => {
    const [y, m] = ym.split('-').map(Number)
    const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7 // lunes=0
    const prevLast = new Date(y, m - 1, 0).getDate()
    const out = []
    for (let i = firstDow - 1; i >= 0; i--) out.push({ day: prevLast - i, muted: true })
    monthDays.forEach((d) => out.push(d))
    let nx = 1
    while (out.length % 7 !== 0) out.push({ day: nx++, muted: true })
    return out
  }, [ym, monthDays])

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-[30px] font-bold text-slate-900 leading-none">{t('reservar.title')}</h1>
          <p className="text-slate-500 text-sm mt-2">{t('reservar.subtitle')}</p>
        </div>
        <button onClick={openMine} className="px-4 h-10 rounded-xl ring-1 ring-brand-200 text-brand-700 font-semibold text-[13px] flex items-center gap-2 bg-white hover:bg-brand-50 shrink-0">
          <CalendarCheck className="w-4 h-4" /> {t('reservar.myBookings')}
        </button>
      </div>

      {/* Card A: tipo + duración */}
      <div className="mt-5 rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-slate-800 mb-3.5">{t('reservar.step1')}</div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {classTypes.map((c) => {
              const mm = metaFor(c.code)
              const sel = type === c.id
              const Icon = mm.icon
              return (
                <button key={c.id} onClick={() => setType(c.id)}
                  className={`rounded-xl p-4 text-left relative ${sel ? 'ring-2 ' + mm.ring : 'ring-1 ring-slate-200 bg-white hover:ring-slate-300'}`}>
                  {sel && <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-600 text-white grid place-items-center"><Check className="w-3 h-3" /></span>}
                  <div className={`w-11 h-11 rounded-xl grid place-items-center ${mm.tile}`}><Icon className="w-5 h-5" /></div>
                  <div className="font-bold text-slate-800 mt-3 text-[14px]">{localizeClassType(c.name, i18n.language)}</div>
                  <div className="text-[12px] text-slate-500 truncate">{c.description || ' '}</div>
                  <span className={`inline-block mt-3 text-[11px] font-semibold px-2 py-0.5 rounded-full ${mm.chip}`}>{c.duration_min} {t('reservar.min')}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="lg:w-[220px] lg:border-l lg:border-slate-100 lg:pl-6 shrink-0">
          <div className="text-[15px] font-bold text-slate-800 mb-3.5">{t('reservar.step2')}</div>
          <div className="flex gap-2">
            <div className="flex-1 py-3 rounded-xl ring-2 ring-brand-500 bg-brand-50 text-brand-700 font-bold text-[14px] text-center">{ct?.duration_min || '—'} {t('reservar.min')}</div>
          </div>
          <p className="text-[11.5px] text-slate-400 mt-3 leading-relaxed">{t('reservar.durationNote')}</p>
        </div>
      </div>

      {/* Card B: calendario + horas + resumen */}
      <div className="mt-4 flex flex-col xl:flex-row gap-4">
        <div className="flex-1 min-w-0 rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-6 flex flex-col md:flex-row gap-6">
          {/* calendario */}
          <div className="md:w-1/2 md:border-r md:border-slate-100 md:pr-6">
            <div className="text-[15px] font-bold text-slate-800 mb-3">{t('reservar.step3')}</div>
            <div className="flex items-center justify-between px-1 mb-3">
              <button onClick={() => navMonth(-1)} className="w-7 h-7 rounded-lg ring-1 ring-slate-200 grid place-items-center text-slate-500 hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
              <div className="font-semibold text-slate-700 text-[14px]">{fmtMonth(ym, i18n.language)}</div>
              <button onClick={() => navMonth(1)} className="w-7 h-7 rounded-lg ring-1 ring-slate-200 grid place-items-center text-slate-500 hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-7 text-center text-[11px] text-slate-400 font-semibold mb-1.5">
              {t('reservar.wk', { returnObjects: true }).map((w, i) => <span key={i}>{w}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5 text-center text-[13px]">
              {cells.map((c, i) => {
                if (c.muted) return <div key={i} className="h-9 grid place-items-center text-slate-300">{c.day}</div>
                const selectable = c.state === 'available' || c.state === 'few'
                const isSel = c.date === date
                const dot = c.state === 'available' ? 'bg-brand-500' : c.state === 'few' ? 'bg-gold-500' : 'bg-slate-300'
                if (isSel) return <div key={i} className="h-9 grid place-items-center"><span className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold grid place-items-center">{c.day}</span></div>
                return (
                  <div key={i} className="h-9 grid place-items-center">
                    <button disabled={!selectable} onClick={() => selectDay(c.date)}
                      className={`relative w-9 h-9 rounded-full grid place-items-center ${selectable ? 'text-slate-700 hover:bg-slate-50 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}>
                      {c.day}
                      {c.state !== 'none' && <span className={`absolute bottom-1 w-1 h-1 rounded-full ${dot}`} />}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 text-[10.5px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-500" /> {t('reservar.legendAvailable')}</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gold-500" /> {t('reservar.legendFew')}</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300" /> {t('reservar.legendNone')}</span>
            </div>
          </div>
          {/* horas */}
          <div className="md:w-1/2">
            <div className="text-[15px] font-bold text-slate-800 mb-3">{t('reservar.step4')} <span className="text-slate-400 font-normal text-[12px]">{t('reservar.madrid')}</span></div>
            {slots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => {
                  const sel = slot === s.time
                  return (
                    <button key={s.time} disabled={s.is_booked} onClick={() => setSlot(s.time)}
                      className={`py-2.5 rounded-lg text-[13px] font-semibold ${
                        s.is_booked ? 'ring-1 ring-slate-100 text-slate-300 line-through cursor-not-allowed'
                          : sel ? 'bg-brand-600 text-white shadow-soft'
                            : 'ring-1 ring-slate-200 text-slate-600 hover:ring-brand-300 hover:text-brand-600'}`}>
                      {s.time}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-[13px] text-slate-400 py-8 text-center">{date ? t('reservar.noSlots') : t('reservar.pickDay')}</div>
            )}
            <div className="mt-3 rounded-xl bg-brand-50/60 ring-1 ring-brand-100 p-3 flex gap-2.5 text-[11.5px] text-slate-600 leading-snug">
              <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <span>{t('reservar.liveNote')}</span>
            </div>
          </div>
        </div>

        {/* resumen */}
        <div className="xl:w-[330px] shrink-0 rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5 self-start">
          <div className="text-[15px] font-bold text-slate-800">{t('reservar.summaryTitle')}</div>
          <div className="flex items-center gap-3 mt-4">
            <div className="relative shrink-0">
              <img src={TEACHER_AVATAR} alt="Manolo" className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-soft" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-slate-800 text-[15px]">Manolo</div>
              <div className="text-[12px] text-slate-500">{t('reservar.teacherRole')}</div>
              <div className="text-[11px] text-slate-400">{t('reservar.teacherExp')}</div>
            </div>
          </div>
          <div className="mt-4 divide-y divide-slate-50">
            <Row icon={Video} label={t('reservar.sType')} value={ct ? localizeClassType(ct.name, i18n.language) : '—'} />
            <Row icon={Clock} label={t('reservar.sDuration')} value={`${ct?.duration_min || '—'} ${t('reservar.min')}`} />
            <Row icon={Calendar} label={t('reservar.sDate')} value={fmtLongDate(date, i18n.language)} />
            <Row icon={Clock4} label={t('reservar.sHour')} value={slot || '—'} />
          </div>
          {done ? (
            <div className="mt-4 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 text-[13px] p-3 text-center font-semibold">{t('reservar.sent')}</div>
          ) : (
            <>
              <button onClick={confirm} disabled={saving || !type || !slot || !date}
                className="w-full mt-4 h-11 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2 shadow-soft transition disabled:opacity-60">
                <CalendarCheck className="w-[18px] h-[18px]" /> {saving ? t('reservar.saving') : t('reservar.confirm')}
              </button>
              <div className="text-center text-[11px] text-slate-400 mt-2.5 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {t('reservar.noPay')}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ¿por qué? */}
      <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-6">
        <div className="text-[15px] font-bold text-slate-800 mb-4">{t('reservar.whyTitle')}</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <Why icon={Users} tile="bg-brand-50 text-brand-600" title={t('reservar.why1t')} sub={t('reservar.why1s')} />
          <Why icon={Video} tile="bg-coral-50 text-coral-600" title={t('reservar.why2t')} sub={t('reservar.why2s')} />
          <Why icon={Clock} tile="bg-gold-50 text-gold-600" title={t('reservar.why3t')} sub={t('reservar.why3s')} />
          <Why icon={TrendingUp} tile="bg-emerald-50 text-emerald-600" title={t('reservar.why4t')} sub={t('reservar.why4s')} />
        </div>
      </div>

      {/* Modal: mis reservas */}
      {showMine && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm grid place-items-center p-4" onClick={() => setShowMine(false)}>
          <div className="bg-white rounded-2xl shadow-lift w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[16px] font-bold text-slate-800">{t('reservar.myBookings')}</div>
              <button onClick={() => setShowMine(false)} className="w-8 h-8 rounded-lg grid place-items-center text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            {mine === null ? (
              <div className="py-8 text-center text-slate-400 text-sm">…</div>
            ) : mine.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">{t('reservar.myBookingsEmpty')}</div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {mine.map((b) => {
                  const s = b.status === 'confirmed' ? { c: 'bg-emerald-50 text-emerald-700', l: t('status.confirmed') }
                    : b.status === 'rejected' ? { c: 'bg-rose-50 text-rose-600', l: t('reservar.rejected') }
                      : { c: 'bg-gold-100 text-gold-600', l: t('status.pending') }
                  return (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl ring-1 ring-slate-100">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 grid place-items-center shrink-0"><Calendar className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-slate-800 truncate">{localizeClassType(b.type, i18n.language)} {b.level}</div>
                        <div className="text-[11px] text-slate-400">{b.when}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${s.c}`}>{s.l}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-[13px]">
      <span className="flex items-center gap-2 text-slate-500"><Icon className="w-4 h-4 text-slate-400" /> {label}</span>
      <span className="font-bold text-slate-800 text-right">{value}</span>
    </div>
  )
}

function Why({ icon: Icon, tile, title, sub }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${tile}`}><Icon className="w-5 h-5" /></div>
      <div><div className="font-bold text-slate-800 text-[13.5px]">{title}</div><div className="text-[12px] text-slate-500 leading-snug">{sub}</div></div>
    </div>
  )
}
