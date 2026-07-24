import { createContext, useContext, useEffect, useState } from 'react'
import * as api from '../lib/api'
import i18n from '../i18n'

const AuthCtx = createContext(null)

// Aplica el idioma guardado en la cuenta a la interfaz (y lo cachea local).
function applyLang(u) {
  const l = u?.lang
  if (l === 'es' || l === 'fr') {
    if (i18n.language !== l) i18n.changeLanguage(l)
    try { localStorage.setItem('af_lang', l) } catch { /* storage bloqueado */ }
  }
}

export function AuthProvider({ children }) {
  // undefined = cargando · null = anónimo · objeto = usuario
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    if (api.getToken()) {
      api
        .me()
        .then((u) => { applyLang(u); setUser(u) })
        .catch(() => {
          api.logout()
          setUser(null)
        })
    } else {
      setUser(null)
    }
  }, [])

  const login = async (identifier, password) => {
    const u = await api.login(identifier, password)
    applyLang(u)
    setUser(u)
    return u
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
