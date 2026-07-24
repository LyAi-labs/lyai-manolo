// Etiquetas finitas que llegan del backend en español y traducimos en el front.
const CLASS_TYPE_FR = {
  'Conversación': 'Conversation',
  'Gramática': 'Grammaire',
  'DELF/DALF': 'DELF/DALF',
}

export function localizeClassType(name, lang) {
  if (!name) return name
  return lang && lang.startsWith('fr') ? CLASS_TYPE_FR[name] || name : name
}

// Para etiquetas compuestas del backend, p.ej. "Conversación A2" → "Conversation A2".
export function localizeTypeLabel(s, lang) {
  if (!s || !lang || !lang.startsWith('fr')) return s
  for (const [es, fr] of Object.entries(CLASS_TYPE_FR)) {
    if (s.startsWith(es)) return fr + s.slice(es.length)
  }
  return s
}
