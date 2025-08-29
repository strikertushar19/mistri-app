"use client"

import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"

interface Integration {
  avatar_url: string
  created_at: string
  email: string
  id: string
  is_active: boolean
  updated_at: string
  user: {
    avatar: string
    bitbucketIntegration: string
    created_at: string
    email: string
    first_name: string
    gitHubIntegration: string
    gitLabIntegration: string
    id: string
    is_active: boolean
    is_verified: boolean
    last_name: string
    provider: string
    refreshTokens: Array<{
      createdAt: string
      expiresAt: string
      id: string
      isRevoked: boolean
      token: string
      user: string
      userID: string
    }>
    sessions: Array<{
      clientIP: string
      createdAt: string
      expiresAt: string
      id: string
      isBlocked: boolean
      refreshToken: string
      user: string
      userAgent: string
      userID: string
    }>
    updated_at: string
  }
  user_id: string
  username: string
}

interface IntegrationResponse {
  bitbucket?: Integration
  github?: Integration
  gitlab?: Integration
}

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  private: boolean
}

interface RepositoryAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  repositories: Repository[]
  provider: string
}

function RepositoryAnalysisModal({ isOpen, onClose, repositories, provider }: RepositoryAnalysisModalProps) {
  const [selectedRepos, setSelectedRepos] = useState<Repository[]>([])
  const [analysisType, setAnalysisType] = useState<string>("lld_analysis")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")

  const handleRepoSelection = (repo: Repository, checked: boolean) => {
    if (checked && selectedRepos.length < 5) {
      setSelectedRepos([...selectedRepos, repo])
    } else if (!checked) {
      setSelectedRepos(selectedRepos.filter(r => r.id !== repo.id))
    }
  }

  // Filter repositories based on search query
  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (repo.language && repo.language.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAnalysis = async () => {
    if (selectedRepos.length === 0) {
      setError("Please select at least one repository")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        throw new Error('Not authenticated')
      }

      const requestBody = {
        is_multi_repo: selectedRepos.length > 1,
        multi_repository_urls: selectedRepos.map(repo => repo.html_url),
        multi_repo_names: selectedRepos.map(repo => repo.name),
        analysis_type: analysisType,
        model_used: "gemini-1.5-flash"
      }

      const response = await fetch(`${API_BASE_URL}/analysis/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error('Failed to create analysis job')
      }

      const data = await response.json()
      
      // Close modal and show success message
      onClose()
      // You can add a success notification here
      console.log('Analysis job created:', data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create analysis job')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-border shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-card-foreground">Select Repositories for Analysis</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-foreground">Analysis Type:</label>
          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lld_analysis">Low-Level Design (LLD) Analysis</SelectItem>
              <SelectItem value="hld_analysis">High-Level Design (HLD) Analysis</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            {analysisType === "hld_analysis" 
              ? "HLD analysis will first run LLD on all selected repositories, then generate a high-level design showing how they work together."
              : "LLD analysis will analyze each repository individually for detailed design patterns and architecture."
            }
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Select up to 5 repositories (currently selected: {selectedRepos.length}/5)
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search repositories by name, description, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAnalysis}
              disabled={selectedRepos.length === 0 || isAnalyzing}
            >
              {isAnalyzing ? 'Creating Analysis...' : `Analyze ${selectedRepos.length} Repository${selectedRepos.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredRepositories.length} of {repositories.length} repositories
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {filteredRepositories.map((repo) => {
            const isSelected = selectedRepos.some(r => r.id === repo.id)
            const isDisabled = !isSelected && selectedRepos.length >= 5
            
            return (
              <Card key={repo.id} className={`${isSelected ? 'ring-2 ring-primary' : ''} ${isDisabled ? 'opacity-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleRepoSelection(repo, e.target.checked)}
                      disabled={isDisabled}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-ring focus:ring-2"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate text-card-foreground">{repo.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{repo.description || 'No description'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {repo.language && (
                          <Badge variant="secondary" className="text-xs">
                            {repo.language}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated: {new Date(repo.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function CodeProvidersContent() {
  const [integrations, setIntegrations] = useState<IntegrationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showRepos, setShowRepos] = useState<string | null>(null)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        const response = await fetch(`${API_BASE_URL}/integrations`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch integrations')
        }

        const data = await response.json()
        setIntegrations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchIntegrations()
  }, [])

  // Handle URL parameters for OAuth success/error
  useEffect(() => {
    const success = searchParams.get('success')
    const provider = searchParams.get('provider')
    const error = searchParams.get('error')

    if (success === 'true' && provider) {
      setSuccessMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} integration successful!`)
      // Clear URL parameters to prevent infinite reload
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      url.searchParams.delete('provider')
      window.history.replaceState({}, '', url.toString())
      
      // Refresh integrations after successful OAuth
      setTimeout(() => {
        const fetchIntegrations = async () => {
          try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
            const response = await fetch(`${API_BASE_URL}/integrations`, {
              headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
              }
            })

            if (response.ok) {
              const data = await response.json()
              setIntegrations(data)
            }
          } catch (err) {
            console.error('Failed to refresh integrations:', err)
          }
        }
        fetchIntegrations()
      }, 2000)
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } else if (error) {
      setError(`OAuth error: ${error}`)
      // Clear error parameter
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  // Handle OAuth connection
  const handleConnect = async (provider: string) => {
    try {
      setConnecting(provider)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      
      // Check if user is authenticated
      const token = localStorage.getItem("accessToken")
      if (!token) {
        // Redirect to login if not authenticated
        router.push('/login')
        return
      }

      // Check if integration already exists
      if (integrations && integrations[provider as keyof IntegrationResponse]) {
        setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} is already connected`)
        setConnecting(null)
        return
      }

      // Make API call to get OAuth URL with proper authentication
      const response = await fetch(`${API_BASE_URL}/auth/${provider}/init`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth flow')
      }

      const data = await response.json()
      
      // Redirect to the OAuth URL
      window.location.href = data.oauth_url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setConnecting(null)
    }
  }

  // Handle disconnect
  const handleDisconnect = async (provider: string) => {
    try {
      setConnecting(provider)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`${API_BASE_URL}/integrations/${provider}/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      // Refresh integrations
      const integrationsResponse = await fetch(`${API_BASE_URL}/integrations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (integrationsResponse.ok) {
        const data = await integrationsResponse.json()
        setIntegrations(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    } finally {
      setConnecting(null)
    }
  }

  // Handle showing repositories
  const handleShowRepos = async (provider: string) => {
    setShowRepos(provider)
    setLoadingRepos(true)
    setError(null)

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Fetch repositories from the provider
      const response = await fetch(`${API_BASE_URL}/integrations/${provider}/repositories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }

      const data = await response.json()
      setRepositories(data.repositories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories')
    } finally {
      setLoadingRepos(false)
    }
  }

  // Handle closing repository view
  const handleCloseRepos = () => {
    setShowRepos(null)
    setRepositories([])
    setError(null)
  }

  if (loading) {
    return <div className="container mx-auto p-6 text-foreground">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto p-6 text-destructive">Error: {error}</div>
  }

  // Create default cards even if no integrations exist
  const providers = [
    { id: 'github', name: 'GitHub', icon: '/github-mark.svg' },
    { id: 'gitlab', name: 'GitLab', icon: '/gitlab-svgrepo-com.svg' },
    { id: 'bitbucket', name: 'Bitbucket', icon: '/bitbucket.svg' }
  ]

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Code Provider Integrations</h1>
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-primary/10 border border-primary text-primary rounded">
          {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider) => {
          const integration = integrations?.[provider.id as keyof IntegrationResponse]
          
          return (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Image
                    src={provider.icon}
                    alt={`${provider.name} icon`}
                    width={24}
                    height={24}
                    className="h-6 w-6"
                  />
                  <CardTitle className="capitalize">{provider.name}</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                {integration ? (
                  <CardDescription>
                    <div className="space-y-2">
                      <p><strong>Username:</strong> {integration.username}</p>
                      <p><strong>Email:</strong> {integration.email}</p>
                      <p><strong>Active:</strong> {integration.is_active ? 'Yes' : 'No'}</p>
                      <p><strong>Created:</strong> {new Date(integration.created_at).toLocaleDateString()}</p>
                      <p><strong>Updated:</strong> {new Date(integration.updated_at).toLocaleDateString()}</p>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleShowRepos(provider.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          View Repositories
                        </Button>
                        <Button
                          onClick={() => handleDisconnect(provider.id)}
                          disabled={connecting === provider.id}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          {connecting === provider.id ? 'Disconnecting...' : 'Disconnect'}
                        </Button>
                      </div>
                    </div>
                  </CardDescription>
                ) : (
                  <CardDescription>
                    <div className="space-y-2">
                      <p>Not connected</p>
                      <Button
                        onClick={() => handleConnect(provider.id)}
                        disabled={connecting === provider.id}
                        className="mt-2"
                      >
                        {connecting === provider.id ? 'Connecting...' : `Connect ${provider.name}`}
                      </Button>
                    </div>
                  </CardDescription>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Repository Analysis Modal */}
      <RepositoryAnalysisModal
        isOpen={showRepos !== null}
        onClose={handleCloseRepos}
        repositories={repositories}
        provider={showRepos || ''}
      />
    </div>
  )
}

export default function CodeProvidersPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Code Provider Integrations</h1>
        <div className="text-center py-8">
          <p>Loading integrations...</p>
        </div>
      </div>
    }>
      <CodeProvidersContent />
    </Suspense>
  )
}
