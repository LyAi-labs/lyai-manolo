// Cliente del backend (FastAPI en /api).
// Demo: auto-login del alumno (Lucía) y del profesor (Manolo) para evitar
// un muro de login. La pantalla de login real vendrá en otra iteración.

const BASE = '/api'

const DEMO_STUDENT = { email: 'lucia@demo.fr', password: 'demo1234' }
const DEMO_ADMIN = { email: 'manolo@aula.fr', password: 'manolo1234' }

let studentToken = localStorage.getItem('af_student_token') || null
let adminToken = localStorage.getItem('af_admin_token') || null

async function post(path, body, token) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`)
  return res.json()
}

async function get(path, token) {
  const res = await fetch(BASE + path, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`)
  return res.json()
}

async function ensureStudent() {
  if (studentToken) return studentToken
  const data = await post('/auth/login', DEMO_STUDENT)
  studentToken = data.access_token
  localStorage.setItem('af_student_token', studentToken)
  return studentToken
}

async function ensureAdmin() {
  if (adminToken) return adminToken
  const data = await post('/auth/login', DEMO_ADMIN)
  adminToken = data.access_token
  localStorage.setItem('af_admin_token', adminToken)
  return adminToken
}

// Cache del perfil (una sola llamada compartida entre componentes)
let mePromise = null
export function getMe() {
  if (!mePromise) mePromise = ensureStudent().then((t) => get('/auth/me', t))
  return mePromise
}

export const getClassTypes = () => get('/class-types')
export const getAvailability = (date) =>
  get('/availability' + (date ? `?date=${date}` : ''))
export const getLessons = () => get('/lessons')
export const getAula = (id) => get(`/aula/${id}`)

export async function getBookings() {
  const t = await ensureStudent()
  return get('/bookings', t)
}

export async function createBooking(payload) {
  const t = await ensureStudent()
  return post('/bookings', payload, t)
}

export async function getAdminToday() {
  const t = await ensureAdmin()
  return get('/admin/today', t)
}

export async function getAdminStats() {
  const t = await ensureAdmin()
  return get('/admin/stats', t)
}
