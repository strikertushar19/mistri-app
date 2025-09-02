"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"
import { userStorage } from "@/lib/utils"
import { onboardingAPI } from "@/lib/api/onboarding"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")
    const success = searchParams.get("success")
    const avatarUrl = searchParams.get("avatar_url")
    const firstName = searchParams.get("first_name")
    const lastName = searchParams.get("last_name")
    const email = searchParams.get("email")
    const userId = searchParams.get("user_id")
    const provider = searchParams.get("provider") || "google"
    const error = searchParams.get("error")

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error)
      toast({
        title: "Authentication failed",
        description: `OAuth error: ${error}`,
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (success === "true" && accessToken && refreshToken) {
      // Store tokens in localStorage
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      
      // Store user data including avatar URL in localStorage
      userStorage.setUserData({
        id: userId || undefined,
        avatarUrl: avatarUrl || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        createdAt: new Date().toISOString(),
        provider: provider,
      })

      // Check if user already exists by verifying token with backend
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw new Error(`Token verification failed: ${response.status}`)
      })
      .then(userData => {
        // Update stored user data with backend response
        userStorage.setUserData({
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          avatarUrl: userData.avatar || avatarUrl,
          createdAt: userData.created_at,
          provider: userData.provider || provider,
        })

        // Sign in with NextAuth using the tokens
        return signIn("credentials", {
          accessToken,
          refreshToken,
          redirect: false,
        })
      })
      .then((result) => {
        if (result?.ok) {
          // Clear onboarding cache on successful authentication
          onboardingAPI.clearCache();
          
          toast({
            title: "Authentication successful",
            description: "Welcome back!",
          })
          router.push("/chat")
        } else {
          toast({
            title: "Authentication failed",
            description: "Please try again",
            variant: "destructive",
          })
          router.push("/login")
        }
      })
      .catch((error) => {
        console.error("OAuth callback error:", error)
        toast({
          title: "Authentication failed",
          description: error.message || "Failed to verify user account",
          variant: "destructive",
        })
        router.push("/login")
      })
    } else if (!success || !accessToken || !refreshToken) {
      // Missing required parameters
      console.error("Missing OAuth parameters:", { success, accessToken: !!accessToken, refreshToken: !!refreshToken })
      toast({
        title: "Authentication failed",
        description: "Incomplete authentication response",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Processing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we complete your sign-in.</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
