import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Play, Pause, Volume2, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getLesson, getVocab, getMyProgress, completeLesson } from '../lib/api'

const STEPS = ['leccion.stepGram', 'leccion.stepDialog', 'leccion.stepEx', 'leccion.stepTest']

export default function Leccion() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [lesson, setLesson] = useState(null)
  const [vocab, setVocab] = useState([])
  const [playing, setPlaying] = useState(null) // índice en reproducción
  const [done, setDone] = useState(false)
  const audioRef = useRef(null)

  const typeLabel = (ty) =>
    ({ video: t('leccion.typeVideo'), ejercicio: t('leccion.typeExercise'), pdf: t('leccion.typePdf') }[ty] || ty)

  useEffect(() => {
    getLesson(id).then(setLesson).catch(() => {})
    getVocab(id).then(setVocab).catch(() => setVocab([]))
    getMyProgress().then((p) => setDone(p.completed.includes(Number(id)))).catch(() => {})
    return () => {
      if (audioRef.current) audioRef.current.pause()
    }
  }, [id])

  function marcarCompletada() {
    completeLesson(id).then(() => setDone(true)).catch(() => setDone(true))
  }

  function play(i, url) {
    if (audioRef.current) audioRef.current.pause()
    if (playing === i) {
      setPlaying(null)
      return
    }
    const a = new Audio(url)
    audioRef.current = a
    setPlaying(i)
    a.onended = () => setPlaying(null)
    a.onerror = () => setPlaying(null)
    a.play().catch(() => setPlaying(null))
  }

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-10 py-6 lg:py-10 pb-32">
      <div className="flex items-center gap-3">
        <Link to="/biblioteca">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black">{lesson?.title || '…'}</h1>
        {lesson?.level && (
          <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-700">
            {lesson.level}
          </span>
        )}
      </div>

      {/* Preparación */}
      <div className="mt-4 rounded-xl bg-white ring-1 ring-slate-100 p-4">
        <div className="text-[10px] font-bold text-slate-400">{t('leccion.prep')}</div>
        <div className="text-[14px] font-semibold mt-0.5">{lesson?.meta || '…'}</div>
        {lesson && (
          <div className="text-[11px] text-slate-400 mt-0.5">
            {t('leccion.typeLevel', { type: typeLabel(lesson.type), level: lesson.level })}
          </div>
        )}
      </div>

      {/* Vocabulario */}
      {vocab.length > 0 ? (
        <div className="mt-6">
          <div className="text-[10px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" /> {t('leccion.vocabTitle')}
          </div>
          <div className="space-y-2">
            {vocab.map((v, i) => (
              <div key={i} className="rounded-xl bg-white ring-1 ring-slate-100 p-2.5 flex items-center gap-3">
                <button
                  onClick={() => play(i, v.audio)}
                  aria-label={t('leccion.listen', { word: v.fr })}
                  className={`w-10 h-10 rounded-full grid place-items-center shrink-0 text-white ${
                    playing === i ? 'bg-brand-700' : 'bg-brand-600'
                  }`}
                >
                  {playing === i ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-bold truncate">{v.fr}</div>
                  <div className="text-[12px] text-slate-400 truncate">{v.es}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl ring-1 ring-dashed ring-slate-200 p-4 text-[13px] text-slate-400 text-center">
          {t('leccion.vocabPrep')}
        </div>
      )}

      {/* Próximos pasos del centro de estudio */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {STEPS.map((s) => (
          <span key={s} className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-400">
            {t('leccion.soon', { step: t(s) })}
          </span>
        ))}
      </div>

      {/* Footer fijo */}
      <div className="fixed bottom-16 lg:bottom-0 inset-x-0 lg:left-60 bg-white border-t border-slate-100 p-4 z-20">
        <div className="max-w-2xl mx-auto">
          {done ? (
            <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 text-sm p-3 text-center font-semibold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> {t('leccion.completedMsg')}
            </div>
          ) : (
            <button
              onClick={marcarCompletada}
              className="w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3"
            >
              {t('leccion.markComplete')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
