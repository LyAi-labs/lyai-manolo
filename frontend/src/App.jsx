import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { RequireAuth, RequireAdmin } from './components/RequireAuth'
import Login from './pages/Login'
import Home from './pages/Home'
import Reservar from './pages/Reservar'
import Biblioteca from './pages/Biblioteca'
import Leccion from './pages/Leccion'
import MiPanel from './pages/MiPanel'
import PanelManolo from './pages/PanelManolo'
import Progreso from './pages/Progreso'
import Clases from './pages/Clases'
import Proximamente from './pages/Proximamente'
import Aula from './pages/Aula'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Todo lo demás requiere sesión */}
      <Route element={<RequireAuth />}>
        {/* El aula es pantalla completa (sin layout de navegación) */}
        <Route path="/aula/:id" element={<Aula />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/clases" element={<Clases />} />
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/biblioteca" element={<Biblioteca />} />
          <Route path="/delf" element={<Proximamente icon="award" tKey="delf" />} />
          <Route path="/progreso" element={<Progreso />} />
          <Route path="/leccion/:id" element={<Leccion />} />
          <Route path="/panel" element={<MiPanel />} />

          {/* Solo profesor/admin */}
          <Route element={<RequireAdmin />}>
            <Route path="/profe" element={<PanelManolo />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
