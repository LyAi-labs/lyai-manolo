import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, Video, Library, TrendingUp, ShieldCheck, GraduationCap, Award, KeyRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import LangSwitch from '../components/LangSwitch'

const ADMIN_ROLES = ['admin', 'teacher']

export default function Login() {
  const { t } = useTranslation()
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const u = await login(identifier.trim(), password)
      navigate(ADMIN_ROLES.includes(u.role) ? '/profe' : '/', { replace: true })
    } catch (err) {
      setError(err.message === 'invalid_credentials' ? t('login.invalidCreds') : t('login.failed'))
    } finally {
      setLoading(false)
    }
  }

  const Brand = () => (
    <div className="flex items-center gap-2.5">
      <svg width="34" height="36" viewBox="0 0 40 44" fill="none">
        <path d="M7 37 L20 7 L33 37" stroke="#fff" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 27 H27" stroke="#fff" strokeWidth="4.6" strokeLinecap="round" />
        <circle cx="20" cy="7" r="3.4" fill="#f43f5e" />
      </svg>
      <div className="leading-[1.02]"><div className="text-[19px] font-extrabold">Aula<br />Francés</div><div className="text-[11px] text-brand-200 font-medium mt-0.5">con Manolo</div></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 grid place-items-center p-0 sm:p-6">
      <div className="w-full max-w-[1080px] bg-white sm:rounded-3xl sm:shadow-lift sm:ring-1 sm:ring-black/5 overflow-hidden flex flex-col lg:flex-row min-h-screen sm:min-h-[640px]">
        {/* panel de marca */}
        <div className="lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white p-8 lg:p-9 flex flex-col">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
          <div className="relative">
            <Brand />
            <h2 className="font-display text-2xl lg:text-[28px] font-bold leading-tight mt-8 lg:mt-10">{t('login.tagline1')}<br /><span className="text-brand-200">{t('login.tagline2')}</span></h2>
            <div className="mt-7 space-y-5">
              <Benefit icon={Video} title={t('login.ben1t')} sub={t('login.ben1s')} />
              <Benefit icon={Library} title={t('login.ben2t')} sub={t('login.ben2s')} />
              <Benefit icon={TrendingUp} title={t('login.ben3t')} sub={t('login.ben3s')} />
            </div>
          </div>
          <div className="relative mt-auto pt-8 hidden lg:block">
            <div className="rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/15 p-4 text-[13px] text-brand-50 italic">{t('login.quote')}
              <div className="text-white/80 mt-1.5 not-italic" style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}>{t('login.quoteBy')}</div>
            </div>
          </div>
        </div>

        {/* formulario */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col">
          <div className="flex justify-end"><LangSwitch /></div>
          <form onSubmit={submit} className="max-w-sm w-full mx-auto my-auto">
            <h1 className="font-display text-2xl lg:text-[30px] font-bold text-slate-900 text-center">{t('login.welcome')}</h1>
            <p className="text-slate-500 text-center text-sm mt-1.5">{t('login.welcomeSub')}</p>

            <div className="mt-7 space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input type="text" required autoCapitalize="none" autoCorrect="off" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t('login.idPlaceholder')}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl ring-1 ring-slate-200 bg-white text-[14px] text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.password')}
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl ring-1 ring-slate-200 bg-white text-[14px] text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-500" />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" aria-label={t('login.password')}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <div className="rounded-xl bg-coral-50 ring-1 ring-coral-200 text-coral-600 text-[13px] px-3 py-2">{error}</div>}
              <button disabled={loading} className="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-[15px] shadow-soft disabled:opacity-60 flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />{loading ? t('login.entering') : t('login.enter')}
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-brand-50/70 ring-1 ring-brand-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-brand-600 grid place-items-center shrink-0 shadow-soft"><KeyRound className="w-5 h-5" /></div>
              <div className="text-[12.5px] text-slate-600">{t('login.noAccessBox')}</div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-center">
              <Badge icon={ShieldCheck} label={t('login.badge1')} />
              <Badge icon={GraduationCap} label={t('login.badge2')} />
              <Badge icon={Award} label={t('login.badge3')} />
            </div>
          </form>
          <div className="text-center text-[11px] text-slate-400 mt-6">{t('login.copyright')}</div>
        </div>
      </div>
    </div>
  )
}

function Benefit({ icon: Icon, title, sub }) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/15 grid place-items-center shrink-0"><Icon className="w-5 h-5" /></div>
      <div><div className="font-bold text-[15px]">{title}</div><div className="text-[12.5px] text-brand-100">{sub}</div></div>
    </div>
  )
}

function Badge({ icon: Icon, label }) {
  return (
    <div><div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 grid place-items-center mx-auto"><Icon className="w-4 h-4" /></div><div className="text-[11px] font-bold text-slate-700 mt-1.5">{label}</div></div>
  )
}
