// Open Source API Configuration
// This file contains configuration for various open source platform APIs

export interface OpenSourceConfig {
  github: {
    enabled: boolean
    token?: string
    rateLimit: number
    baseURL: string
  }
  huggingface: {
    enabled: boolean
    rateLimit: number
    baseURL: string
  }
  docker: {
    enabled: boolean
    token?: string
    rateLimit: number
    baseURL: string
  }
  npm: {
    enabled: boolean
    rateLimit: number
    baseURL: string
  }
  ollama: {
    enabled: boolean
    baseURL: string
    localOnly: boolean
  }
}

// Default configuration
export const defaultConfig: OpenSourceConfig = {
  github: {
    enabled: true,
    rateLimit: 5000,
    baseURL: 'https://api.github.com'
  },
  huggingface: {
    enabled: true,
    rateLimit: 1000,
    baseURL: 'https://huggingface.co/api'
  },
  docker: {
    enabled: true,
    rateLimit: 100,
    baseURL: 'https://hub.docker.com/v2'
  },
  npm: {
    enabled: true,
    rateLimit: 1000,
    baseURL: 'https://registry.npmjs.org'
  },
  ollama: {
    enabled: true,
    baseURL: 'http://localhost:11434/api',
    localOnly: true
  }
}

// Environment variable keys
export const ENV_KEYS = {
  GITHUB_TOKEN: 'NEXT_PUBLIC_GITHUB_TOKEN',
  DOCKER_TOKEN: 'NEXT_PUBLIC_DOCKER_TOKEN',
  HUGGINGFACE_TOKEN: 'NEXT_PUBLIC_HUGGINGFACE_TOKEN'
} as const

// Get configuration from environment variables
export function getConfig(): OpenSourceConfig {
  return {
    github: {
      enabled: defaultConfig.github.enabled,
      token: process.env[ENV_KEYS.GITHUB_TOKEN],
      rateLimit: process.env[ENV_KEYS.GITHUB_TOKEN] ? 5000 : 60, // 5000 with token, 60 without
      baseURL: defaultConfig.github.baseURL
    },
    huggingface: {
      enabled: defaultConfig.huggingface.enabled,
      rateLimit: defaultConfig.huggingface.rateLimit,
      baseURL: defaultConfig.huggingface.baseURL
    },
    docker: {
      enabled: defaultConfig.docker.enabled,
      token: process.env[ENV_KEYS.DOCKER_TOKEN],
      rateLimit: defaultConfig.docker.rateLimit,
      baseURL: defaultConfig.docker.baseURL
    },
    npm: {
      enabled: defaultConfig.npm.enabled,
      rateLimit: defaultConfig.npm.rateLimit,
      baseURL: defaultConfig.npm.baseURL
    },
    ollama: {
      enabled: defaultConfig.ollama.enabled,
      baseURL: defaultConfig.ollama.baseURL,
      localOnly: defaultConfig.ollama.localOnly
    }
  }
}

// Rate limiting utilities
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private limits: Map<string, number> = new Map()

  constructor(limits: { [key: string]: number }) {
    Object.entries(limits).forEach(([key, limit]) => {
      this.limits.set(key, limit)
    })
  }

  canMakeRequest(service: string): boolean {
    const limit = this.limits.get(service)
    if (!limit) return true

    const now = Date.now()
    const requests = this.requests.get(service) || []
    
    // Remove requests older than 1 hour
    const recentRequests = requests.filter(time => now - time < 3600000)
    
    if (recentRequests.length >= limit) {
      return false
    }

    recentRequests.push(now)
    this.requests.set(service, recentRequests)
    return true
  }

  getRemainingRequests(service: string): number {
    const limit = this.limits.get(service)
    if (!limit) return Infinity

    const now = Date.now()
    const requests = this.requests.get(service) || []
    const recentRequests = requests.filter(time => now - time < 3600000)
    
    return Math.max(0, limit - recentRequests.length)
  }
}

// Error handling utilities
export class OpenSourceAPIError extends Error {
  constructor(
    public service: string,
    public status: number,
    public message: string,
    public originalError?: Error
  ) {
    super(`${service} API Error (${status}): ${message}`)
    this.name = 'OpenSourceAPIError'
  }
}

// Retry utility for failed requests
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError!
}

// Cache utilities
export class APICache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Export singleton instances
export const rateLimiter = new RateLimiter({
  github: 5000,
  huggingface: 1000,
  docker: 100,
  npm: 1000
})

export const apiCache = new APICache()
