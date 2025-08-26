"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession, signOut } from "next-auth/react"
import { User } from "@/lib/api"
import { userStorage } from "@/lib/utils"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
      return
    }

    if (session?.user) {
      // Check if we already have user data in localStorage (from OAuth)
      const storedUserData = userStorage.getUserData()
      
      // If we have stored user data, use it (this means OAuth was successful)
      if (storedUserData && storedUserData.email) {
        const userData: User = {
          id: session.user.id || storedUserData.id || "",
          email: storedUserData.email,
          first_name: storedUserData.firstName || "",
          last_name: storedUserData.lastName || "",
          avatar: storedUserData.avatarUrl || "",
          provider: storedUserData.provider || "oauth",
          is_verified: true,
          is_active: true,
          created_at: storedUserData.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setUser(userData)
        setIsLoading(false)
        return
      }

      // If no stored data, check if we have tokens and verify with backend
      const accessToken = localStorage.getItem("accessToken")
      if (accessToken) {
        // Verify token with backend to get current user
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json()
          }
          throw new Error('Token verification failed')
        })
        .then(userData => {
          // Store user data for future use
          userStorage.setUserData({
            id: userData.id,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            avatarUrl: userData.avatar,
            createdAt: userData.created_at
          })
          
          setUser(userData)
        })
        .catch(error => {
          console.error("Token verification error:", error)
          // Clear invalid tokens
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          userStorage.clearUserData()
          setUser(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
      } else {
        // No tokens, create user from session data
        const userData: User = {
          id: session.user.id || "",
          email: session.user.email || "",
          first_name: session.user.firstName || "",
          last_name: session.user.lastName || "",
          avatar: session.user.avatar || "",
          provider: "email",
          is_verified: true,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setUser(userData)
        setIsLoading(false)
      }
    } else {
      // No session, check if we have valid tokens
      const accessToken = localStorage.getItem("accessToken")
      if (accessToken) {
        // Try to verify token and get user
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        .then(response => {
          if (response.ok) {
            return response.json()
          }
          throw new Error('Token verification failed')
        })
        .then(userData => {
          // Store user data for future use
          userStorage.setUserData({
            id: userData.id,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            avatarUrl: userData.avatar,
            createdAt: userData.created_at
          })
          
          setUser(userData)
        })
        .catch(error => {
          console.error("Token verification error:", error)
          // Clear invalid tokens
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          userStorage.clearUserData()
          setUser(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
      } else {
        setUser(null)
        setIsLoading(false)
      }
    }
  }, [session, status])

  const logout = async () => {
    try {
      // Get tokens from localStorage
      const accessToken = localStorage.getItem("accessToken")
      const refreshToken = localStorage.getItem("refreshToken")

      // Call backend logout endpoint if we have tokens
      if (accessToken && refreshToken) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              refresh_token: refreshToken,
            }),
          })
        } catch (error) {
          console.error("Backend logout error:", error)
          // Continue with frontend logout even if backend fails
        }
      }

      // Clear local storage
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      userStorage.clearUserData()

      // Sign out from NextAuth
      await signOut({ redirect: false })
      setUser(null)
      
      // Redirect to login page
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


