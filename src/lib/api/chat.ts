import { apiClient } from './client'

export interface ModelInfo {
  provider: string
  models: string[]
}

export interface ChatRequest {
  conversation_id?: string
  message: string
  system_message?: string
  model: string
  max_tokens?: number
}

export interface ChatResponse {
  conversation_id: string
  message_id: string
  response: string
  model: string
  cost?: {
    provider: string
    model: string
    input_tokens: number
    output_tokens: number
    input_cost: number
    output_cost: number
    total_cost: number
  }
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
    const response = await apiClient.post('/chat/completion', data)
    return response.data
  }
}
