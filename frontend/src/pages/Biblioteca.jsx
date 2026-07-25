import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, SlidersHorizontal, Play, ListChecks, FileText, Check, ChevronRight,
  BookOpen, Headphones, PlayCircle, Pencil, Mic, MessageSquareQuote, GitBranch, BookMarked,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLessons, getMyProgress, getCatalogStats } from '../lib/api'

const LEVELS = ['Todos', 'A1', 'A2', 'B1', 'B2', 'C1']
const C = 326.7 // circunferencia del donut (2πr, r=52)
const typeStyle = {
  video: { icon: Play, tile: 'bg-brand-50 text-brand-600' },
  ejercicio: { icon: ListChecks, tile: 'bg-emerald-50 text-emerald-600' },
  pdf: { icon: FileText, tile: 'bg-gold-100 text-gold-600' },
}

export default function Biblioteca() {
  const { t } = useTranslation()
  const [level, setLevel] = useState('Todos')
  const [lessons, setLessons] = useState([])
  const [completed, setCompleted] = useState(new Set())
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getLessons().then(setLessons).catch(() => {})
    getMyProgress().then((p) => setCompleted(new Set(p.completed))).catch(() => {})
    getCatalogStats().then(setStats).catch(() => {})
  }, [])

  const list = useMemo(
    () => lessons.filter((l) => level === 'Todos' || l.level === level),
    [lessons, level],
  )
  // Progreso del nivel visible (o global si "Todos").
  const doneInList = list.filter((l) => completed.has(l.id)).length
  const pct = list.length ? Math.round((doneInList / list.length) * 100) : 0
  const isAll = level === 'Todos'
  const unitsHeading = isAll ? t('biblioteca.unitsAll') : t('biblioteca.unitsTitle', { level })
  const progressHeading = isAll ? t('biblioteca.progressAll') : t('biblioteca.progressTitle', { level })

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      {/* header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-[30px] font-bold text-slate-900 leading-none">{t('biblioteca.title')}</h1>
          <p className="text-slate-500 text-sm mt-2">{t('biblioteca.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder={t('biblioteca.searchPlaceholder')}
              className="pl-9 pr-4 h-10 w-full lg:w-56 rounded-xl ring-1 ring-slate-200 bg-white text-[13px] text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-brand-300"
            />
          </div>
          <button className="px-4 h-10 rounded-xl ring-1 ring-slate-200 text-slate-600 font-semibold text-[13px] flex items-center gap-2 bg-white hover:bg-slate-50 shrink-0">
            <SlidersHorizontal className="w-4 h-4" /> {t('biblioteca.filtros')}
          </button>
        </div>
      </div>

      {/* tabs de nivel */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold shrink-0 ${
              level === l ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-slate-200 text-slate-500 hover:ring-brand-300'
            }`}
          >
            {l === 'Todos' ? t('biblioteca.all') : l}
          </button>
        ))}
      </div>

      {/* stat cards */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} tile="bg-brand-50 text-brand-600" value={stats?.lessons} label={t('biblioteca.statLessons')} sub={t('biblioteca.statLessonsSub')} />
        <StatCard icon={ListChecks} tile="bg-emerald-50 text-emerald-600" value={stats?.exercises} label={t('biblioteca.statExercises')} sub={t('biblioteca.statExercisesSub')} />
        <StatCard icon={Headphones} tile="bg-coral-50 text-coral-600" value={stats?.audios} label={t('biblioteca.statAudios')} sub={t('biblioteca.statAudiosSub')} />
        <StatCard icon={PlayCircle} tile="bg-sky-50 text-sky-600" value={stats?.videos} label={t('biblioteca.statVideos')} sub={t('biblioteca.statVideosSub')} />
      </div>

      {/* grid principal */}
      <div className="mt-4 grid xl:grid-cols-3 gap-4">
        {/* lista unidades */}
        <div className="xl:col-span-2 rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[15px] font-bold text-slate-800">{unitsHeading}</div>
            <div className="text-[12px] text-slate-400">{t('biblioteca.sortBy')} <span className="text-slate-600 font-semibold">{t('biblioteca.sortRecent')} ▾</span></div>
          </div>
          <div className="divide-y divide-slate-50">
            {list.map((l, i) => {
              const done = completed.has(l.id)
              const st = typeStyle[l.type] || typeStyle.video
              const Icon = done ? Check : st.icon
              const prog = done ? 100 : (l.progress || 0)
              return (
                <Link key={l.id} to={`/leccion/${l.id}`} className="flex items-center gap-3.5 py-3.5 group">
                  <div className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${done ? 'bg-emerald-50 text-emerald-600' : st.tile}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-bold text-slate-800 truncate">
                      <span className="text-slate-400 font-semibold">U{i + 1} ·</span> {l.title}
                    </div>
                    <div className="text-[12px] text-slate-500 truncate">{l.meta}</div>
                  </div>
                  {done ? (
                    <span className="text-[12px] font-semibold text-emerald-600 flex items-center gap-1 shrink-0">
                      <Check className="w-4 h-4" /> {t('biblioteca.completed')}
                    </span>
                  ) : (
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      <div className="w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${prog}%` }} />
                      </div>
                      <span className={`text-[12px] font-bold w-8 text-right ${prog > 0 ? 'text-slate-700' : 'text-slate-400'}`}>{prog}%</span>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </Link>
              )
            })}
            {list.length === 0 && <div className="py-10 text-center text-sm text-slate-400">{t('biblioteca.emptyLevel')}</div>}
          </div>
        </div>

        {/* panel lateral */}
        <div className="space-y-4">
          {/* cómo funciona */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
            <div className="text-[14px] font-bold text-slate-800 mb-3">{t('biblioteca.howTitle')}</div>
            <div className="space-y-3">
              <How icon={Play} tile="bg-brand-50 text-brand-600" title={t('biblioteca.howLearn')} sub={t('biblioteca.howLearnSub')} />
              <How icon={Pencil} tile="bg-emerald-50 text-emerald-600" title={t('biblioteca.howPractice')} sub={t('biblioteca.howPracticeSub')} />
              <How icon={Headphones} tile="bg-coral-50 text-coral-600" title={t('biblioteca.howListen')} sub={t('biblioteca.howListenSub')} />
            </div>
          </div>

          {/* progreso del nivel */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
            <div className="text-[14px] font-bold text-slate-800 mb-2">{progressHeading}</div>
            <div className="flex justify-center my-2">
              <div className="relative">
                <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#eef2ff" strokeWidth="12" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#4F46E5" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="text-[26px] font-black text-slate-900 leading-none">{pct}%</div>
                    <div className="text-[10px] text-slate-400">{t('biblioteca.completedLabel')}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 text-center">{t('biblioteca.unitsDone', { done: doneInList, total: list.length })}</div>
          </div>

          {/* recursos destacados */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-5">
            <div className="text-[14px] font-bold text-slate-800 mb-3">{t('biblioteca.resourcesTitle')}</div>
            <div className="space-y-1">
              <Res icon={Mic} tile="bg-brand-50 text-brand-600" title={t('biblioteca.resPron')} sub={t('biblioteca.resPronSub')} />
              <Res icon={MessageSquareQuote} tile="bg-coral-50 text-coral-600" title={t('biblioteca.resPhrases')} sub={t('biblioteca.resPhrasesSub')} />
              <Res icon={GitBranch} tile="bg-emerald-50 text-emerald-600" title={t('biblioteca.resVerbs')} sub={t('biblioteca.resVerbsSub')} />
              <Res icon={BookMarked} tile="bg-gold-100 text-gold-600" title={t('biblioteca.resVocab')} sub={t('biblioteca.resVocabSub')} />
            </div>
          </div>

          {/* repasar */}
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 ring-1 ring-brand-100 p-5 relative overflow-hidden">
            <div className="text-[14px] font-bold text-slate-800">{t('biblioteca.reviewTitle')}</div>
            <p className="text-[12px] text-slate-600 leading-snug mt-1.5 max-w-[75%]">{t('biblioteca.reviewBody')}</p>
            <Link to="/reservar" className="inline-block mt-3 px-3.5 py-2 rounded-lg bg-brand-600 text-white text-[12px] font-semibold shadow-soft">{t('biblioteca.reviewCta')}</Link>
            <div className="absolute bottom-2 right-3 text-4xl">📚</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, tile, value, label, sub }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-soft p-4">
      <div className={`w-10 h-10 rounded-xl grid place-items-center ${tile}`}><Icon className="w-5 h-5" /></div>
      <div className="text-[12px] font-semibold text-slate-500 mt-3">{label}</div>
      <div className="text-[26px] font-black text-slate-900 leading-none mt-0.5">{value ?? '—'}</div>
      <div className="text-[11px] text-slate-400 mt-1">{sub}</div>
    </div>
  )
}

function How({ icon: Icon, tile, title, sub }) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${tile}`}><Icon className="w-4 h-4" /></div>
      <div><div className="text-[13px] font-bold text-slate-800">{title}</div><div className="text-[11.5px] text-slate-500 leading-snug">{sub}</div></div>
    </div>
  )
}

function Res({ icon: Icon, tile, title, sub }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
      <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${tile}`}><Icon className="w-4 h-4" /></div>
      <div className="flex-1 min-w-0"><div className="text-[13px] font-bold text-slate-800 truncate">{title}</div><div className="text-[11px] text-slate-400 truncate">{sub}</div></div>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
  )
}
