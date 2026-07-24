import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import { getClassTypes, getAvailability, createBooking } from '../lib/api'

// El selector de día es visual; el demo trabaja sobre la disponibilidad de hoy.
const days = [
  { id: '23', dow: 'MIÉ', d: 23 },
  { id: '24', dow: 'JUE', d: 24 },
  { id: '25', dow: 'VIE', d: 25 },
  { id: '26', dow: 'SÁB', d: 26 },
  { id: '27', dow: 'DOM', d: 27 },
]

export default function Reservar() {
  const [classTypes, setClassTypes] = useState([])
  const [slots, setSlots] = useState([])
  const [type, setType] = useState(null)
  const [day, setDay] = useState('24')
  const [slot, setSlot] = useState(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    getClassTypes().then((cts) => {
      setClassTypes(cts)
      if (cts.length) setType(cts[0].id)
    })
    getAvailability().then((av) => {
      setSlots(av.slots)
      const free = av.slots.find((s) => !s.is_booked)
      if (free) setSlot(free.time)
    })
  }, [])

  const ct = classTypes.find((c) => c.id === type)
  const dd = days.find((d) => d.id === day)

  async function confirm() {
    if (!type || !slot) return
    setSaving(true)
    try {
      await createBooking({ class_type_id: type, date: '2026-07-' + day, time: slot })
      setDone(true)
    } catch (e) {
      alert('No se pudo reservar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

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
          {slots.map((s) => (
            <button
              key={s.time}
              disabled={s.is_booked}
              onClick={() => setSlot(s.time)}
              className={`rounded-lg py-2.5 ${
                s.is_booked
                  ? 'bg-slate-100 text-slate-300 line-through cursor-not-allowed'
                  : slot === s.time
                    ? 'bg-brand-600 text-white ring-2 ring-brand-600'
                    : 'bg-white ring-1 ring-slate-200 text-slate-700'
              }`}
            >
              {s.time}
            </button>
          ))}
        </div>
      </Section>

      {/* Resumen fijo */}
      <div className="fixed bottom-16 lg:bottom-0 inset-x-0 lg:left-60 bg-white border-t border-slate-100 p-4 z-20">
        <div className="max-w-2xl mx-auto">
          {done ? (
            <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 text-amber-700 text-sm p-3 text-center font-semibold">
              ✓ Reserva enviada — pendiente de que Manolo la confirme. Te avisamos en cuanto la acepte.
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3 flex items-center gap-2 text-[12px] text-slate-500 mb-2">
                <Info className="w-4 h-4 text-brand-600 shrink-0" />
                {ct?.name || '…'} · {ct?.duration_min || '—'} min · {dd?.dow} {dd?.d} · {slot || '—'} ·{' '}
                <b className="text-slate-700">la confirma Manolo</b>
              </div>
              <button
                onClick={confirm}
                disabled={saving || !type || !slot}
                className="w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3 shadow-lg shadow-brand-600/30 disabled:opacity-60"
              >
                {saving ? 'Reservando…' : 'Confirmar reserva'}
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
