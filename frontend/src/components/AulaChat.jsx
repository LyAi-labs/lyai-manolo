import { useEffect, useMemo, useRef, useState } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useTranslation } from 'react-i18next'
import { Send } from 'lucide-react'

// Chat + Actividad en vivo, sobre el mismo transporte Yjs (/collab), sala propia
// del chat (aula-<id>-chat). Los items se guardan como JSON string en Y.Array.
const parseAll = (yarr) => yarr.toArray().map((s) => { try { return JSON.parse(s) } catch { return null } }).filter(Boolean)
const hhmm = (ts) => new Date(ts).toTimeString().slice(0, 5)

export default function AulaChat({ room, userName, activeTab, onReady, onReaction }) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([])
  const [activity, setActivity] = useState([])
  const [draft, setDraft] = useState('')
  const mountTs = useRef(Date.now())
  const scrollRef = useRef(null)

  const { provider, yMsg, yAct } = useMemo(() => {
    const doc = new Y.Doc()
    const wsBase = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/collab'
    const provider = new WebsocketProvider(wsBase, room, doc)
    return { provider, yMsg: doc.getArray('messages'), yAct: doc.getArray('activity') }
  }, [room])

  useEffect(() => () => provider.destroy(), [provider])

  useEffect(() => {
    const upd = () => setMessages(parseAll(yMsg))
    const updA = () => {
      const arr = parseAll(yAct)
      setActivity(arr)
      const last = arr[arr.length - 1]
      if (last && last.kind === 'reaction' && last.ts > mountTs.current) onReaction?.(last.extra)
    }
    yMsg.observe(upd); yAct.observe(updA); upd(); updA()
    return () => { yMsg.unobserve(upd); yAct.unobserve(updA) }
  }, [yMsg, yAct, onReaction])

  // API para el aula + evento de entrada (una vez).
  useEffect(() => {
    const sendMessage = (text) => { if (text && text.trim()) yMsg.push([JSON.stringify({ text: text.trim(), user: userName, ts: Date.now() })]) }
    const logActivity = (kind, extra) => yAct.push([JSON.stringify({ kind, extra: extra || '', user: userName, ts: Date.now() })])
    onReady?.({ sendMessage, logActivity })
    logActivity('join')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yMsg, yAct, userName])

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages, activeTab])

  const send = () => {
    if (!draft.trim()) return
    yMsg.push([JSON.stringify({ text: draft.trim(), user: userName, ts: Date.now() })])
    setDraft('')
  }

  if (activeTab === 'activity') {
    return (
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-[12px]">
        {activity.length === 0 && <div className="text-slate-400 text-center pt-6">{t('aula.activityEmpty')}</div>}
        {activity.map((a, i) => (
          <div key={i} className="text-slate-500">
            <span className="text-slate-300 text-[9px] mr-1">{hhmm(a.ts)}</span>
            {t(`aula.act.${a.kind}`, { user: a.user || '—', extra: a.extra || '' })}
          </div>
        ))}
      </div>
    )
  }

  // chat (por defecto)
  return (
    <div className="flex flex-col h-full min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 text-[12px]">
        {messages.length === 0 && <div className="text-slate-400 text-center pt-6">{t('aula.chatEmpty')}</div>}
        {messages.map((m, i) => (
          <div key={i}>
            <span className="font-bold text-slate-700">{m.user || '—'}</span> <span className="text-slate-300 text-[9px]">{hhmm(m.ts)}</span>
            <div className="text-slate-600 break-words">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-slate-100 flex items-center gap-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={t('aula.chatPlaceholder')}
          className="flex-1 h-8 rounded-full bg-slate-100 text-[12px] px-3 outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button onClick={send} className="w-8 h-8 rounded-full bg-brand-600 grid place-items-center text-white shrink-0"><Send className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  )
}
