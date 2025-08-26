import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" }
      },
      async authorize(credentials) {
        // Handle OAuth callback with tokens
        if (credentials?.accessToken && credentials?.refreshToken) {
          try {
            // Verify token with backend to get current user
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
              headers: {
                Authorization: `Bearer ${credentials.accessToken}`
              }
            })

            const user = response.data
            
            // Check if user already exists and is active
            if (user && user.id && user.is_active) {
              // Store user data in localStorage for future use
              if (typeof window !== 'undefined') {
                const userStorage = {
                  setUserData: (data: any) => {
                    try {
                      localStorage.setItem('userData', JSON.stringify(data))
                    } catch (error) {
                      console.error('Error saving user data:', error)
                    }
                  }
                }
                
                userStorage.setUserData({
                  id: user.id,
                  email: user.email,
                  firstName: user.first_name,
                  lastName: user.last_name,
                  avatarUrl: user.avatar,
                  createdAt: user.created_at,
                  provider: user.provider || 'oauth'
                })
              }
              
              return {
                id: user.id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
                firstName: user.first_name,
                lastName: user.last_name,
                avatar: user.avatar,
                accessToken: credentials.accessToken,
                refreshToken: credentials.refreshToken,
              }
            } else {
              console.error("User not found or inactive:", user)
              return null
            }
          } catch (error) {
            console.error("Token verification error:", error)
            return null
          }
        }

        // Handle email/password login
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          })

          const { user, access_token, refresh_token } = response.data

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            firstName: user.first_name,
            lastName: user.last_name,
            avatar: user.avatar,
            accessToken: access_token,
            refreshToken: refresh_token,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.avatar = user.avatar
        
        // Store tokens in localStorage for API client access
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', user.accessToken)
          localStorage.setItem('refreshToken', user.refreshToken)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub
        session.user.accessToken = token.accessToken
        session.user.refreshToken = token.refreshToken
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.avatar = token.avatar
        
        // Ensure tokens are always available in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token.accessToken)
          localStorage.setItem('refreshToken', token.refreshToken)
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signOut() {
      // Clear localStorage on sign out
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    }
  }
}


