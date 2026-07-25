import { useEffect, useMemo, useRef, useState } from 'react'
import { Excalidraw, convertToExcalidrawElements } from '@excalidraw/excalidraw'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { ExcalidrawBinding, yjsToExcalidraw } from 'y-excalidraw'

// Fuentes/manos de Excalidraw desde el CDN de su versión (sin CSP que lo bloquee).
if (typeof window !== 'undefined' && !window.EXCALIDRAW_ASSET_PATH) {
  window.EXCALIDRAW_ASSET_PATH = 'https://unpkg.com/@excalidraw/excalidraw@0.17.6/dist/'
}

const COLORS = ['#4F46E5', '#e11d48', '#059669', '#d97706', '#0891b2', '#7c3aed']

// Pizarra Excalidraw COMPARTIDA (Yjs + y-websocket → contenedor manolo-yjs).
export default function AulaBoard({ room, userName, onReady }) {
  const [api, setApi] = useState(null)
  const [binding, setBinding] = useState(null)
  const containerRef = useRef(null)
  const apiRef = useRef(null)
  const offsetRef = useRef(0)

  // Un Y.Doc + provider por sala.
  const { ydoc, yElements, yAssets, provider } = useMemo(() => {
    const ydoc = new Y.Doc()
    const yElements = ydoc.getArray('elements')
    const yAssets = ydoc.getMap('assets')
    const wsBase = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/collab'
    const provider = new WebsocketProvider(wsBase, room, ydoc)
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    provider.awareness.setLocalStateField('user', { name: userName || 'Invitado', color, colorLight: color + '33' })
    return { ydoc, yElements, yAssets, provider }
  }, [room, userName])

  useEffect(() => () => { provider.destroy(); ydoc.destroy() }, [provider, ydoc])

  useEffect(() => {
    if (!api) return
    const b = new ExcalidrawBinding(yElements, yAssets, api, provider.awareness, {
      excalidrawDom: containerRef.current,
      undoManager: new Y.UndoManager(yElements),
    })
    setBinding(b)
    return () => { b.destroy(); setBinding(null) }
  }, [api, yElements, yAssets, provider])

  useEffect(() => { apiRef.current = api }, [api])

  // Inserta una flashcard (emoji + FR + traducción) en la pizarra → la sincroniza
  // Yjs, así que aparece para ambos. Se expone al aula vía onReady.
  useEffect(() => {
    if (!api || !onReady) return
    const insertFlashcard = (card) => {
      const a = apiRef.current
      if (!a) return
      const n = offsetRef.current++
      const x = 160 + (n % 5) * 46
      const y = 130 + (n % 3) * 46
      const els = convertToExcalidrawElements([
        { type: 'rectangle', x, y, width: 152, height: 104, backgroundColor: '#ffffff', strokeColor: '#4F46E5', strokeWidth: 2, roundness: { type: 3 }, fillStyle: 'solid' },
        { type: 'text', x: x + 12, y: y + 10, text: card.emoji, fontSize: 28 },
        { type: 'text', x: x + 12, y: y + 50, text: card.fr, fontSize: 18, strokeColor: '#1e293b' },
        { type: 'text', x: x + 12, y: y + 78, text: card.es, fontSize: 12, strokeColor: '#64748b' },
      ])
      a.updateScene({ elements: [...a.getSceneElements(), ...els] })
    }
    onReady({ insertFlashcard })
  }, [api, onReady])

  const initialData = useMemo(() => ({ elements: yjsToExcalidraw(yElements), appState: { viewBackgroundColor: '#ffffff' } }), [yElements])

  return (
    <div ref={containerRef} className="w-full h-full">
      <Excalidraw
        excalidrawAPI={setApi}
        initialData={initialData}
        onPointerUpdate={binding?.onPointerUpdate}
        theme="light"
      />
    </div>
  )
}
