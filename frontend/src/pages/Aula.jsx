import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JitsiMeeting } from '@jitsi/react-sdk'
import {
  PhoneOff, Clock, Users, ChevronLeft, ChevronRight, Plus, Send,
  MousePointer2, Pencil, Highlighter, Eraser, Type, Shapes, Image as ImageIcon, StickyNote,
  BookA, MessagesSquare, SquareStack, ListChecks, Images, Volume2,
  Mic, MicOff, Hand, Camera, Share2, Circle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getAula } from '../lib/api'
import { useAuth } from '../auth/AuthContext'

// Sala de pizarra determinista por clase (misma sala Excalidraw, cifrada E2E).
async function boardUrlFor(id) {
  const digest = new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode('aula-frances-manolo:' + id)),
  )
  const roomId = [...digest.slice(0, 10)].map((b) => b.toString(16).padStart(2, '0')).join('')
  let bin = ''
  digest.slice(16, 32).forEach((b) => (bin += String.fromCharCode(b)))
  const key = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `https://excalidraw.com/#room=${roomId},${key}`
}

const TOOLS = [
  ['select', MousePointer2], ['pen', Pencil], ['marker', Highlighter], ['eraser', Eraser],
  ['text', Type], ['shape', Shapes], ['image', ImageIcon], ['sticky', StickyNote],
]
const RES = [
  ['vocab', BookA], ['dialog', MessagesSquare], ['cards', SquareStack],
  ['ex', ListChecks], ['img', Images], ['audio', Volume2],
]
const VOCAB_IN_USE = ['Bonjour', 'Je m’appelle', 'Comment tu t’appelles ?', 'Merci', 'Au revoir']

