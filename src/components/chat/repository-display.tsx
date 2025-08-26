"use client"

import { useState, useEffect } from "react"
import { Repository, Organization, repositoryAPI, RepositoryAPIResponse, NoIntegrationResponse } from "@/lib/api/repositories"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Loader2, GitBranch, Users, ExternalLink, Lock, Unlock, RefreshCw, Database, Search, Filter, ChevronDown } from "lucide-react"
import Image from "next/image"

interface RepositoryDisplayProps {
  provider: 'github' | 'gitlab' | 'bitbucket'
  onRepositorySelect?: (repo: Repository) => void
}

export function RepositoryDisplay({ 
  provider, 
  onRepositorySelect
}: RepositoryDisplayProps) {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [allRepositories, setAllRepositories] = useState<Repository[]>([])
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([])
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name' | 'stars' | 'language'>('updated')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const providerConfig = {
    github: { name: 'GitHub', icon: '/github-mark.svg', color: 'text-[var(--text-primary)]' },
    gitlab: { name: 'GitLab', icon: '/gitlab-svgrepo-com.svg', color: 'text-[var(--text-primary)]' },
    bitbucket: { name: 'Bitbucket', icon: '/bitbucket.svg', color: 'text-[var(--text-primary)]' }
  }

  const config = providerConfig[provider]

  const fetchAllRepositories = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true)
      setError(null)

      // Clear cache if force refresh
      if (forceRefresh) {
        repositoryAPI.clearCache(provider)
      }

      let response: RepositoryAPIResponse
      switch (provider) {
        case 'github':
          response = await repositoryAPI.getGitHubRepositories(1, 100) // Get more repositories
          break
        case 'gitlab':
          response = await repositoryAPI.getGitLabRepositories(1, 100) // Get more repositories
          break
        case 'bitbucket':
          response = await repositoryAPI.getBitbucketRepositories(1, 100) // Get more repositories
          break
      }

      // Check if this is a no-integration response
      if ('integration' in response && response.integration === false) {
        setError(response.message)
        setAllRepositories([])
        setAllOrganizations([])
        return
      }

      // Handle normal repository response
      if ('repositories' in response) {
        setAllRepositories(response.repositories)
        setAllOrganizations(response.organizations)
      } else {
        setError(`Unexpected response format from ${config.name}`)
        setAllRepositories([])
        setAllOrganizations([])
      }
      
      // Check if data was cached
      const cacheStats = repositoryAPI.getCacheStats()
      setIsCached(cacheStats.providers.includes(provider))
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to fetch ${config.name} repositories`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllRepositories()
  }, [provider])

  // Sort and filter repositories
  const sortedAndFilteredRepositories = allRepositories
    .filter(repo =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'updated':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
        case 'created':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'stars':
          comparison = a.stars - b.stars
          break
        case 'language':
          const langA = a.language || 'Unknown'
          const langB = b.language || 'Unknown'
          comparison = langA.localeCompare(langB)
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Filter organizations based on search query
  const filteredOrganizations = allOrganizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.login.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (org.description && org.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading && repositories.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading {config.name} repositories...</span>
      </div>
    )
  }

  if (error) {
    const isAuthError = error.includes('authentication has expired') || error.includes('Please reconnect')
    const isNoIntegration = error.includes('Please integrate your') || error.includes('integration not found')
    
    return (
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Image
              src={config.icon}
              alt={`${config.name} icon`}
              width={20}
              height={20}
              className="w-5 h-5"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[var(--text-secondary)] text-sm mb-2">{error}</p>
            <div className="flex space-x-2">
              {isNoIntegration ? (
                <Button 
                  onClick={() => window.location.href = '/code-providers'} 
                  className="text-xs"
                  variant="outline"
                  size="sm"
                >
                  Connect Account
                </Button>
              ) : isAuthError ? (
                <>
                
                  <Button 
                    onClick={() => fetchAllRepositories(true)} 
                    className="text-xs"
                    variant="outline"
                    size="sm"
                  >
                    Retry
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => fetchAllRepositories(true)} 
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
            src={config.icon}
            alt={`${config.name} icon`}
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <h3 className={`font-semibold ${config.color}`}>
            {config.name} Repositories
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
          onClick={() => fetchAllRepositories(true)}
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
            placeholder={`Search ${config.name} repositories and organizations...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                  {sortBy === 'updated' && 'Last Updated'}
                  {sortBy === 'created' && 'Created Date'}
                  {sortBy === 'name' && 'Name'}
                  {sortBy === 'stars' && 'Stars'}
                  {sortBy === 'language' && 'Language'}
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
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
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
              {filteredOrganizations.map((org) => (
              <div
                key={org.id}
                className="p-3 border border-[var(--border-light)] rounded-lg bg-[var(--bg-secondary)] opacity-75 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {org.avatar_url ? (
                    <img 
                      src={org.avatar_url} 
                      alt={org.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {org.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {org.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {org.description || `${org.type} organization`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
          {sortedAndFilteredRepositories.map((repo) => (
            <div
              key={repo.id}
              onClick={() => onRepositorySelect?.(repo)}
              className="p-4 border border-[var(--border-light)] rounded-lg hover:bg-[var(--interactive-bg-secondary-hover)] cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {repo.private ? (
                      <Lock className="h-4 w-4 text-[var(--text-secondary)]" />
                    ) : (
                      <Unlock className="h-4 w-4 text-[var(--text-secondary)]" />
                    )}
                    <h5 className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {repo.name}
                    </h5>
                    {repo.fork && (
                      <span className="text-xs bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-2 py-1 rounded">
                        Fork
                      </span>
                    )}
                  </div>
                  
                  {repo.description && (
                    <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center">
                      <GitBranch className="h-3 w-3 mr-1" />
                      {repo.language || 'Unknown'}
                    </span>
                    {repo.stars > 0 && (
                      <span>⭐ {repo.stars}</span>
                    )}
                    {repo.forks > 0 && (
                      <span>🍴 {repo.forks}</span>
                    )}
                    <span>Updated {formatDate(repo.updated_at)}</span>
                  </div>
                </div>
                
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="ml-2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
