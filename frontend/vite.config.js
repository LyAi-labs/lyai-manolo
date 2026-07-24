import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Servido en la raíz de manolo.lyai.fr por manolo-nginx (build estático).
export default defineConfig({
  plugins: [react()],
  base: '/',
})
