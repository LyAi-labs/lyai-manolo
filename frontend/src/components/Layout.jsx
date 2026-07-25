import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, CalendarDays, Library, User, Shield, LogOut, Radio, Award, TrendingUp, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { getWeeklyProgress } from '../lib/api'
import { TEACHER_AVATAR, isManolo } from '../lib/brand'
import LangSwitch from './LangSwitch'

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const nav = [
  { to: '/', label: 'nav.home', icon: Home, end: true },
  { to: '/clases', label: 'nav.clases', icon: Radio },
  { to: '/reservar', label: 'nav.reservar', icon: CalendarDays },
  { to: '/biblioteca', label: 'nav.biblioteca', icon: Library },
  { to: '/delf', label: 'nav.delf', icon: Award, badge: 'soon.badge' },
  { to: '/progreso', label: 'nav.progreso', icon: TrendingUp },
  { to: '/panel', label: 'nav.panel', icon: User },
]
// En móvil (bottom nav) solo caben los esenciales.
const mobileNav = ['/', '/reservar', '/biblioteca', '/progreso', '/panel']

const ADMIN_ROLES = ['admin', 'teacher']

// Marca (logo SVG + wordmark). Reutilizada en escritorio y móvil.
function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={compact ? 28 : 34} height={compact ? 30 : 36} viewBox="0 0 40 44" fill="none" className="shrink-0">
        <path d="M7 37 L20 7 L33 37" stroke="#4F46E5" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 27 H27" stroke="#4F46E5" strokeWidth="4.6" strokeLinecap="round" />
        <circle cx="20" cy="7" r="3.4" fill="#f43f5e" />
      </svg>
      <div className="leading-[1.02]">
        <div className={`font-extrabold text-brand-700 tracking-tight ${compact ? 'text-[15px] leading-none' : 'text-[19px]'}`}>
          Aula{compact ? ' ' : <br />}Francés
        </div>
        {!compact && <div className="text-[11px] text-slate-400 font-medium mt-0.5">con Manolo</div>}
      </div>
    </div>
  )
}

