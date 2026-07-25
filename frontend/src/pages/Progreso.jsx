import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Clock, BookOpen, Target, Trophy, Calendar, ChevronDown, Video, Check, Pencil, Headphones,
  Play, Star, Mic, ChevronRight, TrendingUp,
} from 'lucide-react'
import { getProgressFull } from '../lib/api'
import { localizeClassType } from '../i18n/labels'

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const SKILL_META = [
  { key: 'oral_comp', color: '#6366f1', label: 'skOralComp' },
  { key: 'oral_exp', color: '#34d399', label: 'skOralExp' },
  { key: 'written_comp', color: '#fbbf24', label: 'skWrittenComp' },
  { key: 'written_exp', color: '#38bdf8', label: 'skWrittenExp' },
]
const ACH = {
  streak5: { emoji: '🔥', tile: 'bg-coral-50 text-coral-600' },
  lessons10: { icon: BookOpen, tile: 'bg-brand-50 text-brand-600' },
  aprendiz: { icon: BookOpen, tile: 'bg-brand-50 text-brand-600' },
  levelA2: { icon: Trophy, tile: 'bg-gold-100 text-gold-600' },
  classes5: { icon: Target, tile: 'bg-emerald-50 text-emerald-600' },
  primerPaso: { emoji: '⭐', tile: 'bg-gold-100 text-gold-600' },
}

