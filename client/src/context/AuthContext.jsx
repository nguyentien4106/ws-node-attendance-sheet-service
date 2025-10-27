import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token/user on mount
    const checkAuth = () => {
      try {
        const storedUser = sessionStorage.getItem('auth')
        
        if (storedUser) {
          setUser(storedUser)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData) => {
    sessionStorage.setItem('auth', userData)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    sessionStorage.removeItem('auth')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