export default function Aula() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [board, setBoard] = useState('')
  const [scene, setScene] = useState(0)
  const [now, setNow] = useState(() => new Date())
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
  const total = scenes.length || 7

  useEffect(() => { getAula(id).then(setData).catch(() => {}) }, [id])
  useEffect(() => { boardUrlFor(id || 'demo').then(setBoard) }, [id])
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const room = data?.room || `AulaFrancesManolo-${id || 'demo'}`
  const goal = scenes[scene]?.goal || ''
  const hhmm = now.toTimeString().slice(0, 5)

  const cmd = (c) => { try { apiRef.current?.executeCommand(c) } catch { /* api no lista */ } }
  const toggleMic = () => cmd('toggleAudio')
  const toggleHand = () => { cmd('toggleRaiseHand'); setHandUp((v) => !v) }
  const capture = () => {
    try {
      apiRef.current?.captureLargeVideoScreenshot?.().then((r) => {
        if (!r?.dataURL) return
        const a = document.createElement('a')
        a.href = r.dataURL
        a.download = `aula-${hhmm.replace(':', '')}.jpg`
        a.click()
      })
    } catch { /* no disponible */ }
  }
  const burst = (emoji) => {
    const rid = ++reactId.current
    setReactions((r) => [...r, { id: rid, emoji, x: 30 + Math.floor((rid * 37) % 40) }])
    setTimeout(() => setReactions((r) => r.filter((x) => x.id !== rid)), 1600)
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800">
      <style>{`@keyframes floatUp{0%{opacity:0;transform:translateY(10px) scale(.6)}15%{opacity:1}100%{opacity:0;transform:translateY(-120px) scale(1.3)}}`}</style>

      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-slate-200 flex items-center gap-3 lg:gap-4 px-3 lg:px-4 py-2 shrink-0">
        <div className="leading-none shrink-0">
          <div className="font-black text-slate-900 text-[15px] flex items-center gap-1">🇫🇷 Aula Francés</div>
          <div className="text-[9px] text-slate-400 tracking-wide">{t('aula.brandSub')}</div>
        </div>
        <div className="hidden md:block border-l border-slate-200 pl-4 leading-tight min-w-0">
          <div className="text-[13px] font-bold text-slate-800 truncate">{data?.title || t('aula.unitTitle')}</div>
          <div className="text-[10px] text-slate-400">{t('aula.liveClass')}</div>
        </div>

        {/* Stepper de escenas */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <button
            onClick={() => setScene((s) => Math.max(0, s - 1))}
            disabled={scene === 0}
            className="w-6 h-6 rounded-full ring-1 ring-slate-200 grid place-items-center text-slate-500 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="text-center">
            <div className="text-[10px] font-semibold text-slate-500">{t('aula.scene', { n: scene + 1, total })}</div>
            <div className="flex items-center gap-1 mt-0.5 justify-center">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setScene(i)}
                  className={`rounded-full transition-all ${i === scene ? 'w-2 h-2 bg-brand-600' : 'w-1.5 h-1.5 bg-slate-300'}`}
                  aria-label={`${i + 1}`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={() => setScene((s) => Math.min(total - 1, s + 1))}
            disabled={scene >= total - 1}
            className="w-6 h-6 rounded-full ring-1 ring-slate-200 grid place-items-center text-slate-500 disabled:opacity-40"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 shrink-0 text-slate-600">
          <span className="hidden sm:flex text-[12px] font-mono items-center gap-1"><Clock className="w-3.5 h-3.5" />{hhmm}</span>
          <span className="text-[11px] font-bold text-coral-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-coral-500 animate-pulse" />{t('aula.live')}</span>
          <span className="hidden sm:flex text-[12px] items-center gap-1 text-slate-500"><Users className="w-3.5 h-3.5" />{participants}</span>
          <Link to="/panel" className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-coral-500/10 text-coral-600 ring-1 ring-coral-200 flex items-center gap-1">
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('aula.finish')}</span>
          </Link>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* SIDEBAR (F1 chrome · herramientas F2) */}
        <aside className="hidden lg:flex w-48 shrink-0 flex-col border-r border-slate-200 bg-white overflow-y-auto">
          <div className="p-3">
            <div className="text-[9px] font-bold text-slate-400 tracking-wider mb-1.5" title={t('aula.soonF2')}>{t('aula.toolsTitle')}</div>
            <div className="space-y-0.5 text-[12px]">
              {TOOLS.map(([k, Icon], idx) => (
                <div
                  key={k}
                  title={t('aula.soonF2')}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-default ${idx === 0 ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-400'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(`aula.tools.${k}`)}
                </div>
              ))}
            </div>
            <div className="text-[9px] font-bold text-slate-400 tracking-wider mt-4 mb-1.5">{t('aula.resourcesTitle')}</div>
            <div className="space-y-0.5 text-[12px]">
              {RES.map(([k, Icon]) => (
                <div key={k} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-500 hover:bg-slate-50 cursor-default">
                  <Icon className="w-3.5 h-3.5" />
                  {t(`aula.res.${k}`)}
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="text-[11px] font-bold text-brand-600 flex items-center gap-1 px-2 py-1.5 rounded-lg ring-1 ring-brand-100">
                <Plus className="w-3.5 h-3.5" />{t('aula.newScene')}
              </div>
              <div className="mt-2 space-y-1.5">
                {scenes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setScene(i)}
                    className={`w-full text-left rounded-lg p-2 bg-white ${i === scene ? 'ring-2 ring-brand-400' : 'ring-1 ring-slate-100'}`}
                  >
                    <div className="text-[10px] font-bold text-slate-700">{s.title}</div>
                    <div className="text-[9px] text-slate-400 truncate">{s.goal}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* PIZARRA (Excalidraw en F1 → tldraw en F2) */}
        <section className="flex-1 min-h-0 relative bg-white">
          {/* Objetivo */}
          <div className="absolute top-2 left-2 right-2 z-10 text-[12px] bg-white/95 rounded-lg ring-1 ring-slate-200 px-3 py-1.5 shadow-sm">
            <b className="text-brand-600">{t('aula.objective')}:</b> <span className="text-slate-600">{goal}</span>
          </div>
          {board && (
            <iframe src={board} title="Pizarra" className="w-full h-full border-0" allow="clipboard-write; fullscreen" />
          )}
          {/* Vocabulario en uso */}
          <div className="absolute bottom-0 inset-x-0 z-10 bg-white/95 border-t border-slate-200 px-3 py-2">
            <div className="text-[9px] font-bold text-slate-400 mb-1">{t('aula.vocabInUse')} ({VOCAB_IN_USE.length})</div>
            <div className="flex gap-1.5 flex-wrap">
              {VOCAB_IN_USE.map((w) => (
                <span key={w} className="text-[10px] bg-slate-100 rounded-full px-2 py-1 flex items-center gap-1 text-slate-700">
                  {w} <Volume2 className="w-3 h-3 text-brand-500" />
                </span>
              ))}
              <span className="text-[10px] bg-brand-600 text-white rounded-full w-6 grid place-items-center">+</span>
            </div>
          </div>
          {/* Reacciones */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {reactions.map((r) => (
              <span key={r.id} className="absolute bottom-24 text-3xl" style={{ left: r.x + '%', animation: 'floatUp 1.6s ease-out forwards' }}>{r.emoji}</span>
            ))}
          </div>
        </section>

        {/* COLUMNA DERECHA · vídeo + tabs */}
        <aside className="w-full lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col min-h-0">
          {/* vídeo (Jitsi) */}
          <div className="shrink-0">
            <div className="px-2 pt-2 flex items-center justify-between">
              <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                {t('aula.prof')} · {t('aula.student')}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="h-40 lg:h-52 m-2 rounded-lg overflow-hidden bg-black">
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

          {/* tabs (Chat/Notas/Actividad — chat/actividad en F4) */}
          <div className="hidden lg:flex flex-col flex-1 min-h-0 border-t border-slate-100">
            <div className="flex text-[11px] font-semibold border-b border-slate-100">
              {[['chat', t('aula.tabChat')], ['notes', t('aula.tabNotes')], ['activity', t('aula.tabActivity')]].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-3 py-2 ${tab === k ? 'text-brand-700 border-b-2 border-brand-600' : 'text-slate-400'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3 text-[12px] text-slate-500">
              {tab === 'notes' ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('aula.notesPlaceholder')}
                  className="w-full h-full min-h-[8rem] resize-none rounded-lg bg-slate-50 ring-1 ring-slate-200 p-2 text-[12px] outline-none focus:ring-2 focus:ring-brand-500"
                />
              ) : tab === 'chat' ? (
                <div className="text-slate-400 text-center pt-6">{t('aula.chatSoon')}</div>
              ) : (
                <div className="text-slate-400 text-center pt-6">{t('aula.activitySoon')}</div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ===== BARRA INFERIOR ===== */}
      <footer className="bg-white border-t border-slate-200 flex items-center justify-between gap-2 px-3 lg:px-4 py-2 shrink-0">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg ring-1 ring-slate-200 text-slate-300 cursor-not-allowed" title="F5">
            <Circle className="w-3 h-3 fill-slate-300 text-slate-300" />{t('aula.record')}
          </span>
          <button onClick={capture} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">
            <Camera className="w-3.5 h-3.5" /><span className="hidden sm:inline">{t('aula.capture')}</span>
          </button>
          <span className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg ring-1 ring-slate-200 text-slate-300 cursor-not-allowed" title="F3">
            <Share2 className="w-3.5 h-3.5" />{t('aula.shareRes')}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <button
            onClick={toggleMic}
            className={`flex items-center gap-2 px-5 lg:px-6 py-2.5 rounded-xl font-bold text-[13px] shadow-lg transition-colors ${
              muted ? 'bg-brand-600 text-white shadow-brand-600/30' : 'bg-emerald-500 text-white shadow-emerald-500/30'
            }`}
          >
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
        </div>
      </footer>
    </div>
  )
}
