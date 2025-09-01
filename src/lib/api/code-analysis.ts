// Code Analysis API Service
// This file contains functions for code analysis operations
import { apiClient } from './client'

export interface Repository {
  id: string
  name: string
  provider: 'github' | 'gitlab' | 'bitbucket' | 'custom'
  url: string
  description?: string
  lastAnalyzed?: string
  status: 'connected' | 'disconnected' | 'analyzing'
}

export interface AnalysisType {
  id: string
  name: string
  description: string
  estimatedTime: string
  priority: 'high' | 'medium' | 'low'
  features: string[]
}

export interface AnalysisRequest {
  repositoryId: string
  analysisType: string
  options?: {
    includePatterns?: string[]
    excludePatterns?: string[]
    depth?: number
    timeout?: number
  }
}

export interface AnalysisResult {
  id: string
  repositoryId: string
  analysisType: string
  status: 'pending' | 'analyzing' | 'completed' | 'failed'
  score: number
  issues: number
  recommendations: number
  startedAt: string
  completedAt?: string
  duration?: string
  results: {
    components?: ComponentAnalysis[]
    patterns?: string[]
    architecture?: ArchitectureAnalysis
    dataFlow?: string[]
    metrics?: AnalysisMetrics
  }
  error?: string
}

export interface ComponentAnalysis {
  name: string
  type: string
  complexity: 'Low' | 'Medium' | 'High'
  issues: number
  status: 'good' | 'warning' | 'critical'
  details?: any
}

export interface ArchitectureAnalysis {
  type: string
  layers: string[]
  components: string[]
  dataFlow: string[]
}

export interface AnalysisMetrics {
  codeQuality: number
  securityScore: number
  performanceScore: number
  maintainability: number
  testCoverage?: number
}

// Repository Management APIs
export const repositoryAPI = {
  // Get all connected repositories
  async getRepositories(): Promise<Repository[]> {
    // TODO: Implement API call to fetch repositories
    // Example: return fetch('/api/repositories').then(res => res.json())
    throw new Error('Not implemented: getRepositories')
  },

  // Connect a new repository
  async connectRepository(url: string, provider: string): Promise<Repository> {
    // TODO: Implement API call to connect repository
    // Example: return fetch('/api/repositories', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ url, provider })
    // }).then(res => res.json())
    throw new Error('Not implemented: connectRepository')
  },

  // Disconnect a repository
  async disconnectRepository(repositoryId: string): Promise<void> {
    // TODO: Implement API call to disconnect repository
    // Example: return fetch(`/api/repositories/${repositoryId}`, {
    //   method: 'DELETE'
    // })
    throw new Error('Not implemented: disconnectRepository')
  },

  // Upload custom code
  async uploadCustomCode(files: File[]): Promise<Repository> {
    // TODO: Implement API call to upload custom code
    // Example: const formData = new FormData()
    // files.forEach(file => formData.append('files', file))
    // return fetch('/api/repositories/upload', {
    //   method: 'POST',
    //   body: formData
    // }).then(res => res.json())
    throw new Error('Not implemented: uploadCustomCode')
  }
}

// Analysis Management APIs (Legacy - keeping for compatibility)
export const legacyAnalysisAPI = {
  // Get available analysis types
  async getAnalysisTypes(): Promise<AnalysisType[]> {
    // TODO: Implement API call to fetch analysis types
    // Example: return fetch('/api/analysis/types').then(res => res.json())
    throw new Error('Not implemented: getAnalysisTypes')
  },

  // Start a new analysis
  async startAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
    // TODO: Implement API call to start analysis
    // Example: return fetch('/api/analysis', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(request)
    // }).then(res => res.json())
    throw new Error('Not implemented: startAnalysis')
  },

  // Get analysis status and results
  async getAnalysisResult(analysisId: string): Promise<AnalysisResult> {
    // TODO: Implement API call to get analysis result
    // Example: return fetch(`/api/analysis/${analysisId}`).then(res => res.json())
    throw new Error('Not implemented: getAnalysisResult')
  },

  // Get analysis history
  async getAnalysisHistory(repositoryId?: string): Promise<AnalysisResult[]> {
    // TODO: Implement API call to get analysis history
    // Example: const params = repositoryId ? `?repositoryId=${repositoryId}` : ''
    // return fetch(`/api/analysis/history${params}`).then(res => res.json())
    throw new Error('Not implemented: getAnalysisHistory')
  },

  // Cancel an ongoing analysis
  async cancelAnalysis(analysisId: string): Promise<void> {
    // TODO: Implement API call to cancel analysis
    // Example: return fetch(`/api/analysis/${analysisId}/cancel`, {
    //   method: 'POST'
    // })
    throw new Error('Not implemented: cancelAnalysis')
  },

  // Export analysis results
  async exportAnalysis(analysisId: string, format: 'pdf' | 'json' | 'csv'): Promise<Blob> {
    // TODO: Implement API call to export analysis
    // Example: return fetch(`/api/analysis/${analysisId}/export?format=${format}`)
    //   .then(res => res.blob())
    throw new Error('Not implemented: exportAnalysis')
  }
}

