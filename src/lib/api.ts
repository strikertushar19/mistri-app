import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  // Removed timeout to allow longer operations for chat and repository analysis
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          })

          const { access_token, refresh_token } = response.data
          localStorage.setItem("accessToken", access_token)
          localStorage.setItem("refreshToken", refresh_token)

          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface LoginData {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar?: string
  provider: string
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface IntegrationStatus {
  github?: {
    id: string
    user_id: string
    username: string
    email: string
    avatar_url: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
  gitlab?: {
    id: string
    user_id: string
    username: string
    email: string
    avatar_url: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
  bitbucket?: {
    id: string
    user_id: string
    username: string
    email: string
    avatar_url: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
}



export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data)
    return response.data
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data)
    return response.data
  },

  // Refresh token
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/refresh", {
      refresh_token: refreshToken,
    })
    return response.data
  },

  // Logout user
  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", {
      refresh_token: refreshToken,
    })
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/auth/me")
    return response.data
  },

  // Update user profile
  updateProfile: async (data: {
    first_name?: string
    last_name?: string
    avatar?: string
  }): Promise<User> => {
    const response = await api.put("/auth/profile", data)
    return response.data
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string; user: User }> => {
    const response = await api.post("/auth/verify-email", { token })
    return response.data
  },

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<void> => {
    await api.post("/auth/resend-verification", { email })
  },
}



export default api 