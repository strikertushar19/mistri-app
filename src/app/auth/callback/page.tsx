"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")
    const success = searchParams.get("success")

    if (success === "true" && accessToken && refreshToken) {
      // Store tokens in localStorage
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)

      // Sign in with NextAuth using the tokens
      signIn("credentials", {
        accessToken,
        refreshToken,
        redirect: false,
      }).then((result) => {
        if (result?.ok) {
          toast({
            title: "Authentication successful",
            description: "Welcome!",
          })
          router.push("/")
        } else {
          toast({
            title: "Authentication failed",
            description: "Please try again",
            variant: "destructive",
          })
          router.push("/login")
        }
      })
    } else {
      toast({
        title: "Authentication failed",
        description: "Invalid callback parameters",
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
