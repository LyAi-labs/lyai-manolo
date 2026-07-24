import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JitsiMeeting } from '@jitsi/react-sdk'
import {
  PhoneOff, FolderOpen, Play, FileText, Layers, PencilRuler, CheckCheck, Video,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getAula } from '../lib/api'
import { useAuth } from '../auth/AuthContext'

const kindStyle = {
  audio: { icon: Play, c: 'text-coral-400 bg-coral-500/20' },
  worksheet: { icon: FileText, c: 'text-brand-300 bg-brand-500/20' },
  vocab: { icon: Layers, c: 'text-emerald-400 bg-emerald-500/20' },
}

// Sala de pizarra determinista por clase: profe y alumna caen en la MISMA
// sala Excalidraw (cifrada extremo a extremo). base64url de 16 bytes = 22 chars.
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

export default function Aula() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [view, setView] = useState('pizarra') // 'pizarra' | 'video' | 'recursos'(solo móvil)
  const [board, setBoard] = useState('')
  const apiRef = useRef(null)

  useEffect(() => {
    getAula(id).then(setData).catch(() => {})
  }, [id])
  useEffect(() => {
    boardUrlFor(id || 'demo').then(setBoard)
  }, [id])

  const room = data?.room || `AulaFrancesManolo-${id || 'demo'}`
  const resources = data?.resources || []
  const isVideo = view === 'video'

  const shareScreen = () => {
    setView('video')
    try {
      apiRef.current?.executeCommand('toggleShareScreen')
    } catch { /* el share también se puede iniciar desde la barra de Jitsi */ }
  }

  // ---- clases de los tres paneles (móvil = base · lg = escritorio) ----
  const pizarraCls = [
    'absolute overflow-hidden bg-white',
    'inset-x-0 top-0 bottom-14', // móvil
    view === 'pizarra' ? 'block' : 'hidden',
    isVideo
      ? 'lg:hidden'
      : 'lg:block lg:top-0 lg:bottom-0 lg:left-0 lg:right-[22rem]',
  ].join(' ')

  const videoCls = [
    'absolute overflow-hidden bg-black',
    // móvil: pantalla completa en modo vídeo, si no PiP flotante
    isVideo
      ? 'inset-x-0 top-0 bottom-14 z-20'
      : 'bottom-16 right-3 w-24 h-32 rounded-xl ring-2 ring-white shadow-xl z-40',
    // escritorio
    isVideo
      ? 'lg:inset-y-0 lg:left-0 lg:right-[20rem] lg:w-auto lg:h-auto lg:rounded-none lg:ring-0 lg:shadow-none'
      : 'lg:top-0 lg:right-0 lg:left-auto lg:bottom-auto lg:w-[22rem] lg:h-[46%] lg:rounded-none lg:ring-0 lg:shadow-none lg:z-20',
  ].join(' ')

  const resourcesCls = [
    'absolute overflow-y-auto scroll bg-slate-900 p-3',
    view === 'recursos' ? 'inset-x-0 top-0 bottom-14 block border-t border-white/10' : 'hidden',
    isVideo
      ? 'lg:block lg:right-0 lg:top-0 lg:bottom-0 lg:inset-x-auto lg:w-[20rem] lg:border-l lg:border-t-0 lg:border-white/10'
      : 'lg:block lg:right-0 lg:bottom-0 lg:top-[46%] lg:inset-x-auto lg:w-[22rem] lg:border-l lg:border-t lg:border-white/10',
  ].join(' ')

  const tabBtn = (v, Icon, label) => (
    <button
      onClick={() => setView(v)}
      className={`grid place-items-center gap-0.5 text-[10px] font-semibold ${
        view === v ? 'text-brand-400' : 'text-slate-500'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  )

  const chip = (v, label, onClick) => (
    <button
      onClick={onClick || (() => setView(v))}
      className={`px-3 py-1 rounded-full transition-colors ${
        view === v ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      {/* Barra superior */}
      <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="font-semibold text-sm truncate">{data?.title || t('aula.titleFallback')}</span>
        </div>

        {/* Toggle escritorio */}
        <div className="hidden lg:flex items-center gap-1 text-xs font-semibold rounded-full bg-white/5 ring-1 ring-white/10 p-0.5 mx-3">
          {chip('pizarra', t('aula.pizarra'))}
          {chip('__share', t('aula.share'), shareScreen)}
          {chip('video', t('aula.videoOnly'))}
        </div>

        <Link
          to="/panel"
          className="h-9 px-4 rounded-full bg-coral-600 text-sm font-semibold flex items-center gap-1.5 shrink-0"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">{t('common.exit')}</span>
        </Link>
      </div>

      {/* Escenario: pizarra + vídeo + recursos (los tres viven montados siempre;
          sólo cambian de tamaño/posición → la videollamada nunca se corta) */}
      <div className="flex-1 relative min-h-0">
        {/* PIZARRA (Excalidraw colaborativo) */}
        <div className={pizarraCls}>
          {board && (
            <iframe
              src={board}
              title="Pizarra interactiva"
              className="w-full h-full border-0"
              allow="clipboard-write; fullscreen"
            />
          )}
        </div>

        {/* VÍDEO (Jitsi) */}
        <div className={videoCls}>
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={room}
            configOverwrite={{
              prejoinPageEnabled: true,
              startWithAudioMuted: true,
              disableModeratorIndicator: true,
            }}
            interfaceConfigOverwrite={{
              MOBILE_APP_PROMO: false,
              SHOW_JITSI_WATERMARK: false,
              SHOW_CHROME_EXTENSION_BANNER: false,
            }}
            userInfo={{ displayName: user?.name || '' }}
            onApiReady={(api) => {
              apiRef.current = api
            }}
            getIFrameRef={(node) => {
              node.style.height = '100%'
              node.style.width = '100%'
            }}
          />
        </div>

        {/* RECURSOS */}
        <aside className={resourcesCls}>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4 text-brand-400" />
            {t('aula.resources')}
          </div>
          <div className="space-y-2">
            {resources.map((r) => {
              const { icon: Icon, c } = kindStyle[r.kind] || kindStyle.vocab
              return (
                <div key={r.id} className="flex items-center gap-2.5 rounded-lg bg-white/5 ring-1 ring-white/10 p-2.5">
                  <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${c}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold truncate">{r.title}</div>
                    <div className="text-[10px] text-slate-400">{r.src}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Ejercicio en curso */}
          <div className="mt-4 rounded-xl bg-brand-600/15 ring-1 ring-brand-500/30 p-3">
            <div className="text-[11px] font-semibold text-brand-300 flex items-center gap-1.5">
              <PencilRuler className="w-3.5 h-3.5" />
              {t('aula.exerciseTag')}
            </div>
            <div className="mt-1.5 text-[13px] font-semibold">{t('aula.exerciseTitle')}</div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-400" style={{ width: '66%' }} />
            </div>
            <div className="mt-1 text-[10px] text-slate-400">{t('aula.correct')}</div>
            <button className="mt-2.5 w-full bg-white text-brand-700 text-xs font-bold rounded-lg py-2 flex items-center justify-center gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" />
              {t('aula.correctLive')}
            </button>
          </div>
        </aside>

        {/* Tabs móvil */}
        <div className="lg:hidden absolute inset-x-0 bottom-0 h-14 border-t border-white/10 bg-slate-900 grid grid-cols-3 z-50">
          {tabBtn('video', Video, t('aula.tabVideo'))}
          {tabBtn('pizarra', PencilRuler, t('aula.tabPizarra'))}
          {tabBtn('recursos', FolderOpen, t('aula.tabRecursos'))}
        </div>
      </div>
    </div>
  )
}
