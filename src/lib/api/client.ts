import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { API_CONFIG, API_ERRORS, HTTP_STATUS } from '@/config/api'
import { TokenManager } from '@/lib/auth/token-manager'

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  // Removed global timeout to allow longer operations for chat
  headers: API_CONFIG.HEADERS,
})

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from TokenManager
    const token = TokenManager.getToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Try to refresh the token
      const refreshToken = TokenManager.getRefreshToken()
      if (refreshToken) {
        try {
          // Call refresh token endpoint
          const refreshResponse = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          })

          const { access_token, refresh_token } = refreshResponse.data

          // Update tokens
          TokenManager.setToken(access_token)
          if (refresh_token) {
            TokenManager.setRefreshToken(refresh_token)
          }

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          console.error('Token refresh failed:', refreshError)
          TokenManager.clearAllTokens()
          window.location.href = '/login'
          return Promise.reject(error)
        }
      } else {
        // No refresh token available, clear tokens and redirect to login
        TokenManager.clearAllTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      
      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timed out. This operation may take longer than expected. Please try again.')
      }
      
      throw new Error(API_ERRORS.NETWORK_ERROR)
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server error:', error.response.data)
      throw new Error(API_ERRORS.SERVER_ERROR)
    }
    
    // Handle other errors
    const responseData = error.response.data as any
    const errorMessage = responseData?.message || responseData?.error || API_ERRORS.UNKNOWN_ERROR
    
    // For authentication errors, preserve the specific message
    if (error.response.status === 401) {
      throw new Error(errorMessage)
    }
    
    throw new Error(errorMessage)
  }
)

export { apiClient }
