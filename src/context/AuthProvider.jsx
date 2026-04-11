import { useState } from 'react'
import { AuthContext } from './AuthContext'
import { login as apiLogin, register as apiRegister, getUser, logout as apiLogout } from '../api/api'

const ADMIN_EMAIL = 'oumydieng503@gmail.com'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = async (email, password) => {
    const result = await apiLogin(email, password)
    if (result.success) {
      const user = {
        ...result.user,
        role: email === ADMIN_EMAIL ? 'admin' : result.user.role
      }
      setUser(user)
      localStorage.setItem('user', JSON.stringify(user))
      return { success: true }
    }
    return { success: false, message: result.message }
  }

  const register = async (userData) => {
    const result = await apiRegister(userData)
    if (result.success) {
      const loginResult = await apiLogin(userData.email, userData.password)
      if (loginResult.success) {
        const user = {
          ...loginResult.user,
          role: userData.email === ADMIN_EMAIL ? 'admin' : loginResult.user.role
        }
        setUser(user)
        localStorage.setItem('user', JSON.stringify(user))
        return { success: true }
      }
    }
    return { success: false, message: result.message }
  }

  const logout = () => {
    apiLogout() // 🔒 Supprime aussi le token JWT
    setUser(null)
  }

  const refreshUser = async () => {
    if (user?.email) {
      const updatedUser = await getUser(user.email)
      if (updatedUser) {
        const refreshed = {
          ...updatedUser,
          role: updatedUser.email === ADMIN_EMAIL ? 'admin' : updatedUser.role
        }
        setUser(refreshed)
        localStorage.setItem('user', JSON.stringify(refreshed))
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  )
}
