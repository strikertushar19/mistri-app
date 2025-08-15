"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession, signOut } from "next-auth/react"
import { User } from "@/lib/api"

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
      // Convert session user to our User type
      const userData: User = {
        id: session.user.id || "",
        email: session.user.email || "",
        first_name: session.user.firstName || "",
        last_name: session.user.lastName || "",
        avatar: session.user.avatar,
        provider: "email",
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setUser(userData)
    } else {
      setUser(null)
    }

    setIsLoading(false)
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


