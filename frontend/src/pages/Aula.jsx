import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JitsiMeeting } from '@jitsi/react-sdk'
import {
  Clock, Users, PhoneOff, MoreVertical, MoreHorizontal, Volume2, Send,
  Presentation, FolderOpen, BookOpen, MessagesSquare, ListChecks,
  CalendarDays, Target, BarChart3, User, Bell, HelpCircle,
  Mic, MicOff, Hand, Camera, Share2, Circle, SquareStack,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getAula } from '../lib/api'
import { useAuth } from '../auth/AuthContext'

// La pizarra (Excalidraw + Yjs) es pesada → carga diferida solo en el aula.
const AulaBoard = lazy(() => import('../components/AulaBoard'))

const NAV_LIVE = [
  ['pizarra', Presentation], ['recursos', FolderOpen], ['vocabulario', BookOpen],
  ['dialogos', MessagesSquare], ['ejercicios', ListChecks],
]
const NAV_PROGRESS = [['misClases', CalendarDays], ['misRetos', Target], ['estadisticas', BarChart3]]
const NAV_SETTINGS = [['perfil', User], ['notificaciones', Bell], ['ayuda', HelpCircle]]
const VOCAB_IN_USE = ['Bonjour', 'Je m’appelle', 'Comment tu t’appelles ?', 'Merci', 'Au revoir']

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export default function Aula() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [scene, setScene] = useState(2) // ORBITA · arranca en "Build" (como el diseño)
  const [elapsed, setElapsed] = useState(0)
  const [participants, setParticipants] = useState(1)
  const [muted, setMuted] = useState(true)
  const [handUp, setHandUp] = useState(false)
  const [tab, setTab] = useState('notes')
  const [notes, setNotes] = useState('')
  const [reactions, setReactions] = useState([])
  const apiRef = useRef(null)
  const reactId = useRef(0)

  const scenesRaw = t('aula.scenes', { returnObjects: true })
  const scenes = Array.isArray(scenesRaw) ? scenesRaw : []
  const goal = scenes[scene]?.goal || ''

  useEffect(() => { getAula(id).then(setData).catch(() => {}) }, [id])
  useEffect(() => {
    const iv = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  const room = data?.room || `AulaFrancesManolo-${id || 'demo'}`
  const cmd = (c) => { try { apiRef.current?.executeCommand(c) } catch { /* api no lista */ } }
  const toggleMic = () => cmd('toggleAudio')
  const toggleHand = () => { cmd('toggleRaiseHand'); setHandUp((v) => !v) }
  const capture = () => {
    try {
      apiRef.current?.captureLargeVideoScreenshot?.().then((r) => {
        if (!r?.dataURL) return
        const a = document.createElement('a')
        a.href = r.dataURL; a.download = `aula-${mmss(elapsed).replace(':', '')}.jpg`; a.click()
      })
    } catch { /* no disponible */ }
  }
  const burst = (emoji) => {
    const rid = ++reactId.current
    setReactions((r) => [...r, { id: rid, emoji, x: 25 + Math.floor((rid * 37) % 50) }])
    setTimeout(() => setReactions((r) => r.filter((x) => x.id !== rid)), 1600)
  }

  const NavItem = ({ k, Icon, active }) => (
    <div
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] cursor-default ${
        active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      {t(`aula.nav.${k}`)}
    </div>
  )

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800">
      <style>{`@keyframes floatUp{0%{opacity:0;transform:translateY(10px) scale(.6)}15%{opacity:1}100%{opacity:0;transform:translateY(-120px) scale(1.3)}}`}</style>

      {/* ===== FILA SUPERIOR: logo + header ===== */}
      <div className="flex shrink-0">
        <div className="hidden lg:flex w-56 shrink-0 bg-slate-900 text-white items-center px-4 py-2.5">
          <div className="leading-tight">
            <div className="font-black text-[17px] flex items-center gap-1.5">🇫🇷 Aula Francés</div>
            <div className="text-[10px] text-slate-400">{t('aula.brandSub')}</div>
          </div>
        </div>

        <header className="flex-1 bg-white border-b border-slate-200 flex items-center gap-3 lg:gap-5 px-3 lg:px-5 py-2 min-w-0">
          <div className="min-w-0">
            <div className="text-[14px] font-black text-slate-900 truncate">{data?.title || t('aula.unitTitle')}</div>
            <div className="text-[11px] text-slate-500 truncate"><b className="font-semibold">{t('aula.objectiveLabel')}</b> {goal}</div>
          </div>

          {/* ORBITA stepper */}
          <div className="hidden md:flex flex-1 items-start justify-center">
            <div className="flex items-center">
              {scenes.map((s, i) => (
                <div key={i} className="flex items-center">
                  <button onClick={() => setScene(i)} className="flex flex-col items-center gap-1 px-0.5">
                    <span className={`w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold ring-1 transition-colors ${
                      i === scene ? 'bg-brand-600 text-white ring-brand-600' : i < scene ? 'bg-brand-50 text-brand-600 ring-brand-200' : 'bg-white text-slate-400 ring-slate-200'
                    }`}>{s.title.charAt(0)}</span>
                    <span className={`text-[9px] ${i === scene ? 'text-brand-700 font-semibold' : 'text-slate-400'}`}>{s.title}</span>
                  </button>
                  {i < scenes.length - 1 && <span className={`w-5 lg:w-8 h-px mt-3.5 ${i < scene ? 'bg-brand-300' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 shrink-0 ml-auto md:ml-0">
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-[12px] font-mono text-slate-700 flex items-center gap-1 justify-end"><Clock className="w-3.5 h-3.5" />{mmss(elapsed)} / {t('aula.totalTime')}</div>
              <div className="text-[9px] text-slate-400">{t('aula.classTime')}</div>
            </div>
            <span className="text-[11px] font-bold text-coral-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-coral-500 animate-pulse" />{t('aula.live')}</span>
            <span className="hidden sm:flex text-[12px] items-center gap-1 text-slate-500"><Users className="w-3.5 h-3.5" />{participants}</span>
            <Link to="/panel" className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-coral-500/10 text-coral-600 ring-1 ring-coral-200 flex items-center gap-1">
              <PhoneOff className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t('aula.finish')}</span>
            </Link>
            <MoreVertical className="w-4 h-4 text-slate-400 hidden lg:block" />
          </div>
        </header>
      </div>

      {/* ===== CUERPO ===== */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* SIDEBAR nav de app */}
        <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white overflow-y-auto">
          <div className="p-3 space-y-4 flex-1">
            <div>
              <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-1.5 px-1">{t('aula.navLive')}</div>
              {NAV_LIVE.map(([k, Icon]) => <NavItem key={k} k={k} Icon={Icon} active={k === 'pizarra'} />)}
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-1.5 px-1">{t('aula.navProgress')}</div>
              {NAV_PROGRESS.map(([k, Icon]) => <NavItem key={k} k={k} Icon={Icon} />)}
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-1.5 px-1">{t('aula.navSettings')}</div>
              {NAV_SETTINGS.map(([k, Icon]) => <NavItem key={k} k={k} Icon={Icon} />)}
            </div>
          </div>
          <div className="p-3 border-t border-slate-100">
            <div className="rounded-xl bg-slate-50 ring-1 ring-slate-100 p-3">
              <div className="text-[10px] font-bold text-slate-500">{t('aula.nextClass')}</div>
              <div className="text-[12px] font-bold text-slate-800 mt-0.5">{t('aula.nextClassWhen')}</div>
              <div className="text-[10px] text-slate-400">{t('aula.nextClassUnit')}</div>
            </div>
          </div>
        </aside>

        {/* PIZARRA compartida + vocab */}
        <section className="flex-1 min-h-0 flex flex-col bg-white">
          <div className="flex-1 min-h-0 relative">
            {/* Objetivo (canvas) */}
            <div className="absolute top-2 left-2 z-10 text-[12px] bg-white/95 rounded-lg ring-1 ring-slate-200 px-3 py-1.5 shadow-sm max-w-xs">
              <b className="text-brand-600">{t('aula.objective')}</b> <span className="text-slate-600">{goal}</span>
            </div>
            <Suspense fallback={<div className="w-full h-full grid place-items-center text-slate-400 text-sm">{t('common.loading')}</div>}>
              <AulaBoard room={`aula-${id || 'demo'}`} userName={user?.name} />
            </Suspense>
            {/* Reacciones */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {reactions.map((r) => (
                <span key={r.id} className="absolute bottom-16 text-3xl" style={{ left: r.x + '%', animation: 'floatUp 1.6s ease-out forwards' }}>{r.emoji}</span>
              ))}
            </div>
          </div>
          {/* Vocabulario en uso (strip) */}
          <div className="shrink-0 border-t border-slate-200 px-3 py-2">
            <div className="text-[9px] font-bold text-slate-400 mb-1">{t('aula.vocabInUse')} ({VOCAB_IN_USE.length})</div>
            <div className="flex gap-1.5 flex-wrap">
              {VOCAB_IN_USE.map((w) => (
                <span key={w} className="text-[11px] bg-slate-100 rounded-full px-2.5 py-1 flex items-center gap-1 text-slate-700">
                  {w} <Volume2 className="w-3 h-3 text-brand-500" />
                </span>
              ))}
              <span className="text-[11px] bg-brand-600 text-white rounded-full w-7 grid place-items-center">+</span>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA */}
        <aside className="w-full lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col min-h-0">
          {/* Vídeo (Jitsi · tiles custom = F5) */}
          <div className="shrink-0 p-2">
            <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
              {t('aula.prof')} · {t('aula.student')} <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="h-40 lg:h-56 rounded-lg overflow-hidden bg-black">
              <JitsiMeeting
                domain="meet.jit.si"
                roomName={room}
                configOverwrite={{ prejoinPageEnabled: true, startWithAudioMuted: true, disableModeratorIndicator: true }}
                interfaceConfigOverwrite={{ MOBILE_APP_PROMO: false, SHOW_JITSI_WATERMARK: false, SHOW_CHROME_EXTENSION_BANNER: false }}
                userInfo={{ displayName: user?.name || '' }}
                onApiReady={(api) => {
                  apiRef.current = api
                  const upd = () => { try { setParticipants(api.getNumberOfParticipants?.() || 1) } catch { /* */ } }
                  ;['videoConferenceJoined', 'participantJoined', 'participantLeft'].forEach((e) => api.addListener?.(e, upd))
                  api.addListener?.('audioMuteStatusChanged', (s) => setMuted(!!s?.muted))
                }}
                getIFrameRef={(node) => { node.style.height = '100%'; node.style.width = '100%' }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-col flex-1 min-h-0 border-t border-slate-100">
            <div className="flex text-[11px] font-semibold border-b border-slate-100">
              {[['chat', t('aula.tabChat')], ['notes', t('aula.tabNotes')], ['activity', t('aula.tabActivity')]].map(([k, label]) => (
                <button key={k} onClick={() => setTab(k)} className={`px-3 py-2 ${tab === k ? 'text-brand-700 border-b-2 border-brand-600' : 'text-slate-400'}`}>{label}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3 text-[12px] text-slate-500 min-h-[7rem]">
              {tab === 'notes' ? (
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('aula.notesPlaceholder')}
                  className="w-full h-full min-h-[6rem] resize-none rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2 text-[12px] outline-none focus:ring-2 focus:ring-brand-500" />
              ) : tab === 'chat' ? (
                <div className="text-slate-400 text-center pt-6">{t('aula.chatSoon')}</div>
              ) : (
                <div className="text-slate-400 text-center pt-6">{t('aula.activitySoon')}</div>
              )}
            </div>
            {/* Recursos rápidos */}
            <div className="border-t border-slate-100 p-2.5">
              <div className="text-[10px] font-bold text-slate-400 mb-1.5">{t('aula.quickResources')}</div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-slate-600">
                {[[BookOpen, 'quickVocab'], [MessagesSquare, 'quickDialog'], [SquareStack, 'quickCards']].map(([Icon, k]) => (
                  <div key={k} className="flex flex-col items-center gap-1 rounded-lg ring-1 ring-slate-200 py-2">
                    <Icon className="w-4 h-4 text-brand-500" />{t(`aula.${k}`)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ===== BARRA INFERIOR ===== */}
      <footer className="bg-white border-t border-slate-200 flex items-center justify-between gap-2 px-3 lg:px-5 py-2 shrink-0">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ring-1 ring-slate-200 text-slate-300 cursor-not-allowed" title="F5">
            <Circle className="w-3 h-3 fill-slate-300 text-slate-300" />{t('aula.record')}
          </span>
          <button onClick={capture} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">
            <Camera className="w-3.5 h-3.5" /><span className="hidden md:inline">{t('aula.capture')}</span>
          </button>
          <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ring-1 ring-slate-200 text-slate-300 cursor-not-allowed" title="F3">
            <Share2 className="w-3.5 h-3.5" />{t('aula.shareBoard')}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <button onClick={toggleMic} className={`flex items-center gap-2 px-5 lg:px-7 py-2.5 rounded-xl font-bold text-[13px] shadow-lg transition-colors ${
            muted ? 'bg-brand-600 text-white shadow-brand-600/30' : 'bg-emerald-500 text-white shadow-emerald-500/30'
          }`}>
            {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {muted ? t('aula.speak') : t('aula.mute')}
          </button>
          <span className="text-[9px] text-slate-400 mt-0.5">{t('aula.pushToTalk')}</span>
        </div>

        <div className="flex items-center gap-1 lg:gap-2 text-[10px] text-slate-500">
          <button onClick={toggleHand} className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${handUp ? 'bg-amber-50 text-amber-600' : 'hover:bg-slate-50'}`}>
            <Hand className="w-4 h-4" /><span className="hidden sm:inline">{handUp ? t('aula.lowerHand') : t('aula.raiseHand')}</span>
          </button>
          <button onClick={() => burst('👏')} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-slate-50">
            <span className="text-lg leading-none">👏</span><span className="hidden sm:inline">{t('aula.applause')}</span>
          </button>
          <button onClick={() => burst('😊')} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-slate-50">
            <span className="text-lg leading-none">😊</span><span className="hidden sm:inline">{t('aula.reactions')}</span>
          </button>
          <span className="hidden lg:flex flex-col items-center gap-0.5 px-2 py-1 text-slate-400"><MoreHorizontal className="w-4 h-4" />{t('aula.more')}</span>
        </div>
      </footer>
    </div>
  )
}
