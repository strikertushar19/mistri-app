"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  Github, 
  Star, 
  GitFork, 
  Eye, 
  Calendar, 
  Search, 
  ExternalLink,
  Code2,
  Users,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { RepositoryCard } from "@/components/opensource/repository-card"
import { RepositoryDetailsModal } from "@/components/opensource/repository-details-modal"
import { githubAPI, GitHubRepository } from "@/lib/api/opensource"
import { getConfig } from "@/lib/config/opensource"

const languages = ["All", "JavaScript", "TypeScript", "Python", "Go", "Rust", "C++", "Java", "C#", "PHP", "Ruby", "Swift", "Kotlin", "Dart", "C", "Shell", "HTML", "CSS", "Vue", "Angular", "Svelte"]
const sortOptions = [
  { value: "stars", label: "Most Stars" },
  { value: "forks", label: "Most Forks" },
  { value: "updated", label: "Recently Updated" },
  { value: "created", label: "Recently Created" }
]

export default function GitHubPage() {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepository[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("All")
  const [sortBy, setSortBy] = useState("stars")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRepository, setSelectedRepository] = useState<GitHubRepository | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [useRealAPI, setUseRealAPI] = useState(false)
  const [rateLimit, setRateLimit] = useState<{ limit: number; remaining: number; reset: Date } | null>(null)
  const [fetchPRCounts, setFetchPRCounts] = useState(false)

  // Demo data fallback
  const demoRepositories: GitHubRepository[] = [
    {
      id: 1,
      name: "next.js",
      full_name: "vercel/next.js",
      description: "The React Framework for the Web",
      html_url: "https://github.com/vercel/next.js",
      stargazers_count: 120000,
      forks_count: 28000,
      watchers_count: 120000,
      language: "JavaScript",
      created_at: "2016-10-05T23:32:51Z",
      updated_at: "2024-01-15T10:30:00Z",
      topics: ["react", "nextjs", "framework", "javascript", "typescript"],
      owner: {
        login: "vercel",
        avatar_url: "https://avatars.githubusercontent.com/u/14985020?v=4",
        html_url: "https://github.com/vercel"
      },
      license: { name: "MIT License" },
      size: 50000,
      open_issues_count: 175, // Combined issues + PRs
      open_pull_requests_count: 0,
      default_branch: "canary"
    },
    {
      id: 2,
      name: "react",
      full_name: "facebook/react",
      description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
      html_url: "https://github.com/facebook/react",
      stargazers_count: 220000,
      forks_count: 45000,
      watchers_count: 220000,
      language: "JavaScript",
      created_at: "2013-05-24T16:15:54Z",
      updated_at: "2024-01-15T08:45:00Z",
      topics: ["react", "javascript", "ui", "virtual-dom", "declarative"],
      owner: {
        login: "facebook",
        avatar_url: "https://avatars.githubusercontent.com/u/69631?v=4",
        html_url: "https://github.com/facebook"
      },
      license: { name: "MIT License" },
      size: 80000,
      open_issues_count: 245, // Combined issues + PRs
      open_pull_requests_count: 0,
      default_branch: "main"
    },
    {
      id: 3,
      name: "vscode",
      full_name: "microsoft/vscode",
      description: "Visual Studio Code",
      html_url: "https://github.com/microsoft/vscode",
      stargazers_count: 150000,
      forks_count: 26000,
      watchers_count: 150000,
      language: "TypeScript",
      created_at: "2015-09-03T20:56:07Z",
      updated_at: "2024-01-15T12:20:00Z",
      topics: ["vscode", "typescript", "editor", "ide", "electron"],
      owner: {
        login: "microsoft",
        avatar_url: "https://avatars.githubusercontent.com/u/6154722?v=4",
        html_url: "https://github.com/microsoft"
      },
      license: { name: "MIT License" },
      size: 120000,
      open_issues_count: 9200, // Combined issues + PRs
      open_pull_requests_count: 0,
      default_branch: "main"
    }
  ]

  // Load repositories on component mount
  useEffect(() => {
    loadRepositories()
  }, [])

  // Filter and sort repositories
  useEffect(() => {
    let filtered = repositories.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLanguage = selectedLanguage === "All" || repo.language === selectedLanguage
      return matchesSearch && matchesLanguage
    })

    // Sort repositories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "stars":
          return b.stargazers_count - a.stargazers_count
        case "forks":
          return b.forks_count - a.forks_count
        case "updated":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case "created":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    setFilteredRepos(filtered)
  }, [repositories, searchQuery, selectedLanguage, sortBy])

  const loadRepositories = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const config = getConfig()
      
      if (config.github.enabled) {
        // Use real GitHub API (with or without token)
        setUseRealAPI(true)
        const response = await githubAPI.searchRepositories(searchQuery || "stars:>1000", "stars", "desc", 30)
        console.log('GitHub API response:', response)
        
        // Get combined issues+PRs counts for repositories in batches to avoid rate limits (only if enabled)
        if (fetchPRCounts) {
          const repositoriesWithCombinedCounts = await githubAPI.getBatchIssuesAndPRsCount(response.items)
          console.log('Repositories with combined issues+PRs counts:', repositoriesWithCombinedCounts)
          setRepositories(repositoriesWithCombinedCounts)
        } else {
          console.log('Skipping combined count fetch to save API calls')
          setRepositories(response.items)
        }
        
        // Get rate limit info
        try {
          const rateLimitInfo = await githubAPI.getRateLimit()
          setRateLimit(rateLimitInfo)
        } catch (rateLimitErr) {
          console.warn('Could not fetch rate limit info:', rateLimitErr)
        }
      } else {
        // Use demo data
        setUseRealAPI(false)
        setRepositories(demoRepositories)
      }
    } catch (err) {
      console.error('Failed to load repositories:', err)
      setError(err instanceof Error ? err.message : 'Failed to load repositories')
      // Fallback to demo data
      setUseRealAPI(false)
      setRepositories(demoRepositories)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const config = getConfig()
      
      if (config.github.enabled) {
        const response = await githubAPI.searchRepositories(searchQuery, sortBy, "desc", 30)
        setRepositories(response.items)
        
        // Update rate limit info
        try {
          const rateLimitInfo = await githubAPI.getRateLimit()
          setRateLimit(rateLimitInfo)
        } catch (rateLimitErr) {
          console.warn('Could not fetch rate limit info:', rateLimitErr)
        }
      } else {
        // Filter demo data
        const filtered = demoRepositories.filter(repo =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setRepositories(filtered)
      }
    } catch (err) {
      console.error('Search failed:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (repository: GitHubRepository) => {
    setSelectedRepository(repository)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRepository(null)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-900/10 rounded-lg">
              <Github className="h-6 w-6 text-gray-900" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">GitHub</h1>
            {useRealAPI && (
              <Badge variant="default" className="ml-2">
                Live Data
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Discover and explore popular open source repositories
          </p>
        </div>

        {/* API Status */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">API Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={loadRepositories}
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Rate Limit Status */}
        {useRealAPI && rateLimit && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">GitHub API Status</p>
                <p className="text-sm text-blue-600">
                  {rateLimit.remaining} of {rateLimit.limit} requests remaining
                  {rateLimit.remaining < 10 && (
                    <span className="ml-2 text-orange-600 font-medium">
                      (Low - consider adding a GitHub token for higher limits)
                    </span>
                  )}
                </p>
                <p className="text-xs text-blue-500">
                  Resets at {rateLimit.reset.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-blue-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      rateLimit.remaining < 10 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(rateLimit.remaining / rateLimit.limit) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-blue-600 font-medium">
                  {Math.round((rateLimit.remaining / rateLimit.limit) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Repositories</CardTitle>
              <Code2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{repositories.length}</div>
              <p className="text-xs text-muted-foreground">
                {useRealAPI ? "Live data" : "Demo data"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all repositories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forks</CardTitle>
              <GitFork className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(repositories.reduce((sum, repo) => sum + repo.forks_count, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Community contributions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(repositories.map(repo => repo.owner.login)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique organizations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              Find repositories by name, description, or organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
            
            {/* Combined Count Toggle */}
            <div className="mt-4 flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium">Fetch Combined Issues+PRs Count</h4>
                <p className="text-xs text-muted-foreground">
                  Enable to show combined issues and PRs count (uses more API calls)
                </p>
              </div>
              <Switch
                checked={fetchPRCounts}
                onCheckedChange={setFetchPRCounts}
              />
            </div>
          </CardContent>
        </Card>

        {/* Repository Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => (
            <RepositoryCard
              key={repo.id}
              repository={repo}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {filteredRepos.length === 0 && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Github className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No repositories found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search criteria or filters
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Loading repositories...</h3>
              <p className="text-muted-foreground text-center">
                {useRealAPI ? "Fetching from GitHub API" : "Loading demo data"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Repository Details Modal */}
        <RepositoryDetailsModal
          repository={selectedRepository}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </DashboardLayout>
  )
}