export default function Layout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = ADMIN_ROLES.includes(user?.role)
  const manolo = isManolo(user)
  const initial = user?.name?.charAt(0) || 'A'
  const firstName = (user?.name || '').split(' ')[0] || '—'

  const [weekly, setWeekly] = useState([])
  useEffect(() => {
    if (!isAdmin) getWeeklyProgress().then((w) => setWeekly(w.days || [])).catch(() => {})
  }, [isAdmin])
  const streak = user?.streak ?? 0

  function doLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const NavItem = ({ to, label, icon: Icon, end, badge }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium ${
          isActive ? 'bg-brand-50 text-brand-700 font-semibold ring-1 ring-brand-100' : 'text-slate-500 hover:bg-slate-50'
        }`
      }
    >
      <Icon className="w-[18px] h-[18px]" />
      {t(label)}
      {badge && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-gold-100 text-gold-600">{t(badge)}</span>}
    </NavLink>
  )

  // Avatar de la identidad: foto real si es Manolo; si no, inicial con degradado.
  const IdentityAvatar = () =>
    manolo ? (
      <img src={TEACHER_AVATAR} alt="Manolo" className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-soft shrink-0" />
    ) : (
      <div className={`w-10 h-10 rounded-full grid place-items-center text-white font-black ring-2 ring-white shadow-soft shrink-0 bg-gradient-to-br ${isAdmin ? 'from-coral-500 to-coral-700' : 'from-brand-500 to-brand-700'}`}>
        {initial}
      </div>
    )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar (escritorio) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 border-r border-slate-200/70 bg-white flex-col p-4 z-30">
        <div className="flex items-center justify-between gap-2 px-1 pt-1">
          <Brand />
        </div>
        <div className="mt-4 px-1"><LangSwitch /></div>

        <nav className="mt-5 space-y-0.5">
          {nav.map((n) => (
            <NavItem key={n.to} {...n} />
          ))}
        </nav>

        {/* Racha (alumnos) · CTA panel (profe) */}
        {!isAdmin ? (
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-coral-50 to-brand-50 ring-1 ring-coral-100 p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white grid place-items-center text-[18px] shadow-soft">🔥</div>
              <div className="leading-tight">
                <div className="text-[15px] font-extrabold text-slate-800">{t('sidebar.streak', { count: streak })}</div>
                <div className="text-[11px] text-slate-400 font-medium">{streak > 0 ? t('sidebar.streakGo') : t('sidebar.streakZero')}</div>
              </div>
            </div>
            {weekly.length > 0 && (
              <div className="flex justify-between mt-3 px-0.5">
                {weekly.map((d, i) => {
                  const active = d.count > 0
                  const today = i === weekly.length - 1
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-brand-500' : today ? 'bg-coral-500 ring-2 ring-coral-200' : 'bg-slate-200'}`} />
                      <span className={`text-[9px] ${today ? 'text-coral-500 font-bold' : 'text-slate-400'}`}>{t(`prog.dow.${DOW[d.dow]}`)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/profe" className="mt-4 rounded-2xl bg-gradient-to-br from-coral-500 to-coral-700 p-3.5 text-white block shadow-soft">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 grid place-items-center"><Shield className="w-5 h-5" /></div>
              <div className="leading-tight">
                <div className="text-[14px] font-bold">{t('sidebar.teacherCard')}</div>
                <div className="text-[11px] text-white/80">{t('sidebar.teacherCardSub')}</div>
              </div>
            </div>
          </NavLink>
        )}

        {/* Identidad + salir */}
        <div className="mt-auto pt-4">
          <div className={`flex items-center gap-2.5 rounded-2xl p-2.5 ring-1 ${isAdmin ? 'bg-coral-50/60 ring-coral-100' : 'bg-brand-50/60 ring-brand-100'}`}>
            <IdentityAvatar />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-slate-800 leading-tight truncate">{firstName} 👋</div>
              <div className={`text-[10px] font-bold flex items-center gap-1 ${isAdmin ? 'text-coral-600' : 'text-brand-600'}`}>
                {isAdmin ? t('role.teacher').toUpperCase() : `${t('role.student').toUpperCase()}${user?.level ? ' · ' + user.level : ''}`}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />
          </div>
          <button onClick={doLogout} className="flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-[12px] text-slate-400 hover:bg-slate-50 w-full">
            <LogOut className="w-4 h-4" /> {t('nav.logout', { name: firstName })}
          </button>
        </div>
      </aside>

      {/* Top bar (móvil) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100 flex items-center justify-between px-4 h-14">
        <Brand compact />
        <div className="flex items-center gap-2">
          <LangSwitch />
          {isAdmin ? (
            <NavLink to="/profe" className="text-coral-600" aria-label={t('sidebar.teacherCard')}><Shield className="w-5 h-5" /></NavLink>
          ) : null}
          <button onClick={doLogout} className="text-slate-400" aria-label={t('common.exit')}>
            <LogOut className="w-5 h-5" />
          </button>
          {manolo ? (
            <img src={TEACHER_AVATAR} alt="Manolo" className="w-8 h-8 rounded-full object-cover ring-2 ring-coral-300" />
          ) : (
            <div className={`w-8 h-8 rounded-full text-white grid place-items-center text-xs font-bold ring-2 bg-gradient-to-br ${isAdmin ? 'from-coral-500 to-coral-700 ring-coral-300' : 'from-brand-500 to-brand-700 ring-brand-200'}`}>
              {initial}
            </div>
          )}
        </div>
      </header>

      {/* Contenido */}
      <main className="lg:ml-60 pb-24 lg:pb-0 min-h-screen">
        <Outlet />
      </main>

      {/* Bottom nav (móvil) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-100 flex justify-around py-2">
        {nav.filter((n) => mobileNav.includes(n.to)).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] ${isActive ? 'text-brand-600 font-semibold' : 'text-slate-400'}`
            }
          >
            <Icon className="w-5 h-5" />
            {t(label)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
