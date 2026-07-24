import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, CalendarPlus, Library, User, Shield, LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const nav = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/reservar', label: 'Reservar', icon: CalendarPlus },
  { to: '/biblioteca', label: 'Biblioteca', icon: Library },
  { to: '/panel', label: 'Mi panel', icon: User },
]

const ADMIN_ROLES = ['admin', 'teacher']

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const initial = user?.name?.charAt(0) || 'A'

  function doLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar (escritorio) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 border-r border-slate-200 bg-white flex-col p-4 z-30">
        <div className="flex items-center gap-2 font-extrabold text-lg px-2">🇫🇷 Aula Francés</div>
        <nav className="mt-6 space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-1">
          {isAdmin && (
            <NavLink
              to="/profe"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                  isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-400 hover:bg-slate-50'
                }`
              }
            >
              <Shield className="w-4 h-4" /> Modo profesor
            </NavLink>
          )}
          <button
            onClick={doLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-50"
          >
            <LogOut className="w-4 h-4" /> Salir ({user?.name})
          </button>
        </div>
      </aside>

      {/* Top bar (móvil) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2 font-extrabold">🇫🇷 Aula Francés</div>
        <div className="flex items-center gap-3">
          <button onClick={doLogout} className="text-slate-400" aria-label="Salir">
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white grid place-items-center text-xs font-bold">
            {initial}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="lg:ml-60 pb-24 lg:pb-0 min-h-screen">
        <Outlet />
      </main>

      {/* Bottom nav (móvil) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-100 flex justify-around py-2">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] ${
                isActive ? 'text-brand-600 font-semibold' : 'text-slate-400'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
