import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Check if we're in development mode and auth is not required
    const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"
    const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED === "true"
    
    // If in dev mode and auth is not required, allow all routes
    if (isDevMode && !authRequired) {
      return NextResponse.next()
    }
    
    // If user is not authenticated and trying to access protected routes
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if we're in development mode and auth is not required
        const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"
        const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED === "true"
        
        // If in dev mode and auth is not required, always allow
        if (isDevMode && !authRequired) {
          return true
        }
        
        // For production or when auth is required, check token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - signup (signup page)
     * - auth/callback (OAuth callback page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup|auth/callback).*)",
  ],
}


