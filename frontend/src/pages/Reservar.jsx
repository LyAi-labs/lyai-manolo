import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import { classTypes, days, slots, bookedSlots } from '../data/mock'

export default function Reservar() {
  const [type, setType] = useState('conv')
  const [day, setDay] = useState('24')
  const [slot, setSlot] = useState('17:00')
  const [done, setDone] = useState(false)

  const ct = classTypes.find((c) => c.id === type)
  const dd = days.find((d) => d.id === day)

  return (
    <div className="max-w-2xl mx-auto px-5 lg:px-10 py-6 lg:py-10 pb-44">
      <div className="flex items-center gap-3">
        <Link to="/" className="lg:hidden">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl lg:text-3xl font-black">Reservar clase</h1>
      </div>

      <Section title="Tipo de clase">
        <div className="flex flex-wrap gap-2">
          {classTypes.map((c) => (
            <button
              key={c.id}
              onClick={() => setType(c.id)}
              className={`text-sm font-semibold px-4 py-2 rounded-full ${
                type === c.id ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-slate-200 text-slate-500'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Elige día · julio">
        <div className="grid grid-cols-5 gap-2 text-center">
          {days.map((d) => (
            <button
              key={d.id}
              onClick={() => setDay(d.id)}
              className={`rounded-xl py-2.5 ${d.id === day ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-slate-200'}`}
            >
              <div className={`text-[9px] ${d.id === day ? 'text-brand-200' : 'text-slate-400'}`}>{d.dow}</div>
              <div className="text-sm font-bold">{d.d}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Horas de Manolo">
        <div className="grid grid-cols-3 gap-2 text-center text-[13px] font-semibold">
          {slots.map((s) => {
            const full = bookedSlots.includes(s)
            return (
              <button
                key={s}
                disabled={full}
                onClick={() => setSlot(s)}
                className={`rounded-lg py-2.5 ${
                  full
                    ? 'bg-slate-100 text-slate-300 line-through cursor-not-allowed'
                    : slot === s
                      ? 'bg-brand-600 text-white ring-2 ring-brand-600'
                      : 'bg-white ring-1 ring-slate-200 text-slate-700'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Resumen fijo */}
      <div className="fixed bottom-16 lg:bottom-0 inset-x-0 lg:left-60 bg-white border-t border-slate-100 p-4 z-20">
        <div className="max-w-2xl mx-auto">
          {done ? (
            <div className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 text-sm p-3 text-center font-semibold">
              ✓ Reserva registrada — te llegará el enlace de pago (transferencia/Bizum).
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3 flex items-center gap-2 text-[12px] text-slate-500 mb-2">
                <Info className="w-4 h-4 text-brand-600 shrink-0" />
                {ct.name} · {ct.duration} min · {dd.dow} {dd.d} · {slot} ·{' '}
                <b className="text-slate-700">pago tras confirmar</b>
              </div>
              <button
                onClick={() => setDone(true)}
                className="w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3 shadow-lg shadow-brand-600/30"
              >
                Confirmar reserva
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mt-6">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">{title}</div>
      {children}
    </div>
  )
}
