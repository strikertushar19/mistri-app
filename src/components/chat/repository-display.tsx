"use client"

import { useState, useEffect, useCallback } from "react"
import { Repository, Organization, repositoryAPI, RepositoryAPIResponse } from "@/lib/api/repositories"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Loader2, GitBranch, Users, ExternalLink, Lock, Unlock, RefreshCw, Search, Filter, ChevronDown } from "lucide-react"
import Image from "next/image"

interface RepositoryDisplayProps {
  provider: 'github' | 'gitlab' | 'bitbucket'
  onRepositorySelect?: (repo: Repository) => void
}

export function RepositoryDisplay({ 
  provider, 
  onRepositorySelect
}: RepositoryDisplayProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [allRepositories, setAllRepositories] = useState<Repository[]>([])
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([])
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name' | 'stars' | 'language'>('updated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Ensure loading is always a boolean
  const safeLoading = typeof loading === 'boolean' ? loading : true

  // Ensure error is always a string or null
  const safeError = error && typeof error === 'string' ? error : null

  // Ensure searchQuery is always a string
  const safeSearchQuery = typeof searchQuery === 'string' ? searchQuery : ''

  // Ensure arrays are always arrays
  const safeAllRepositories = Array.isArray(allRepositories) ? allRepositories : []
  const safeAllOrganizations = Array.isArray(allOrganizations) ? allOrganizations : []

  // Ensure sortBy and sortOrder have valid values
  const validSortBy = ['updated', 'created', 'name', 'stars', 'language'].includes(sortBy) ? sortBy : 'updated'
  const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc'

  const providerConfig = {
    github: { name: 'GitHub', icon: '/github-mark.svg', color: 'text-[var(--text-primary)]' },
    gitlab: { name: 'GitLab', icon: '/gitlab-svgrepo-com.svg', color: 'text-[var(--text-primary)]' },
    bitbucket: { name: 'Bitbucket', icon: '/bitbucket.svg', color: 'text-[var(--text-primary)]' }
  }

  const config = providerConfig[provider]

  const fetchAllRepositories = useCallback(async (forceRefresh: boolean = false) => {
    // Ensure repositoryAPI exists and has the required methods
    if (!repositoryAPI || typeof repositoryAPI !== 'object') {
      setError('Repository API not available')
      setAllRepositories([])
      setAllOrganizations([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Clear cache if force refresh
      if (forceRefresh) {
        if (repositoryAPI.clearCache && typeof repositoryAPI.clearCache === 'function') {
          repositoryAPI.clearCache(provider)
        }
      }

      let response: RepositoryAPIResponse
      switch (provider) {
        case 'github':
          if (repositoryAPI.getGitHubRepositories && typeof repositoryAPI.getGitHubRepositories === 'function') {
            response = await repositoryAPI.getGitHubRepositories(1, 100) // Get more repositories
          } else {
            throw new Error(`${config.name && typeof config.name === 'string' ? config.name : 'Unknown'} API method not available`)
          }
          break
        case 'gitlab':
          if (repositoryAPI.getGitLabRepositories && typeof repositoryAPI.getGitLabRepositories === 'function') {
            response = await repositoryAPI.getGitLabRepositories(1, 100) // Get more repositories
          } else {
            throw new Error(`${config.name && typeof config.name === 'string' ? config.name : 'Unknown'} API method not available`)
          }
          break
        case 'bitbucket':
          if (repositoryAPI.getBitbucketRepositories && typeof repositoryAPI.getBitbucketRepositories === 'function') {
            response = await repositoryAPI.getBitbucketRepositories(1, 100) // Get more repositories
          } else {
            throw new Error(`${config.name && typeof config.name === 'string' ? config.name : 'Unknown'} API method not available`)
          }
          break
        default:
          throw new Error(`Unknown provider: ${provider}`)
      }

      if (!response) {
        throw new Error(`No response received from ${config.name && typeof config.name === 'string' ? config.name : 'Unknown'}`)
      }

      // Check if this is a no-integration response
      if ('integration' in response && response.integration === false) {
        const message = response.message && typeof response.message === 'string' ? response.message : 'No integration found'
        setError(message)
        setAllRepositories([])
        setAllOrganizations([])
        return
      }

      // Handle normal repository response
      if ('repositories' in response) {
        const repos = response.repositories && Array.isArray(response.repositories) ? response.repositories : []
        const orgs = response.organizations && Array.isArray(response.organizations) ? response.organizations : []
        setAllRepositories(repos)
        setAllOrganizations(orgs)
      } else {
        setError(`Unexpected response format from ${config.name && typeof config.name === 'string' ? config.name : 'Unknown'}`)
        setAllRepositories([])
        setAllOrganizations([])
      }
    } catch (err: any) {
      let errorMessage = `Failed to fetch ${config.name && typeof config.name === 'string' ? config.name : 'Unknown'} repositories`
      if (err && err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message
      } else if (err && typeof err.message === 'string') {
        errorMessage = err.message
      }
      setError(errorMessage)
      setAllRepositories([])
      setAllOrganizations([])
    } finally {
      setLoading(false)
    }
  }, [provider, config.name])

  useEffect(() => {
    fetchAllRepositories()
  }, [provider, fetchAllRepositories])

  // Early returns for validation - after all hooks
  if (!provider || !['github', 'gitlab', 'bitbucket'].includes(provider)) {
    return (
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg">
        <p className="text-[var(--text-secondary)] text-sm">Invalid provider: {provider}</p>
      </div>
    )
  }

  if (!providerConfig || typeof providerConfig !== 'object') {
    return (
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg">
        <p className="text-[var(--text-secondary)] text-sm">Configuration error</p>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg">
        <p className="text-[var(--text-secondary)] text-sm">Invalid provider: {provider}</p>
      </div>
    )
  }

  // Sort and filter repositories
  const sortedAndFilteredRepositories = safeAllRepositories
    .filter(repo => {
      if (!repo || !repo.name || !repo.full_name) return false
      if (typeof repo.name !== 'string' || typeof repo.full_name !== 'string') return false
      if (typeof safeSearchQuery !== 'string') return true
      return repo.name.toLowerCase().includes(safeSearchQuery.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(safeSearchQuery.toLowerCase()) ||
        (repo.description && typeof repo.description === 'string' && repo.description.toLowerCase().includes(safeSearchQuery.toLowerCase()))
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (validSortBy) {
        case 'updated':
          if (a.updated_at && b.updated_at && typeof a.updated_at === 'string' && typeof b.updated_at === 'string') {
            comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          }
          break
        case 'created':
          if (a.created_at && b.created_at && typeof a.created_at === 'string' && typeof b.created_at === 'string') {
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          }
          break
        case 'name':
          if (a.name && b.name && typeof a.name === 'string' && typeof b.name === 'string') {
            comparison = a.name.localeCompare(b.name)
          }
          break
        case 'stars':
          if (typeof a.stars === 'number' && typeof b.stars === 'number') {
            comparison = a.stars - b.stars
          }
          break
        case 'language':
          const langA = a.language && typeof a.language === 'string' ? a.language : 'Unknown'
          const langB = b.language && typeof b.language === 'string' ? b.language : 'Unknown'
          comparison = langA.localeCompare(langB)
          break
      }
      
      return validSortOrder === 'asc' ? comparison : -comparison
    })

  // Filter organizations based on search query
  const filteredOrganizations = safeAllOrganizations.filter(org => {
    if (!org || !org.name || !org.login) return false
    if (typeof org.name !== 'string' || typeof org.login !== 'string') return false
    if (typeof safeSearchQuery !== 'string') return true
    return org.name.toLowerCase().includes(safeSearchQuery.toLowerCase()) ||
      org.login.toLowerCase().includes(safeSearchQuery.toLowerCase()) ||
      (org.description && typeof org.description === 'string' && org.description.toLowerCase().includes(safeSearchQuery.toLowerCase()))
  })

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  if (safeLoading && safeAllRepositories.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading {config.name && typeof config.name === 'string' ? config.name : 'Unknown'} repositories...</span>
      </div>
    )
  }

  if (safeError) {
    const errorMessage = safeError
    const isAuthError = errorMessage.includes('authentication has expired') || errorMessage.includes('Please reconnect')
    const isNoIntegration = errorMessage.includes('Please integrate your') || errorMessage.includes('integration not found')
    
    return (
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Image
              src={config.icon && typeof config.icon === 'string' ? config.icon : '/github-mark.svg'}
              alt={`${config.name} icon`}
              width={20}
              height={20}
              className="w-5 h-5"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[var(--text-secondary)] text-sm mb-2">{errorMessage}</p>
            <div className="flex space-x-2">
              {isNoIntegration ? (
                <Button 
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.location && window.location.href) {
                      window.location.href = '/code-providers'
                    }
                  }} 
                  className="text-xs"
                  variant="outline"
                  size="sm"
                >
                  Connect Account
                </Button>
              ) : isAuthError ? (
                <>
                
                  <Button 
                    onClick={() => fetchAllRepositories && typeof fetchAllRepositories === 'function' ? fetchAllRepositories(true) : undefined} 
                    className="text-xs"
                    variant="outline"
                    size="sm"
                  >
                    Retry
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => fetchAllRepositories && typeof fetchAllRepositories === 'function' ? fetchAllRepositories(true) : undefined} 
                  className="text-xs"
                  variant="outline"
                  size="sm"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image
            src={config.icon && typeof config.icon === 'string' ? config.icon : '/github-mark.svg'}
            alt={`${config.name} icon`}
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <h3 className={`font-semibold ${config.color && typeof config.color === 'string' ? config.color : 'text-[var(--text-primary)]'}`}>
            {config.name && typeof config.name === 'string' ? config.name : 'Unknown'} Repositories
          </h3>
          {/* {isCached && (
            <div className="flex items-center space-x-1 text-xs text-[var(--text-secondary)]">
              <Database className="h-3 w-3" />
              <span>Cached</span>
            </div>
          )} */}
        </div>
        <div className="flex items-center space-x-2">
                  <div className="text-sm text-[var(--text-secondary)]">
          {sortedAndFilteredRepositories.length} repositories
        </div>
        <Button
          onClick={() => fetchAllRepositories && typeof fetchAllRepositories === 'function' ? fetchAllRepositories(true) : undefined}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          title="Refresh data"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder={`Search ${config.name && typeof config.name === 'string' ? config.name : 'Unknown'} repositories and organizations...`}
            value={safeSearchQuery}
            onChange={(e) => setSearchQuery(e.target.value || '')}
            className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-primary)] focus:border-transparent"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs text-[var(--text-secondary)]">
            <Filter className="h-3 w-3" />
            <span>Sort by:</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs flex items-center space-x-1"
              >
                <span>
                  {validSortBy === 'updated' && 'Last Updated'}
                  {validSortBy === 'created' && 'Created Date'}
                  {validSortBy === 'name' && 'Name'}
                  {validSortBy === 'stars' && 'Stars'}
                  {validSortBy === 'language' && 'Language'}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              <DropdownMenuItem onClick={() => setSortBy('updated')}>
                Last Updated
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => setSortBy('created')}>
                Created Date
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('stars')}>
                Stars
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => setSortBy('language')}>
                Language
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setSortOrder(validSortOrder === 'asc' ? 'desc' : 'asc')}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            title={`Sort ${validSortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {validSortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Organizations */}
      {filteredOrganizations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[var(--text-primary)] flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Organizations ({filteredOrganizations.length})
          </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredOrganizations.map((org) => {
                if (!org || !org.id || !org.name) return null
                return (
              <div
                key={org.id}
                className="p-3 border border-[var(--border-light)] rounded-lg bg-[var(--bg-secondary)] opacity-75 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {org.avatar_url && typeof org.avatar_url === 'string' && org.avatar_url.trim() !== '' ? (
                    <Image 
                      src={org.avatar_url} 
                      alt={org.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {org.name && typeof org.name === 'string' && org.name.length > 0 ? org.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {org.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {org.description && typeof org.description === 'string' ? org.description : `${org.type || 'Unknown'} organization`}
                    </p>
                  </div>
                </div>
              </div>
                )
              })}
          </div>
        </div>
      )}

            {/* Repositories */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-[var(--text-primary)] flex items-center">
          <GitBranch className="h-4 w-4 mr-1" />
          Repositories ({sortedAndFilteredRepositories.length})
        </h4>
        <div className="space-y-2">
          {sortedAndFilteredRepositories.map((repo) => {
            if (!repo || !repo.id || !repo.name) return null
            return (
            <div
              key={repo.id}
              onClick={() => onRepositorySelect && typeof onRepositorySelect === 'function' ? onRepositorySelect(repo) : undefined}
              className="p-4 border border-[var(--border-light)] rounded-lg hover:bg-[var(--interactive-bg-secondary-hover)] cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {repo.private === true ? (
                      <Lock className="h-4 w-4 text-[var(--text-secondary)]" />
                    ) : (
                      <Unlock className="h-4 w-4 text-[var(--text-secondary)]" />
                    )}
                    <h5 className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {repo.name}
                    </h5>
                    {repo.fork === true && (
                      <span className="text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-2 py-1 rounded">
                        Fork
                      </span>
                    )}
                  </div>
                  
                  {repo.description && typeof repo.description === 'string' && (
                    <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center">
                      <GitBranch className="h-3 w-3 mr-1" />
                      {repo.language && typeof repo.language === 'string' ? repo.language : 'Unknown'}
                    </span>
                    {repo.stars && typeof repo.stars === 'number' && repo.stars > 0 && (
                      <span>⭐ {repo.stars}</span>
                    )}
                    {repo.forks && typeof repo.forks === 'number' && repo.forks > 0 && (
                      <span>🍴 {repo.forks}</span>
                    )}
                    <span>Updated {repo.updated_at && typeof repo.updated_at === 'string' ? formatDate(repo.updated_at) : 'Unknown'}</span>
                  </div>
                </div>
                
                <a
                  href={repo.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="ml-2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
