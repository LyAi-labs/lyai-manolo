// Servidor de colaboración Yjs para la pizarra del aula (tldraw + Yjs).
// Reutiliza setupWSConnection de y-websocket; sin persistencia (la pizarra vive
// mientras haya alguien conectado a la sala). Sala = path del WebSocket.
const http = require('http')
const { WebSocketServer } = require('ws')
const { setupWSConnection } = require('y-websocket/bin/utils')

const PORT = process.env.PORT || 1234
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('manolo-yjs ok')
})

const wss = new WebSocketServer({ server })
wss.on('connection', (conn, req) => setupWSConnection(conn, req, { gc: true }))

server.listen(PORT, '0.0.0.0', () => console.log(`[manolo-yjs] y-websocket en :${PORT}`))