export default function Progreso() {
  const { t, i18n } = useTranslation()
  const [d, setD] = useState(null)

  useEffect(() => { getProgressFull().then(setD).catch(() => {}) }, [])

  const loc = i18n.language && i18n.language.startsWith('fr') ? 'fr-FR' : 'es-ES'
  const fmtHM = (min) => {
    const h = Math.floor((min || 0) / 60), m = (min || 0) % 60
    return h > 0 ? `${h} ${t('prog.hUnit')} ${m} ${t('prog.minUnit')}` : `${m} ${t('prog.minUnit')}`
  }
  const fmtWhen = (ts) => {
    const dt = new Date(ts), now = new Date()
    const day = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
    const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diff = Math.round((t0 - day) / 86400000)
    const time = dt.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })
    const label = diff === 0 ? t('prog.today') : diff === 1 ? t('prog.yesterday')
      : new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short' }).format(dt)
    return `${label}, ${time}`
  }

  const evo = d?.evolution || []
  const maxEvo = Math.max(1, ...evo.map((p) => p.minutes))
  const anyEvo = evo.some((p) => p.minutes > 0)
  const chart = useMemo(() => {
    if (!evo.length) return null
    const x0 = 30, x1 = 470, yb = 190, yt = 25
    const pts = evo.map((p, i) => ({ x: x0 + (x1 - x0) * (i / (evo.length - 1)), y: yb - (p.minutes / maxEvo) * (yb - yt) }))
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(' ')
    return { line, area: `${line} L${x1},${yb} L${x0},${yb} Z`, pts }
  }, [evo, maxEvo])

  // heatmap → 6 filas de 7 con etiqueta de mes en el cambio
  const weeks = useMemo(() => {
    const hm = d?.heatmap || []
    const rows = []
    for (let i = 0; i < hm.length; i += 7) rows.push(hm.slice(i, i + 7))
    let lastM = -1
    return rows.map((row) => {
      const mo = new Date(row[0].date + 'T00:00:00').getMonth()
      const label = mo !== lastM ? new Intl.DateTimeFormat(loc, { month: 'short' }).format(new Date(row[0].date + 'T00:00:00')) : ''
      lastM = mo
      return { label, row }
    })
  }, [d, loc])
  const INTEN = ['bg-slate-100', 'bg-brand-100', 'bg-brand-300', 'bg-brand-500', 'bg-brand-700']

  if (!d) return <div className="max-w-5xl mx-auto px-5 py-20 text-center text-slate-400">{t('common.loading')}</div>
  const s = d.stats
  const units = (d.units || []).slice(0, 6)
  const skills = d.skills

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-[30px] font-bold text-slate-900 leading-none">{t('prog.title')}</h1>
          <p className="text-slate-500 text-sm mt-2">{t('prog.subtitle')}</p>
        </div>
        <div className="px-3.5 h-10 rounded-xl ring-1 ring-slate-200 text-slate-600 font-semibold text-[13px] flex items-center gap-2 bg-white">
          <Calendar className="w-4 h-4" /> {t('prog.range30')} <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* stat cards */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat icon={Clock} tile="bg-brand-50 text-brand-600" label={t('prog.statTime')} value={fmtHM(s.study_min)}
          note={s.study_delta != null ? `${s.study_delta >= 0 ? '+' : ''}${s.study_delta}% ${t('prog.vsPrev')}` : null} noteGood={s.study_delta >= 0} />
        <Stat icon={BookOpen} tile="bg-emerald-50 text-emerald-600" label={t('prog.statClasses')} value={s.classes_done}
          note={s.classes_delta ? `${s.classes_delta >= 0 ? '+' : ''}${s.classes_delta} ${t('prog.vsPrev')}` : null} noteGood={s.classes_delta >= 0} />
        <Stat icon={Target} tile="bg-gold-100 text-gold-600" label={t('prog.statLevel')} value={s.level}
          note={t('prog.levelNext', { next: s.level_next })} noteBrand />
        <Stat icon={Trophy} tile="bg-coral-50 text-coral-600" label={t('prog.statLessons')} value={`${s.lessons_pct}%`}
          note={t('prog.lessonsOf', { done: s.lessons_done, total: s.lessons_total })} />
      </div>

      {/* evolución + habilidades */}
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[15px] font-bold text-slate-800">{t('prog.evoTitle')}</div>
            <span className="px-2.5 py-1 rounded-lg ring-1 ring-slate-200 text-slate-500 text-[12px] font-semibold">{t('prog.evoUnit')}</span>
          </div>
          {anyEvo && chart ? (
            <svg viewBox="0 0 480 210" className="w-full">
              <defs><linearGradient id="evoA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6366f1" stopOpacity=".28" /><stop offset="1" stopColor="#6366f1" stopOpacity="0" /></linearGradient></defs>
              <line x1="30" y1="25" x2="470" y2="25" stroke="#f1f5f9" /><line x1="30" y1="107" x2="470" y2="107" stroke="#f1f5f9" /><line x1="30" y1="190" x2="470" y2="190" stroke="#f1f5f9" />
              <path d={chart.area} fill="url(#evoA)" />
              <path d={chart.line} fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {chart.pts.map((p, i) => evo[i].minutes > 0 && <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#4F46E5" strokeWidth="2.5" />)}
              {weeks.length > 0 && evo.map((p, i) => <text key={i} x={chart.pts[i].x} y="205" textAnchor="middle" fontSize="9" className="fill-slate-400">{p.label}</text>)}
            </svg>
          ) : (
            <div className="h-44 grid place-items-center text-center text-[13px] text-slate-400 px-6">{t('prog.evoEmpty')}</div>
          )}
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
          <div className="text-[15px] font-bold text-slate-800 mb-3">{t('prog.skillsTitle')}</div>
          {skills ? (
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <svg viewBox="0 0 120 120" className="w-36 h-36 -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="13" />
                  {(() => {
                    let off = 0
                    return SKILL_META.map((sk) => {
                      const len = skills[sk.key] / 4
                      const el = <circle key={sk.key} cx="60" cy="60" r="52" fill="none" stroke={sk.color} strokeWidth="13" strokeLinecap="round" pathLength="100" strokeDasharray={`${len} ${100 - len}`} strokeDashoffset={-off} />
                      off += len
                      return el
                    })
                  })()}
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center"><div><div className="text-[26px] font-black text-slate-900 leading-none">{skills.general}%</div><div className="text-[10px] text-slate-400">{t('prog.domGeneral')}</div></div></div>
              </div>
              <div className="flex-1 space-y-2.5 text-[12.5px]">
                {SKILL_META.map((sk) => (
                  <div key={sk.key} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600"><span className="w-2.5 h-2.5 rounded-full" style={{ background: sk.color }} /> {t(`prog.${sk.label}`)}</span>
                    <span className="font-bold text-slate-800">{skills[sk.key]}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 grid place-items-center text-center text-[13px] text-slate-400 px-6">{t('prog.skillsEmpty')}</div>
          )}
        </div>
      </div>

      {/* unidades + actividad */}
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
          <div className="text-[15px] font-bold text-slate-800 mb-3">{t('prog.unitsTitle')}</div>
          <div className="space-y-3">
            {units.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${u.done ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>
                  {u.done ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </div>
                <div className="min-w-0 w-36 lg:w-40"><div className="text-[13px] font-bold text-slate-800 truncate">{u.title}</div><div className="text-[11px] text-slate-500 truncate">{u.meta}</div></div>
                <div className="flex-1 flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-brand-500" style={{ width: `${u.pct}%` }} /></div><span className="text-[12px] font-bold text-slate-700 w-9 text-right">{u.pct}%</span></div>
                <div className="hidden sm:block w-24 text-right text-[11px] font-semibold text-emerald-600">{u.done ? `✓ ${t('prog.unitDone')}` : ''}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-3"><Link to="/biblioteca" className="text-[13px] font-semibold text-brand-600">{t('prog.unitsAll')} →</Link></div>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
          <div className="text-[15px] font-bold text-slate-800 mb-3">{t('prog.activityTitle')}</div>
          {d.activity.length ? (
            <div className="space-y-2.5">
              {d.activity.map((a, i) => {
                const isC = a.kind === 'class'
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50">
                    <div className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${isC ? 'bg-brand-50 text-brand-600' : 'bg-emerald-50 text-emerald-600'}`}>{isC ? <Video className="w-4 h-4" /> : <Check className="w-4 h-4" />}</div>
                    <div className="flex-1 min-w-0"><div className="text-[13px] font-bold text-slate-800 truncate">{isC ? t('prog.actClass') : t('prog.actLesson')}</div><div className="text-[11.5px] text-slate-500 truncate">{isC ? localizeClassType(a.title, i18n.language) : a.title}</div></div>
                    <div className="text-right shrink-0"><div className="text-[11px] font-semibold text-slate-500">{fmtWhen(a.ts)}</div><div className="text-[11px] text-slate-400">{a.minutes} min</div></div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-40 grid place-items-center text-center text-[13px] text-slate-400 px-6">{t('prog.activityEmpty')}</div>
          )}
        </div>
      </div>

      {/* calendario + logros */}
      <div className="mt-4 grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
          <div className="text-[15px] font-bold text-slate-800 mb-3">{t('prog.calTitle')}</div>
          <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 font-semibold mb-2 ml-8">
            {DOW.slice(1).concat(DOW[0]).map((k) => <span key={k}>{t(`prog.dow.${k}`)}</span>)}
          </div>
          <div className="space-y-1.5">
            {weeks.map((wk, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-7 text-[10px] text-slate-400 font-semibold">{wk.label}</span>
                {wk.row.map((c, j) => <span key={j} title={`${c.date} · ${c.minutes} min`} className={`h-6 rounded flex-1 max-w-[26px] ${INTEN[c.level]}`} />)}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-100" /> {t('prog.calLess15')}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-300" /> {t('prog.cal1530')}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-500" /> {t('prog.cal3060')}</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-700" /> {t('prog.calMore60')}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
          <div className="flex items-center justify-between mb-3"><div className="text-[15px] font-bold text-slate-800">{t('prog.logrosTitle')}</div><span className="text-[12px] font-semibold text-brand-600">{t('prog.logrosAll')} →</span></div>
          <div className="space-y-2.5">
            {d.achievements.map((a) => {
              const m = ACH[a.code] || {}
              const label = t(`prog.ach${a.code.charAt(0).toUpperCase() + a.code.slice(1)}`)
              const sub = t(`prog.ach${a.code.charAt(0).toUpperCase() + a.code.slice(1)}Sub`)
              const Icon = m.icon
              return (
                <div key={a.code} className={`flex items-center gap-3 ${a.got ? '' : 'opacity-45'}`}>
                  <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${a.got ? m.tile : 'bg-slate-100 text-slate-400'} text-lg`}>
                    {m.emoji ? m.emoji : Icon ? <Icon className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                  </div>
                  <div className="flex-1"><div className="text-[13px] font-bold text-slate-800">{label}</div><div className="text-[11.5px] text-slate-500">{sub}</div></div>
                  {a.date && <span className="text-[11px] text-slate-400">{new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(a.date + 'T00:00:00'))}</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* recomendación */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/60 ring-1 ring-brand-100 p-5 flex flex-col lg:flex-row items-center gap-5">
        <div className="text-5xl">📈</div>
        <div className="flex-1">
          <div className="text-[16px] font-bold text-slate-800">{t('prog.recTitle')} 💡</div>
          <p className="text-[13px] text-slate-600 mt-1 leading-snug">
            {d.recommend_skill ? t('prog.recSkill', { skill: t(`prog.${SKILL_META.find((x) => x.key === d.recommend_skill)?.label}`).toLowerCase() }) : t('prog.recDefault')}
          </p>
          <Link to="/reservar" className="inline-block mt-3 px-4 py-2 rounded-lg bg-brand-600 text-white text-[13px] font-semibold shadow-soft">{t('prog.recCta')}</Link>
        </div>
        {d.recommend_skill && (
          <div className="lg:w-[280px] shrink-0">
            <div className="text-[12px] font-semibold text-slate-500 mb-2">{t('prog.focusOn')}</div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white ring-1 ring-slate-100 shadow-soft">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center shrink-0"><Mic className="w-4 h-4" /></div>
              <div className="flex-1"><div className="text-[13px] font-bold text-slate-800">{t(`prog.${SKILL_META.find((x) => x.key === d.recommend_skill)?.label}`)}</div></div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ icon: Icon, tile, label, value, note, noteGood, noteBrand }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-4">
      <div className={`w-10 h-10 rounded-xl grid place-items-center ${tile}`}><Icon className="w-5 h-5" /></div>
      <div className="text-[12px] font-semibold text-slate-500 mt-3">{label}</div>
      <div className="text-[24px] font-black text-slate-900 leading-none mt-1">{value}</div>
      {note && <div className={`text-[11px] font-semibold mt-1.5 ${noteBrand ? 'text-brand-600' : noteGood ? 'text-emerald-600' : 'text-slate-400'}`}>{note}</div>}
    </div>
  )
}
