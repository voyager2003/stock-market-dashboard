import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('stockUser')
      if (stored && stored !== 'undefined') {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.token) {
          setUser(parsed)
          api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`
        }
      }
    } catch (err) {
      console.error('Error loading user from storage:', err)
      localStorage.removeItem('stockUser')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('stockUser', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('stockUser')
    delete api.defaults.headers.common['Authorization']
  }

  const updateWatchlist = (watchlist) => {
    setUser((prev) => {
      const updated = { ...prev, watchlist }
      localStorage.setItem('stockUser', JSON.stringify(updated))
      return updated
    })
  }

  const updateBalance = (balance) => {
    setUser((prev) => {
      const updated = { ...prev, balance }
      localStorage.setItem('stockUser', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateWatchlist, updateBalance }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)