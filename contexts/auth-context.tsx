"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  token: string | null
  userType: "user" | "admin" | "prouser" | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, type: "user" | "admin" | "prouser") => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [userType, setUserType] = useState<"user" | "admin" | "prouser" | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUserType = localStorage.getItem("userType") as "user" | "admin" | "prouser" | null

    if (savedToken && savedUserType) {
      setToken(savedToken)
      setUserType(savedUserType)
    }

    setIsLoading(false)
  }, [])

  const login = (newToken: string, type: "user" | "admin" | "prouser") => {
    setToken(newToken)
    setUserType(type)
    localStorage.setItem("token", newToken)
    localStorage.setItem("userType", type)
    document.cookie = `token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}`
  }

  const logout = () => {
    setToken(null)
    setUserType(null)
    localStorage.removeItem("token")
    localStorage.removeItem("userType")
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        userType,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
