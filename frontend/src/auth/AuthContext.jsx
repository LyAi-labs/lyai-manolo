import { createContext, useContext, useEffect, useState } from 'react'
import * as api from '../lib/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  // undefined = cargando · null = anónimo · objeto = usuario
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    if (api.getToken()) {
      api
        .me()
        .then(setUser)
        .catch(() => {
          api.logout()
          setUser(null)
        })
    } else {
      setUser(null)
    }
  }, [])

  const login = async (email, password) => {
    const u = await api.login(email, password)
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
