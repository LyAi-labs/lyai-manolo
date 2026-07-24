import { Navigate, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'

const ADMIN_ROLES = ['admin', 'teacher']

function Splash() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-400 text-sm">{t('common.loading')}</div>
  )
}

export function RequireAuth() {
  const { user } = useAuth()
  if (user === undefined) return <Splash />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireAdmin() {
  const { user } = useAuth()
  if (user === undefined) return <Splash />
  if (!user) return <Navigate to="/login" replace />
  if (!ADMIN_ROLES.includes(user.role)) return <Navigate to="/" replace />
  return <Outlet />
}
