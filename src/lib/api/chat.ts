import { apiClient } from './client'
import { API_CONFIG } from '@/config/api'

export interface ModelInfo {
  provider: string
  models: string[]
}

export interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  private: boolean
  fork: boolean
  url: string
  clone_url: string
  ssh_url: string
  language: string
  size: number
  stars: number
  forks: number
  updated_at: string
  created_at: string
  owner: {
    login: string
    avatar_url: string
    type: string
  }
}

export interface Organization {
  id: number
  name: string
  login: string
  description: string
  avatar_url: string
  url: string
  type: string
}

export interface ChatRequest {
  conversation_id?: string
  message: string
  system_message?: string
  model: string
  max_tokens?: number
  repositories?: Repository[]
  organizations?: Organization[]
}

export interface ChatResponse {
  conversation_id: string
  message_id: string
  response: string
  model: string
  timestamp: string
}

// Chat API
export const chatApi = {
  // Get available AI models
  getAvailableModels: async (): Promise<ModelInfo[]> => {
    const response = await apiClient.get('/chat/models')
    return response.data
  },

  // Send a message to AI and get response
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post('/chat/completion', data, {
      timeout: API_CONFIG.CHAT_TIMEOUT, // Extended timeout for chat operations
    })
    return response.data
  }
}
