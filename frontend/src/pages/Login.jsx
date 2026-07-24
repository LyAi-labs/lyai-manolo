import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const ADMIN_ROLES = ['admin', 'teacher']

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Ya logueado → fuera de /login
  if (user) return <Navigate to="/" replace />

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const u = await login(identifier.trim(), password)
      navigate(ADMIN_ROLES.includes(u.role) ? '/profe' : '/', { replace: true })
    } catch (err) {
      setError(err.message || 'No se pudo entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="text-center">
          <div className="text-5xl">🇫🇷</div>
          <h1 className="mt-2 text-2xl font-black">Aula Francés</h1>
          <p className="mt-1 text-sm text-slate-500">Entra a tu cuenta</p>
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500">Email o usuario</label>
            <input
              type="text"
              required
              autoCapitalize="none"
              autoCorrect="off"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 w-full rounded-xl bg-white ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="manolo  ·  o  tucorreo@ejemplo.com"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl bg-white ring-1 ring-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-coral-50 ring-1 ring-coral-200 text-coral-600 text-[13px] px-3 py-2">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-brand-600 text-white text-sm font-bold rounded-xl py-3 shadow-lg shadow-brand-600/30 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
          <p className="text-center text-[11px] text-slate-400">¿Sin cuenta? Escríbele a Manolo.</p>
        </div>
      </form>
    </div>
  )
}
