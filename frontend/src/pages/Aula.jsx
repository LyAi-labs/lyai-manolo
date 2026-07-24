import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JitsiMeeting } from '@jitsi/react-sdk'
import { PhoneOff, FolderOpen, Play, FileText, Layers, PencilRuler, CheckCheck } from 'lucide-react'
import { getAula, getMe } from '../lib/api'

const kindStyle = {
  audio: { icon: Play, c: 'text-coral-400 bg-coral-500/20' },
  worksheet: { icon: FileText, c: 'text-brand-300 bg-brand-500/20' },
  vocab: { icon: Layers, c: 'text-emerald-400 bg-emerald-500/20' },
}

export default function Aula() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [name, setName] = useState('')

  useEffect(() => {
    getAula(id).then(setData).catch(() => {})
    getMe().then((me) => setName(me?.name || '')).catch(() => {})
  }, [id])

  const room = data?.room || `AulaFrancesManolo-${id || 'demo'}`
  const resources = data?.resources || []

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white">
      {/* Barra superior */}
      <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-semibold text-sm">{data?.title || 'Conversación A2 · con Manolo'}</span>
        </div>
        <Link
          to="/panel"
          className="h-9 px-4 rounded-full bg-coral-600 text-sm font-semibold flex items-center gap-1.5"
        >
          <PhoneOff className="w-4 h-4" />
          Salir
        </Link>
      </div>

      {/* Cuerpo: vídeo + recursos */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Aula Jitsi (vídeo + pizarra + compartir pantalla) */}
        <div className="flex-1 min-h-0 bg-black">
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
            userInfo={{ displayName: name }}
            getIFrameRef={(node) => {
              node.style.height = '100%'
              node.style.width = '100%'
            }}
          />
        </div>

        {/* Panel de recursos */}
        <aside className="lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 p-3 overflow-y-auto scroll max-h-72 lg:max-h-none">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4 text-brand-400" />
            Recursos de la clase
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
              EJERCICIO EN CURSO
            </div>
            <div className="mt-1.5 text-[13px] font-semibold">Conjuga « être »</div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand-400" style={{ width: '66%' }} />
            </div>
            <div className="mt-1 text-[10px] text-slate-400">2 / 3 correctas</div>
            <button className="mt-2.5 w-full bg-white text-brand-700 text-xs font-bold rounded-lg py-2 flex items-center justify-center gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" />
              Corregir en directo
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
