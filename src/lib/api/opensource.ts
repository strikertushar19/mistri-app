// Open Source APIs Integration
// This file contains API functions for various open source platforms

const API_BASE_URLS = {
  GITHUB: 'https://api.github.com',
  HUGGINGFACE: 'https://huggingface.co/api',
  DOCKER: 'https://hub.docker.com/v2',
  NPM: 'https://registry.npmjs.org',
  OLLAMA: 'http://localhost:11434/api'
}

// GitHub API
export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string
  created_at: string
  updated_at: string
  topics: string[]
  owner: {
    login: string
    avatar_url: string
    html_url: string
  }
  license?: {
    name: string
  }
  size: number
  open_issues_count: number
  open_pull_requests_count: number
  default_branch: string
}

export interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubRepository[]
}

export class GitHubAPI {
  private baseURL = API_BASE_URLS.GITHUB
  private token: string | null = null
  private hasToken: boolean = false

  constructor(token?: string) {
    this.token = token || null
    this.hasToken = !!token
  }

  private async request<T>(endpoint: string): Promise<T> {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Mistri-App'
    }

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, { headers })
    
    if (!response.ok) {
      // Handle rate limiting gracefully
      if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
        const resetTime = response.headers.get('X-RateLimit-Reset')
        const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : new Date(Date.now() + 3600000)
        throw new Error(`Rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}`)
      }
      
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Get current rate limit status
  async getRateLimit(): Promise<{ limit: number; remaining: number; reset: Date }> {
    const response = await fetch(`${this.baseURL}/rate_limit`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mistri-App',
        ...(this.token && { 'Authorization': `token ${this.token}` })
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get rate limit: ${response.status}`)
    }

    const data = await response.json()
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000)
    }
  }

  async searchRepositories(query: string, sort: string = 'stars', order: string = 'desc', perPage: number = 30): Promise<GitHubSearchResponse> {
    const params = new URLSearchParams({
      q: query,
      sort,
      order,
      per_page: perPage.toString()
    })
    
    const response = await this.request<GitHubSearchResponse>(`/search/repositories?${params}`)
    
    // Add open_pull_requests_count field to each repository (will be 0 initially)
    // We'll fetch PR counts only when needed (lazy loading)
    const reposWithPRField = response.items.map(repo => ({
      ...repo,
      open_pull_requests_count: 0 // Default value, will be updated when needed
    }))
    
    return {
      ...response,
      items: reposWithPRField
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const repoData = await this.request<GitHubRepository>(`/repos/${owner}/${repo}`)
    
    // Get pull requests count separately
    try {
      const prsCount = await this.getPullRequestsCount(owner, repo)
      repoData.open_pull_requests_count = prsCount
    } catch (error) {
      console.warn('Could not fetch pull requests count:', error)
      repoData.open_pull_requests_count = 0
    }
    
    return repoData
  }

  async getIssuesAndPRsCount(owner: string, repo: string): Promise<number> {
    try {
      // Use the search API to get both issues and PRs combined
      const query = `repo:${owner}/${repo}+is:issue+is:open`
      const issuesResponse = await this.request<{ total_count: number }>(`/search/issues?q=${encodeURIComponent(query)}`)
      
      const prQuery = `repo:${owner}/${repo}+is:pr+is:open`
      const prsResponse = await this.request<{ total_count: number }>(`/search/issues?q=${encodeURIComponent(prQuery)}`)
      
      const totalCount = issuesResponse.total_count + prsResponse.total_count
      console.log(`Issues + PRs for ${owner}/${repo}:`, { issues: issuesResponse.total_count, prs: prsResponse.total_count, total: totalCount })
      return totalCount
    } catch (error) {
      console.warn('Could not fetch issues and PRs count:', error)
      return 0
    }
  }

  // Batch method to get combined issues+PRs counts for multiple repositories efficiently
  async getBatchIssuesAndPRsCount(repositories: GitHubRepository[]): Promise<GitHubRepository[]> {
    // Process repositories in batches to avoid rate limits
    const batchSize = 5
    const results: GitHubRepository[] = []
    
    for (let i = 0; i < repositories.length; i += batchSize) {
      const batch = repositories.slice(i, i + batchSize)
      
      // Process batch with delay to respect rate limits
      const batchPromises = batch.map(async (repo) => {
        try {
          const combinedCount = await this.getIssuesAndPRsCount(repo.owner.login, repo.name)
          return { ...repo, open_issues_count: combinedCount, open_pull_requests_count: 0 }
        } catch (error) {
          console.warn(`Failed to get issues+PRs count for ${repo.full_name}:`, error)
          return { ...repo, open_pull_requests_count: 0 }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < repositories.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay
      }
    }
    
    return results
  }

  async getTrendingRepositories(since: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<GitHubRepository[]> {
    // GitHub doesn't have a direct trending API, so we'll search for popular repos
    const query = `stars:>1000 created:>${this.getDateFilter(since)}`
    const response = await this.searchRepositories(query, 'stars', 'desc', 30)
    return response.items
  }

  private getDateFilter(since: string): string {
    const date = new Date()
    switch (since) {
      case 'daily':
        date.setDate(date.getDate() - 1)
        break
      case 'weekly':
        date.setDate(date.getDate() - 7)
        break
      case 'monthly':
        date.setMonth(date.getMonth() - 1)
        break
    }
    return date.toISOString().split('T')[0]
  }
}

// Hugging Face API
export interface HuggingFaceModel {
  id: string
  name: string
  description: string
  downloads: number
  likes: number
  tags: string[]
  task: string
  library: string
  lastModified: string
  author: string
  size: string
  language: string[]
  license: string
  type: 'model' | 'dataset' | 'space'
}

export class HuggingFaceAPI {
  private baseURL = API_BASE_URLS.HUGGINGFACE

  async getModels(page: number = 0, limit: number = 20, search?: string): Promise<HuggingFaceModel[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: (page * limit).toString()
    })

    if (search) {
      params.append('search', search)
    }

    const response = await fetch(`${this.baseURL}/models?${params}`)
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.map((model: any) => ({
      id: model.id,
      name: model.id,
      description: model.cardData?.description || model.pipeline_tag || 'No description available',
      downloads: model.downloads || 0,
      likes: model.likes || 0,
      tags: model.tags || [],
      task: model.pipeline_tag || 'Unknown',
      library: model.library_name || 'transformers',
      lastModified: model.lastModified || new Date().toISOString(),
      author: model.author || 'Unknown',
      size: this.formatSize(model.safetensors?.total || 0),
      language: model.language || ['en'],
      license: model.cardData?.license || 'Unknown',
      type: 'model' as const
    }))
  }

  async getDatasets(page: number = 0, limit: number = 20): Promise<HuggingFaceModel[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: (page * limit).toString()
    })

    const response = await fetch(`${this.baseURL}/datasets?${params}`)
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.map((dataset: any) => ({
      id: dataset.id,
      name: dataset.id,
      description: dataset.cardData?.description || 'No description available',
      downloads: dataset.downloads || 0,
      likes: dataset.likes || 0,
      tags: dataset.tags || [],
      task: 'Dataset',
      library: 'datasets',
      lastModified: dataset.lastModified || new Date().toISOString(),
      author: dataset.author || 'Unknown',
      size: this.formatSize(dataset.size || 0),
      language: dataset.language || ['en'],
      license: dataset.cardData?.license || 'Unknown',
      type: 'dataset' as const
    }))
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Docker Hub API
export interface DockerImage {
  id: string
  name: string
  description: string
  pulls: number
  stars: number
  tags: string[]
  category: string
  lastUpdated: string
  size: string
  architecture: string[]
  official: boolean
  verified: boolean
  license: string
  maintainer: string
}

export class DockerHubAPI {
  private baseURL = API_BASE_URLS.DOCKER

  async searchRepositories(query: string, page: number = 1, pageSize: number = 20): Promise<DockerImage[]> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      page_size: pageSize.toString()
    })

    const response = await fetch(`${this.baseURL}/repositories/search?${params}`)
    
    if (!response.ok) {
      throw new Error(`Docker Hub API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.results.map((repo: any) => ({
      id: repo.name,
      name: repo.name,
      description: repo.description || 'No description available',
      pulls: repo.pull_count || 0,
      stars: repo.star_count || 0,
      tags: repo.tags || [],
      category: this.categorizeImage(repo.name),
      lastUpdated: repo.last_updated || new Date().toISOString(),
      size: 'Unknown',
      architecture: ['amd64', 'arm64'],
      official: repo.is_official || false,
      verified: repo.is_verified || false,
      license: 'Unknown',
      maintainer: repo.user || 'Unknown'
    }))
  }

  private categorizeImage(name: string): string {
    const categories = {
      'nginx': 'Web Server',
      'postgres': 'Database',
      'redis': 'Database',
      'node': 'Runtime',
      'python': 'Runtime',
      'ubuntu': 'Operating System',
      'mysql': 'Database',
      'mongo': 'Database'
    }
    
    return categories[name as keyof typeof categories] || 'Application'
  }
}

