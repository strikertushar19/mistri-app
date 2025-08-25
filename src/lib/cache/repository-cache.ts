import { Repository, Organization, RepositoryResponse, RepositoryAPIResponse } from '@/lib/api/repositories'

interface CachedData {
  data: RepositoryAPIResponse
  timestamp: number
  expiresAt: number
}

interface RepositoryCache {
  [provider: string]: {
    [page: string]: CachedData
  }
}

class RepositoryCacheManager {
  private cache: RepositoryCache = {}
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

  private getCacheKey(provider: string, page: number, perPage: number): string {
    return `${page}_${perPage}`
  }

  private isExpired(cachedData: CachedData): boolean {
    return Date.now() > cachedData.expiresAt
  }

  get(provider: string, page: number, perPage: number): RepositoryAPIResponse | null {
    const cacheKey = this.getCacheKey(provider, page, perPage)
    const providerCache = this.cache[provider]
    
    if (!providerCache || !providerCache[cacheKey]) {
      return null
    }

    const cachedData = providerCache[cacheKey]
    
    if (this.isExpired(cachedData)) {
      // Remove expired cache
      delete providerCache[cacheKey]
      return null
    }

    return cachedData.data
  }

  set(provider: string, page: number, perPage: number, data: RepositoryAPIResponse): void {
    const cacheKey = this.getCacheKey(provider, page, perPage)
    
    if (!this.cache[provider]) {
      this.cache[provider] = {}
    }

    this.cache[provider][cacheKey] = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    }
  }

  clear(provider?: string): void {
    if (provider) {
      delete this.cache[provider]
    } else {
      this.cache = {}
    }
  }

  clearExpired(): void {
    Object.keys(this.cache).forEach(provider => {
      Object.keys(this.cache[provider]).forEach(cacheKey => {
        const cachedData = this.cache[provider][cacheKey]
        if (this.isExpired(cachedData)) {
          delete this.cache[provider][cacheKey]
        }
      })
      
      // Remove empty provider cache
      if (Object.keys(this.cache[provider]).length === 0) {
        delete this.cache[provider]
      }
    })
  }

  getCacheStats(): { providers: string[], totalEntries: number } {
    const providers = Object.keys(this.cache)
    const totalEntries = providers.reduce((total, provider) => {
      return total + Object.keys(this.cache[provider]).length
    }, 0)

    return { providers, totalEntries }
  }
}

// Export singleton instance
export const repositoryCache = new RepositoryCacheManager()

// Cache wrapper functions for easier use
export const cacheRepositoryData = {
  get: (provider: string, page: number, perPage: number) => repositoryCache.get(provider, page, perPage),
  set: (provider: string, page: number, perPage: number, data: RepositoryAPIResponse) => repositoryCache.set(provider, page, perPage, data),
  clear: (provider?: string) => repositoryCache.clear(provider),
  clearExpired: () => repositoryCache.clearExpired(),
  getStats: () => repositoryCache.getCacheStats()
}

export default cacheRepositoryData
