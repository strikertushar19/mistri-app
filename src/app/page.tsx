"use client";
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push("/chat")
  }, [router])

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    </ProtectedRoute>
  )
}