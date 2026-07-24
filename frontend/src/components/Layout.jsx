import { NavLink, Outlet } from 'react-router-dom'
import { Home, CalendarPlus, Library, User, Shield } from 'lucide-react'
import { student } from '../data/mock'

const nav = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/reservar', label: 'Reservar', icon: CalendarPlus },
  { to: '/biblioteca', label: 'Biblioteca', icon: Library },
  { to: '/panel', label: 'Mi panel', icon: User },
]

export default function Layout() {
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
        <NavLink
          to="/profe"
          className="mt-auto flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-50"
        >
          <Shield className="w-4 h-4" /> Modo profesor
        </NavLink>
      </aside>

      {/* Top bar (móvil) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2 font-extrabold">🇫🇷 Aula Francés</div>
        <div className="w-8 h-8 rounded-full bg-brand-600 text-white grid place-items-center text-xs font-bold">
          {student.name.charAt(0)}
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