// NPM API
export interface NPMPackage {
  id: string
  name: string
  description: string
  downloads: number
  stars: number
  version: string
  tags: string[]
  category: string
  lastUpdated: string
  size: string
  license: string
  author: string
  homepage: string
  repository: string
  keywords: string[]
  dependencies: number
  devDependencies: number
  weeklyDownloads: number
  monthlyDownloads: number
}

export class NPMAPI {
  private baseURL = API_BASE_URLS.NPM

  async searchPackages(query: string, size: number = 20): Promise<NPMPackage[]> {
    const params = new URLSearchParams({
      text: query,
      size: size.toString()
    })

    const response = await fetch(`${this.baseURL}/-/v1/search?${params}`)
    
    if (!response.ok) {
      throw new Error(`NPM API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.objects.map((pkg: any) => ({
      id: pkg.package.name,
      name: pkg.package.name,
      description: pkg.package.description || 'No description available',
      downloads: pkg.package.downloads?.total || 0,
      stars: 0, // NPM doesn't provide star count
      version: pkg.package.version,
      tags: pkg.package.keywords || [],
      category: this.categorizePackage(pkg.package.name, pkg.package.keywords),
      lastUpdated: pkg.package.date || new Date().toISOString(),
      size: this.formatSize(pkg.package.dist?.unpackedSize || 0),
      license: pkg.package.license || 'Unknown',
      author: pkg.package.author?.name || 'Unknown',
      homepage: pkg.package.homepage || '',
      repository: pkg.package.repository?.url || '',
      keywords: pkg.package.keywords || [],
      dependencies: Object.keys(pkg.package.dependencies || {}).length,
      devDependencies: Object.keys(pkg.package.devDependencies || {}).length,
      weeklyDownloads: pkg.package.downloads?.weekly || 0,
      monthlyDownloads: pkg.package.downloads?.monthly || 0
    }))
  }

  async getPackage(name: string): Promise<NPMPackage> {
    const response = await fetch(`${this.baseURL}/${name}`)
    
    if (!response.ok) {
      throw new Error(`NPM API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return {
      id: data.name,
      name: data.name,
      description: data.description || 'No description available',
      downloads: data.downloads?.total || 0,
      stars: 0,
      version: data['dist-tags']?.latest || '0.0.0',
      tags: data.keywords || [],
      category: this.categorizePackage(data.name, data.keywords),
      lastUpdated: data.time?.modified || new Date().toISOString(),
      size: this.formatSize(data.dist?.unpackedSize || 0),
      license: data.license || 'Unknown',
      author: data.author?.name || 'Unknown',
      homepage: data.homepage || '',
      repository: data.repository?.url || '',
      keywords: data.keywords || [],
      dependencies: Object.keys(data.dependencies || {}).length,
      devDependencies: Object.keys(data.devDependencies || {}).length,
      weeklyDownloads: data.downloads?.weekly || 0,
      monthlyDownloads: data.downloads?.monthly || 0
    }
  }

  private categorizePackage(name: string, keywords: string[]): string {
    const categories = {
      'react': 'Frontend Framework',
      'vue': 'Frontend Framework',
      'angular': 'Frontend Framework',
      'express': 'Backend Framework',
      'koa': 'Backend Framework',
      'lodash': 'Utility Library',
      'axios': 'HTTP Client',
      'moment': 'Date Library',
      'webpack': 'Build Tool',
      'typescript': 'Language'
    }
    
    if (categories[name as keyof typeof categories]) {
      return categories[name as keyof typeof categories]
    }
    
    if (keywords?.some(k => k.includes('react') || k.includes('vue') || k.includes('angular'))) {
      return 'Frontend Framework'
    }
    
    if (keywords?.some(k => k.includes('express') || k.includes('koa') || k.includes('server'))) {
      return 'Backend Framework'
    }
    
    return 'Utility Library'
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Ollama API (Local)
export interface OllamaModel {
  id: string
  name: string
  description: string
  size: string
  downloads: number
  lastModified: string
  tags: string[]
  category: string
  performance: {
    speed: number
    accuracy: number
    memory: number
  }
  status: 'available' | 'downloading' | 'installed' | 'running'
}

export class OllamaAPI {
  private baseURL = API_BASE_URLS.OLLAMA

  async getModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseURL}/tags`)
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.models.map((model: any) => ({
        id: model.name,
        name: model.name,
        description: this.getModelDescription(model.name),
        size: this.formatSize(model.size),
        downloads: Math.floor(Math.random() * 1000000), // Mock data
        lastModified: model.modified_at || new Date().toISOString(),
        tags: this.getModelTags(model.name),
        category: this.getModelCategory(model.name),
        performance: {
          speed: Math.floor(Math.random() * 40) + 60,
          accuracy: Math.floor(Math.random() * 20) + 80,
          memory: Math.floor(Math.random() * 30) + 50
        },
        status: 'available' as const
      }))
    } catch (error) {
      console.warn('Ollama API not available:', error)
      return []
    }
  }

  async pullModel(name: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.statusText}`)
    }
  }

