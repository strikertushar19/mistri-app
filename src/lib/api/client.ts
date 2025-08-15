import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { API_CONFIG, API_ERRORS, HTTP_STATUS } from '@/config/api'
import { TokenManager } from '@/lib/auth/token-manager'

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
})

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from TokenManager
    const token = localStorage.getItem('accessToken')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      TokenManager.clearAllTokens()
      // You might want to redirect to login page here
      // window.location.href = '/login'
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      throw new Error(API_ERRORS.NETWORK_ERROR)
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server error:', error.response.data)
      throw new Error(API_ERRORS.SERVER_ERROR)
    }
    
    // Handle other errors
    const responseData = error.response.data as any
    const errorMessage = responseData?.error || responseData?.message || API_ERRORS.UNKNOWN_ERROR
    throw new Error(errorMessage)
  }
)

export { apiClient }
