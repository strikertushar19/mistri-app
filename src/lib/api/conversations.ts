import { apiClient } from './client'

export interface Conversation {
  id: string
  user_id: string
  title: string
  is_archived: boolean
  is_deleted: boolean
  last_message?: string
  message_count: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  token_count?: number
  model_used?: string
  metadata?: string
  parent_id?: string
  is_edited: boolean
  edited_at?: string
  created_at: string
  updated_at: string
}

export interface CreateConversationRequest {
  title: string
}

export interface UpdateConversationRequest {
  title?: string
  is_archived?: boolean
}

export interface CreateMessageRequest {
  role: 'user' | 'assistant' | 'system'
  content: string
  parent_id?: string
  metadata?: Record<string, any>
}

export interface UpdateMessageRequest {
  content: string
}

export interface ConversationListResponse {
  conversations: Conversation[]
  total: number
  page: number
  per_page: number
  has_next: boolean
  has_prev: boolean
}

export interface MessageListResponse {
  messages: Message[]
  total: number
  page: number
  per_page: number
  has_next: boolean
  has_prev: boolean
}

export interface ConversationStatsResponse {
  total_conversations: number
  total_messages: number
  archived_count: number
  active_count: number
}

// Conversation Management API
export const conversationsApi = {
  // Get all conversations with pagination and filtering
  getConversations: async (params?: {
    page?: number
    per_page?: number
    search?: string
    archived?: boolean
  }): Promise<ConversationListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.archived !== undefined) searchParams.append('archived', params.archived.toString())

    const response = await apiClient.get(`/conversations?${searchParams.toString()}`)
    return response.data
  },

  // Create a new conversation
  createConversation: async (data: CreateConversationRequest): Promise<Conversation> => {
    const response = await apiClient.post('/conversations', data)
    return response.data
  },

  // Get a specific conversation with messages
  getConversation: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get(`/conversations/${id}`)
    return response.data
  },

  // Update conversation details
  updateConversation: async (id: string, data: UpdateConversationRequest): Promise<Conversation> => {
    const response = await apiClient.put(`/conversations/${id}`, data)
    return response.data
  },

  // Soft delete a conversation
  deleteConversation: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/conversations/${id}`)
    return response.data
  },

  // Archive/unarchive a conversation
  archiveConversation: async (id: string, archive: boolean): Promise<{ message: string }> => {
    const action = archive ? 'archive' : 'unarchive'
    const response = await apiClient.post(`/conversations/${id}/${action}`)
    return response.data
  },

  // Duplicate a conversation
  duplicateConversation: async (id: string): Promise<Conversation> => {
    const response = await apiClient.post(`/conversations/${id}/duplicate`)
    return response.data
  },

  // Search conversations
  searchConversations: async (query: string, params?: {
    page?: number
    per_page?: number
  }): Promise<ConversationListResponse> => {
    const searchParams = new URLSearchParams({ q: query })
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString())

    const response = await apiClient.get(`/conversations/search?${searchParams.toString()}`)
    return response.data
  },

  // Get conversation statistics
  getConversationStats: async (): Promise<ConversationStatsResponse> => {
    const response = await apiClient.get('/conversations/stats')
    return response.data
  },

  // Message Management API
  // Create a new message
  createMessage: async (conversationId: string, data: CreateMessageRequest): Promise<Message> => {
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, data)
    return response.data
  },

  // Get messages for a conversation
  getMessages: async (conversationId: string, params?: {
    page?: number
    per_page?: number
  }): Promise<MessageListResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString())

    const response = await apiClient.get(`/conversations/${conversationId}/messages?${searchParams.toString()}`)
    return response.data
  },

  // Update a message
  updateMessage: async (messageId: string, data: UpdateMessageRequest): Promise<Message> => {
    const response = await apiClient.put(`/messages/${messageId}`, data)
    return response.data
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/messages/${messageId}`)
    return response.data
  }
}
