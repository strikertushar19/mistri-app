"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  GitFork, 
  Eye, 
  Calendar, 
  ExternalLink,
  Code2,
  AlertCircle,
  TrendingUp,
  GitBranch
} from "lucide-react"

interface Repository {
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
  open_pull_requests_count?: number
  default_branch: string
}

interface RepositoryCardProps {
  repository: Repository
  onViewDetails?: (repository: Repository) => void
}

export function RepositoryCard({ repository, onViewDetails }: RepositoryCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
    return `${Math.ceil(diffDays / 365)} years ago`
  }

  const getLanguageColor = (language: string): string => {
    const colors: { [key: string]: string } = {
      JavaScript: "#f7df1e",
      TypeScript: "#3178c6",
      Python: "#3776ab",
      Go: "#00add8",
      Rust: "#dea584",
      "C++": "#00599c",
      Java: "#ed8b00",
      "C#": "#239120",
      PHP: "#777bb4",
      Ruby: "#cc342d",
      Swift: "#fa7343",
      Kotlin: "#7f52ff",
      Dart: "#0175c2",
      C: "#a8b9cc",
      Shell: "#89e051",
      HTML: "#e34c26",
      CSS: "#1572b6",
      Vue: "#4fc08d",
      Angular: "#dd0031",
      Svelte: "#ff3e00"
    }
    return colors[language] || "#6b7280"
  }

  const getTrendingStatus = (stars: number, forks: number): { trending: boolean; level: string } => {
    if (stars > 100000 || forks > 20000) return { trending: true, level: "hot" }
    if (stars > 10000 || forks > 2000) return { trending: true, level: "rising" }
    if (stars > 1000 || forks > 200) return { trending: true, level: "popular" }
    return { trending: false, level: "normal" }
  }

  const { trending, level } = getTrendingStatus(repository.stargazers_count, repository.forks_count)

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border bg-card hover:bg-card/95">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              className="h-8 w-8 rounded-full flex-shrink-0 ring-2 ring-border"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold text-foreground truncate">
                  {repository.name}
                </CardTitle>
                {trending && (
                  <Badge 
                    variant={level === "hot" ? "destructive" : level === "rising" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {level}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {repository.owner.login}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              onClick={() => window.open(repository.owner.html_url, "_blank")}
              title="View organization"
            >
              <Code2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              onClick={() => window.open(repository.html_url, "_blank")}
              title="View repository"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">
          {repository.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Language and License */}
        <div className="flex items-center gap-4 mb-4">
          {repository.language && (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full ring-1 ring-border"
                style={{ backgroundColor: getLanguageColor(repository.language) }}
              />
              <span className="text-sm text-muted-foreground font-medium">{repository.language}</span>
            </div>
          )}
          {repository.license && (
            <span className="text-sm text-muted-foreground">{repository.license.name}</span>
          )}
        </div>

        {/* Topics */}
        {repository.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {repository.topics.slice(0, 4).map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs hover:bg-secondary/80 transition-colors">
                {topic}
              </Badge>
            ))}
            {repository.topics.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{repository.topics.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{formatNumber(repository.stargazers_count)}</span>
            <span className="text-xs">stars</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <GitFork className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{formatNumber(repository.forks_count)}</span>
            <span className="text-xs">forks</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="font-medium">{formatNumber(repository.open_issues_count)}</span>
            <span className="text-xs">issues & PRs</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Updated {formatDate(repository.updated_at)}</span>
          </div>
          {repository.open_issues_count > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span>{repository.open_issues_count} issues</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            onClick={() => onViewDetails?.(repository)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
