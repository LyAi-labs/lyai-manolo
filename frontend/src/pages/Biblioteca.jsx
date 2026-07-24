import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Play, FileText, Lock, ListChecks } from 'lucide-react'
import { getLessons } from '../lib/api'

const levels = ['Todos', 'A1', 'A2', 'B1', 'B2', 'C1']
const typeIcon = { video: Play, ejercicio: ListChecks, pdf: FileText }

export default function Biblioteca() {
  const [level, setLevel] = useState('Todos')
  const [lessons, setLessons] = useState([])

  useEffect(() => {
    getLessons().then(setLessons).catch(() => {})
  }, [])

  const list = lessons.filter((l) => level === 'Todos' || l.level === level)

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-10 py-6 lg:py-10">
      <h1 className="text-2xl lg:text-3xl font-black">Biblioteca</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto scroll pb-1">
        {levels.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${
              level === l ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-slate-200 text-slate-500'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {list.map((l) => {
          const Icon = l.locked ? Lock : typeIcon[l.type] || Play
          const cls = `block rounded-2xl bg-white ring-1 ring-slate-100 p-4 ${l.locked ? 'opacity-60' : ''}`
          const inner = (
            <>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
                    l.progress === 100 ? 'bg-emerald-50 text-emerald-500' : 'bg-brand-50 text-brand-600'
                  }`}
                >
                  {l.progress === 100 ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{l.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {l.meta} · {l.level}
                  </div>
                </div>
                {l.locked ? (
                  <Lock className="w-4 h-4 text-slate-300" />
                ) : (
                  <span
                    className={`text-xs font-bold ${
                      l.progress === 100 ? 'text-emerald-500' : l.progress > 0 ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  >
                    {l.progress}%
                  </span>
                )}
              </div>
              {!l.locked && (
                <div className="mt-2.5 h-1.5 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${l.progress === 100 ? 'bg-emerald-500' : 'bg-brand-600'}`}
                    style={{ width: `${l.progress}%` }}
                  />
                </div>
              )}
            </>
          )
          return l.locked ? (
            <div key={l.id} className={cls}>{inner}</div>
          ) : (
            <Link key={l.id} to={`/leccion/${l.id}`} className={cls}>{inner}</Link>
          )
        })}
      </div>
    </div>
  )
}