// Real-time Analysis APIs
export const realtimeAPI = {
  // Subscribe to analysis progress updates
  subscribeToProgress(analysisId: string, callback: (progress: any) => void): () => void {
    // TODO: Implement WebSocket or Server-Sent Events connection
    // Example: const ws = new WebSocket(`ws://localhost:3000/api/analysis/${analysisId}/progress`)
    // ws.onmessage = (event) => callback(JSON.parse(event.data))
    // return () => ws.close()
    throw new Error('Not implemented: subscribeToProgress')
  },

  // Get real-time analysis metrics
  subscribeToMetrics(callback: (metrics: any) => void): () => void {
    // TODO: Implement real-time metrics subscription
    throw new Error('Not implemented: subscribeToMetrics')
  }
}

// Utility functions for API error handling
export const apiUtils = {
  // Handle API errors consistently
  handleError(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.message) {
      return error.message
    }
    return 'An unexpected error occurred'
  },

  // Retry failed requests
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        }
      }
    }
    
    throw lastError
  }
}

// Analysis API interfaces
export interface AnalysisJob {
  id: string
  user_id: string
  repository_url: string
  repository_name: string
  analysis_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  model_used: string
  commit_hash?: string
  commit_message?: string
  commit_date?: string // Added field
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface AnalysisResultDetail {
  id: string
  job_id: string
  analysis_type: string
  status: string
  summary?: string
  key_insights: string[]
  created_at: string
}

export interface AnalysisDetailResponse {
  job: AnalysisJob
  result: AnalysisResultDetail
  analysis_data: any
  formatted_data: any
}

export interface AnalysisInsightsResponse {
  job_id: string
  repository_name: string
  analysis_type: string
  summary?: string
  key_insights: string[]
  recommendations: string[]
  design_patterns: any[]
  architecture: any
  created_at: string
}

export interface AnalysisDiagramsResponse {
  job_id: string
  diagrams: any
  created_at: string
}

// Analysis API functions
export const analysisAPI = {
  // Get detailed analysis result
  async getAnalysisResult(jobId: string): Promise<AnalysisDetailResponse> {
    try {
      const response = await apiClient.get(`/analysis/jobs/${jobId}/result`)
      return response.data
    } catch (error) {
      throw new Error(apiUtils.handleError(error))
    }
  },

  // Get analysis insights
  async getAnalysisInsights(jobId: string): Promise<AnalysisInsightsResponse> {
    try {
      const response = await apiClient.get(`/analysis/jobs/${jobId}/insights`)
      return response.data
    } catch (error) {
      throw new Error(apiUtils.handleError(error))
    }
  },

  // Get analysis diagrams
  async getAnalysisDiagrams(jobId: string): Promise<AnalysisDiagramsResponse> {
    try {
      const response = await apiClient.get(`/analysis/jobs/${jobId}/diagrams`)
      return response.data
    } catch (error) {
      throw new Error(apiUtils.handleError(error))
    }
  },

  // List analysis jobs
  async listAnalysisJobs(params?: {
    status?: string
    analysis_type?: string
    limit?: number
    offset?: number
  }): Promise<{ jobs: AnalysisJob[]; total: number }> {
    try {
      const response = await apiClient.get('/analysis/jobs', { params })
      return response.data
    } catch (error) {
      throw new Error(apiUtils.handleError(error))
    }
  },

  // Get specific analysis job
  async getAnalysisJob(jobId: string): Promise<AnalysisJob> {
    try {
      const response = await apiClient.get(`/analysis/jobs/${jobId}`)
      return response.data
    } catch (error) {
      throw new Error(apiUtils.handleError(error))
    }
  },

  // Create analysis chat context
  async createAnalysisChatContext(data: {
    conversation_id: string
    job_id: string
    context_type: string
  }): Promise<any> {
    try {
      const response = await apiClient.post('/analysis/chat-context', data)
      return response.data
    } catch (error) {
      throw new Error(apiUtils.handleError(error))
    }
  },

  // Get analysis chat context
  async getAnalysisChatContext(conversationId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/analysis/chat-context/${conversationId}`)
      return response.data
    } catch (error) {
      throw new Error(apiUtils.handleError(error))
    }
  }
}
