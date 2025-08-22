import api from '../api'
import { cacheRepositoryData } from '../cache/repository-cache'
import { toast } from '@/components/ui/use-toast'

// Repository and Organization interfaces
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

export interface RepositoryResponse {
  repositories: Repository[]
  organizations: Organization[]
  total: number
  page: number
  per_page: number
}

// Repository API functions
export const repositoryAPI = {
  // Get GitHub repositories and organizations
  async getGitHubRepositories(page: number = 1, perPage: number = 30): Promise<RepositoryResponse> {
    try {
      // Check cache first
      const cachedData = cacheRepositoryData.get('github', page, perPage)
      if (cachedData) {
        console.log('📦 Using cached GitHub data for page', page)
        return cachedData
      }

      console.log('🌐 Fetching GitHub data for page', page)
      const response = await api.get(`/repositories/github?page=${page}&per_page=${perPage}`)
      
      // Cache the response
      cacheRepositoryData.set('github', page, perPage, response.data)
      
      return response.data
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error)
      throw error
    }
  },

  // Get GitLab repositories and groups
  async getGitLabRepositories(page: number = 1, perPage: number = 30): Promise<RepositoryResponse> {
    try {
      // Check cache first
      const cachedData = cacheRepositoryData.get('gitlab', page, perPage)
      if (cachedData) {
        console.log('📦 Using cached GitLab data for page', page)
        return cachedData
      }

      console.log('🌐 Fetching GitLab data for page', page)
      const response = await api.get(`/repositories/gitlab?page=${page}&per_page=${perPage}`)
      
      // Cache the response
      cacheRepositoryData.set('gitlab', page, perPage, response.data)
      
      return response.data
    } catch (error: any) {
      console.error('Error fetching GitLab repositories:', error)
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || error.message
        if (errorMessage.includes('Please reconnect')) {
          toast({
            title: 'GitLab Authentication Expired',
            description: 'Please reconnect your GitLab account in the settings.',
            variant: 'destructive'
          })
          throw new Error('GitLab authentication has expired. Please reconnect your GitLab account in the settings.')
        }
        throw new Error('GitLab authentication failed. Please check your connection.')
      }
      
      // Handle other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      throw error
    }
  },

  // Get Bitbucket repositories and workspaces
  async getBitbucketRepositories(page: number = 1, perPage: number = 30): Promise<RepositoryResponse> {
    try {
      // Check cache first
      const cachedData = cacheRepositoryData.get('bitbucket', page, perPage)
      if (cachedData) {
        console.log('📦 Using cached Bitbucket data for page', page)
        return cachedData
      }

      console.log('🌐 Fetching Bitbucket data for page', page)
      const response = await api.get(`/repositories/bitbucket?page=${page}&per_page=${perPage}`)
      
      // Cache the response
      cacheRepositoryData.set('bitbucket', page, perPage, response.data)
      
      return response.data
    } catch (error: any) {
      console.error('Error fetching Bitbucket repositories:', error)
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || error.message
        if (errorMessage.includes('Please reconnect')) {
          toast({
            title: 'Bitbucket Authentication Expired',
            description: 'Please reconnect your Bitbucket account in the settings.',
            variant: 'destructive'
          })
          throw new Error('Bitbucket authentication has expired. Please reconnect your Bitbucket account in the settings.')
        }
        throw new Error('Bitbucket authentication failed. Please check your connection.')
      }
      
      // Handle other errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      throw error
    }
  },

  // Get all repositories from all providers
  async getAllRepositories(): Promise<{
    github?: RepositoryResponse
    gitlab?: RepositoryResponse
    bitbucket?: RepositoryResponse
  }> {
    const results: {
      github?: RepositoryResponse
      gitlab?: RepositoryResponse
      bitbucket?: RepositoryResponse
    } = {}

    try {
      results.github = await this.getGitHubRepositories()
    } catch (error) {
      console.warn('Failed to fetch GitHub repositories:', error)
    }

    try {
      results.gitlab = await this.getGitLabRepositories()
    } catch (error) {
      console.warn('Failed to fetch GitLab repositories:', error)
    }

    try {
      results.bitbucket = await this.getBitbucketRepositories()
    } catch (error) {
      console.warn('Failed to fetch Bitbucket repositories:', error)
    }

    return results
  },

  // Cache management functions
  clearCache: (provider?: string) => {
    cacheRepositoryData.clear(provider)
    console.log('🗑️ Cache cleared', provider ? `for ${provider}` : 'for all providers')
  },

  getCacheStats: () => {
    return cacheRepositoryData.getStats()
  },

  clearExpiredCache: () => {
    cacheRepositoryData.clearExpired()
    console.log('🧹 Expired cache entries cleared')
  }
}

export default repositoryAPI
