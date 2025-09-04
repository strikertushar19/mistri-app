"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { authApi } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying')
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setVerificationStatus('error')
      setErrorMessage('No verification token provided')
      return
    }

    verifyEmail(token)
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    setIsVerifying(true)
    try {
      const response = await authApi.verifyEmail(token)
      setVerificationStatus('success')
      toast({
        title: "Email verified successfully",
        description: "Your account has been activated. You can now sign in.",
      })
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      const message = error.response?.data?.message || "Verification failed"
      setErrorMessage(message)
      
      if (message.includes('expired') || message.includes('invalid')) {
        setVerificationStatus('expired')
      } else {
        setVerificationStatus('error')
      }
      
      toast({
        title: "Verification failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendVerification = async () => {
    // This would need the user's email, which we don't have on this page
    // We could redirect to a page where they can enter their email
    router.push('/auth/resend-verification')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {verificationStatus === 'verifying' && 'Verifying Email...'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
            {verificationStatus === 'expired' && 'Link Expired'}
          </CardTitle>
          <CardDescription className="text-center">
            {verificationStatus === 'verifying' && 'Please wait while we verify your email address'}
            {verificationStatus === 'success' && 'Your email has been successfully verified'}
            {verificationStatus === 'error' && 'There was an error verifying your email'}
            {verificationStatus === 'expired' && 'This verification link has expired'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            {/* Success Icon */}
            {verificationStatus === 'success' && (
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Error Icon */}
            {(verificationStatus === 'error' || verificationStatus === 'expired') && (
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}

            {/* Loading Spinner */}
            {verificationStatus === 'verifying' && (
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            
            <div className="space-y-2">
              {verificationStatus === 'success' && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Your email address has been successfully verified. You can now access all features of your account.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting you to the login page...
                  </p>
                </>
              )}

              {verificationStatus === 'error' && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {errorMessage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please try again or contact support if the problem persists.
                  </p>
                </>
              )}

              {verificationStatus === 'expired' && (
                <>
                  <p className="text-sm text-muted-foreground">
                    This verification link has expired. Verification links are valid for 24 hours.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can request a new verification email below.
                  </p>
                </>
              )}

              {verificationStatus === 'verifying' && (
                <p className="text-sm text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          {verificationStatus === 'success' && (
            <Button 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          )}

          {(verificationStatus === 'error' || verificationStatus === 'expired') && (
            <>
              <Button 
                onClick={handleResendVerification}
                variant="outline"
                className="w-full"
              >
                Request New Verification Email
              </Button>
              
              <Button 
                onClick={() => router.push('/login')}
                variant="ghost"
                className="w-full"
              >
                Back to Login
              </Button>
            </>
          )}

          {verificationStatus === 'verifying' && (
            <Button 
              disabled
              className="w-full"
            >
              Verifying...
            </Button>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            Need help?{" "}
            <Link 
              href="/contact" 
              className="text-primary hover:underline font-medium"
            >
              Contact Support
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
