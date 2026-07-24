// Cliente del backend (FastAPI en /api) con sesión real (JWT).

const BASE = '/api'
const TOKEN_KEY = 'af_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const logout = () => localStorage.removeItem(TOKEN_KEY)

const authHeaders = () => {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function handle(res, path) {
  if (res.status === 401) {
    // Sesión caducada/ inválida → fuera y a login.
    logout()
    if (location.pathname !== '/login') location.assign('/login')
    throw new Error('Sesión expirada')
  }
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
}

async function get(path) {
  return handle(await fetch(BASE + path, { headers: authHeaders() }), path)
}

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  return handle(res, path)
}

export async function login(identifier, password) {
  // El login no lleva token; un 401 aquí = credenciales malas (sin redirect).
  const res = await fetch(BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })
  if (res.status === 401) throw new Error('Credenciales inválidas')
  if (!res.ok) throw new Error('No se pudo iniciar sesión')
  const data = await res.json()
  setToken(data.access_token)
  return data.user
}

export const me = () => get('/auth/me')
export const getClassTypes = () => get('/class-types')
export const getAvailability = (date) => get('/availability' + (date ? `?date=${date}` : ''))
export const getLessons = () => get('/lessons')
export const getLesson = (id) => get(`/lessons/${id}`)
export const getVocab = (id) => get(`/lessons/${id}/vocab`)
export const getAula = (id) => get(`/aula/${id}`)
export const getBookings = () => get('/bookings')
export const createBooking = (payload) => post('/bookings', payload)
export const getAdminToday = () => get('/admin/today')
export const getAdminStats = () => get('/admin/stats')
export const getStudents = () => get('/admin/students')
export const createStudent = (payload) => post('/admin/students', payload)
export const getPendingBookings = () => get('/admin/bookings/pending')
export const confirmBooking = (id) => post(`/admin/bookings/${id}/confirm`, {})
export const rejectBooking = (id) => post(`/admin/bookings/${id}/reject`, {})
export const getStudentProgress = (sid) => get(`/admin/students/${sid}/progress`)
export const completeLesson = (id) => post(`/lessons/${id}/complete`, {})
export const getMyProgress = () => get('/me/progress')
export const finalizeClass = (payload) => post('/admin/classes/finalize', payload)
export const getHomework = () => get('/me/homework')
