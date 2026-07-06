import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(null)

const STORAGE_KEY = "djwizard_token_id"

export function AuthProvider({ children }) {
  const [tokenId, setTokenId] = useState(() => localStorage.getItem(STORAGE_KEY))
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    const error = params.get("auth_error")
    if (token) {
      setTokenId(token)
      localStorage.setItem(STORAGE_KEY, token)
      window.history.replaceState({}, "", "/")
    } else if (error) {
      setAuthError(error)
      window.history.replaceState({}, "", "/")
    }
  }, [])

  const logout = () => {
    setTokenId(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ tokenId, authError, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
