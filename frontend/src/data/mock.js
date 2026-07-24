// Datos de ejemplo para el esqueleto navegable.
// Se sustituyen por llamadas al backend (FastAPI) en la siguiente fase.

export const teacher = { name: 'Manolo', subject: 'Francés' }

export const student = {
  name: 'Lucía',
  level: 'A2',
  streak: 5,
  lessons: 12,
  hours: 8,
}

export const classTypes = [
  { id: 'conv', name: 'Conversación', desc: 'Práctica oral guiada', duration: 50 },
  { id: 'gram', name: 'Gramática', desc: 'Bases y ejercicios', duration: 50 },
  { id: 'delf', name: 'DELF/DALF', desc: 'Preparación oficial', duration: 60 },
]

export const days = [
  { id: '23', dow: 'MIÉ', d: 23 },
  { id: '24', dow: 'JUE', d: 24 },
  { id: '25', dow: 'VIE', d: 25 },
  { id: '26', dow: 'SÁB', d: 26 },
  { id: '27', dow: 'DOM', d: 27 },
]

export const slots = ['10:00', '11:00', '16:00', '17:00', '18:00', '19:00']
export const bookedSlots = ['11:00'] // ya reservados por otros

export const levels = ['Todos', 'A1', 'A2', 'B1', 'B2', 'C1']

export const lessons = [
  { id: 1, title: 'Les salutations', level: 'A1', type: 'video', meta: 'Vídeo · 8 min', progress: 100 },
  { id: 2, title: 'Les nombres 0–20', level: 'A1', type: 'ejercicio', meta: 'Ejercicio · 10 preguntas', progress: 80 },
  { id: 3, title: 'Le verbe « être »', level: 'A1', type: 'video', meta: 'Vídeo · 11 min', progress: 60 },
  { id: 4, title: 'Le verbe « avoir »', level: 'A2', type: 'ejercicio', meta: 'Ejercicio · 12 preguntas', progress: 30 },
  { id: 5, title: 'Les articles définis', level: 'A2', type: 'pdf', meta: 'PDF · 4 págs', progress: 0 },
  { id: 6, title: 'Le passé composé', level: 'B1', type: 'video', meta: 'Vídeo · 14 min', progress: 0, locked: true },
]

export const upcomingClasses = [
  { id: 'demo', type: 'Conversación', level: 'A2', when: 'Hoy · 17:00', payment: 'paid' },
  { id: 'b2', type: 'Gramática', level: 'A1→A2', when: 'Vie 25 · 18:00', payment: 'pending' },
]

export const pastClasses = [
  { id: 'p1', type: 'Conversación', level: 'A2', when: 'Lun 21 · completada' },
]

export const aulaResources = [
  { id: 1, title: 'Les salutations', src: 'TV5Monde · audio A1', kind: 'audio' },
  { id: 2, title: 'Ficha: le verbe être', src: 'Liveworksheet · interactivo', kind: 'worksheet' },
  { id: 3, title: 'Vocab: la classe', src: 'Quizlet · 20 tarjetas', kind: 'vocab' },
]

export const teacherStats = { students: 14, classesWeek: 9, materials: 23 }

export const todayBookings = [
  { time: '17:00', student: 'Lucía', type: 'Conversación A2', status: 'paid' },
  { time: '18:00', student: 'Marc', type: 'Gramática A1', status: 'pending' },
  { time: '19:00', student: null, type: 'Libre', status: 'free' },
]