  private getModelDescription(name: string): string {
    const descriptions: { [key: string]: string } = {
      'llama2:7b': 'Meta\'s Llama 2 7B parameter model, optimized for general-purpose tasks',
      'codellama:13b': 'Code Llama 13B model specialized for code generation and understanding',
      'mistral:7b': 'Mistral 7B Instruct model with excellent instruction following',
      'neural-chat:7b': 'Intel\'s Neural Chat model optimized for conversational AI',
      'phi3:mini': 'Microsoft\'s Phi-3 Mini model with 3.8B parameters',
      'gemma:7b': 'Google\'s Gemma 7B model for research and development'
    }
    
    return descriptions[name] || 'A large language model for various AI tasks'
  }

  private getModelTags(name: string): string[] {
    const tags: { [key: string]: string[] } = {
      'llama2:7b': ['text-generation', 'chat', 'general-purpose', 'meta'],
      'codellama:13b': ['code-generation', 'programming', 'python', 'javascript'],
      'mistral:7b': ['instruction-following', 'chat', 'reasoning', 'french'],
      'neural-chat:7b': ['conversation', 'intel', 'optimized', 'chat'],
      'phi3:mini': ['microsoft', 'small-model', 'efficient', 'reasoning'],
      'gemma:7b': ['google', 'research', 'development', 'multilingual']
    }
    
    return tags[name] || ['ai', 'language-model']
  }

  private getModelCategory(name: string): string {
    const categories: { [key: string]: string } = {
      'llama2:7b': 'Large Language Model',
      'codellama:13b': 'Code Generation',
      'mistral:7b': 'Instruction Following',
      'neural-chat:7b': 'Conversational AI',
      'phi3:mini': 'Small Language Model',
      'gemma:7b': 'Research Model'
    }
    
    return categories[name] || 'Large Language Model'
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Export API instances
export const githubAPI = new GitHubAPI()
export const huggingFaceAPI = new HuggingFaceAPI()
export const dockerHubAPI = new DockerHubAPI()
export const npmAPI = new NPMAPI()
export const ollamaAPI = new OllamaAPI()
