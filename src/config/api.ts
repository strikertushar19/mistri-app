// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  
  // Timeout for API requests (30 seconds)
  TIMEOUT: 30000,
  
  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
    },
    
    // Conversations
    CONVERSATIONS: {
      LIST: '/conversations',
      CREATE: '/conversations',
      GET: (id: string) => `/conversations/${id}`,
      UPDATE: (id: string) => `/conversations/${id}`,
      DELETE: (id: string) => `/conversations/${id}`,
      ARCHIVE: (id: string, action: 'archive' | 'unarchive') => `/conversations/${id}/${action}`,
      DUPLICATE: (id: string) => `/conversations/${id}/duplicate`,
      SEARCH: '/conversations/search',
      STATS: '/conversations/stats',
      MESSAGES: (id: string) => `/conversations/${id}/messages`,
    },
    
    // Messages
    MESSAGES: {
      UPDATE: (id: string) => `/messages/${id}`,
      DELETE: (id: string) => `/messages/${id}`,
    },
    
    // Chat
    CHAT: {
      MODELS: '/chat/models',
      COMPLETION: '/chat/completion',
    },
    
    // Repositories
    REPOSITORIES: {
      GITHUB: '/repositories/github',
      GITLAB: '/repositories/gitlab',
      BITBUCKET: '/repositories/bitbucket',
    },
    
    // Provider Integrations
    INTEGRATIONS: {
      GITHUB: '/auth/github',
      GITLAB: '/auth/gitlab',
      BITBUCKET: '/auth/bitbucket',
      CALLBACK: {
        GITHUB: '/auth/github/callback',
        GITLAB: '/auth/gitlab/callback',
        BITBUCKET: '/auth/bitbucket/callback',
      },
    },
  },
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
  },
}

// Error messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Invalid data provided.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
}

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
}
