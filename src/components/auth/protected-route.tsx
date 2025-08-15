"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Check if we're in development mode and auth is not required
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"
  const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED === "true"

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isDevMode && authRequired) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router, isDevMode, authRequired])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // In development mode with auth disabled, always show content
  if (isDevMode && !authRequired) {
    return <>{children}</>
  }

  // If not authenticated and auth is required, show fallback or redirect
  if (!isAuthenticated && authRequired) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">Please sign in to continue</p>
        </div>
      </div>
    )
  }

  // User is authenticated, show protected content
  return <>{children}</>
}


