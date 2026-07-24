// Renderiza el material generado por la IA post-clase.
export default function MaterialView({ material }) {
  if (!material) return null
  return (
    <div className="space-y-2">
      {material.resumen && (
        <div className="rounded-xl bg-white ring-1 ring-slate-100 p-3">
          <div className="text-[10px] font-bold text-slate-400">📝 RESUMEN</div>
          <div className="text-[13px] mt-0.5">{material.resumen}</div>
        </div>
      )}

      {Array.isArray(material.ejercicios) && material.ejercicios.length > 0 && (
        <div className="rounded-xl bg-white ring-1 ring-slate-100 p-3">
          <div className="text-[10px] font-bold text-slate-400">✍️ EJERCICIOS</div>
          <ol className="text-[13px] mt-1 space-y-1 list-decimal list-inside">
            {material.ejercicios.map((e, i) => (
              <li key={i}>{typeof e === 'string' ? e : e?.enunciado || JSON.stringify(e)}</li>
            ))}
          </ol>
        </div>
      )}

      {Array.isArray(material.flashcards) && material.flashcards.length > 0 && (
        <div className="rounded-xl bg-white ring-1 ring-slate-100 p-3">
          <div className="text-[10px] font-bold text-slate-400">🃏 FLASHCARDS</div>
          <div className="mt-1 space-y-1">
            {material.flashcards.map((c, i) => (
              <div key={i} className="flex justify-between gap-2 text-[13px]">
                <b className="truncate">{c.fr}</b>
                <span className="text-slate-400 truncate text-right">{c.es}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {material.deberes && (
        <div className="rounded-xl bg-brand-50 ring-1 ring-brand-100 p-3">
          <div className="text-[10px] font-bold text-brand-600">📚 DEBERES</div>
          <div className="text-[13px] mt-0.5 text-brand-800">{material.deberes}</div>
        </div>
      )}
    </div>
  )
}
