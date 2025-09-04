"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Star, 
  GitFork, 
  Eye, 
  Calendar, 
  ExternalLink,
  Code2,
  AlertCircle,
  Users,
  Globe,
  Download,
  Copy,
  Check,
  GitBranch
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

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

interface RepositoryDetailsModalProps {
  repository: Repository | null
  isOpen: boolean
  onClose: () => void
}

export function RepositoryDetailsModal({ repository, isOpen, onClose }: RepositoryDetailsModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false)

  if (!repository) return null

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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const formatSize = (bytes: number): string => {
    const sizes = ["B", "KB", "MB", "GB"]
    if (bytes === 0) return "0 B"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i]
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

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(repository.html_url)
      setCopiedUrl(true)
      toast({
        title: "URL copied",
        description: "Repository URL has been copied to clipboard",
      })
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy URL to clipboard",
        variant: "destructive",
      })
    }
  }

  const cloneUrl = `git clone ${repository.html_url}.git`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              className="h-12 w-12 rounded-full ring-2 ring-border"
            />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {repository.name}
              </DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground">
                {repository.owner.login}
              </DialogDescription>
              <p className="text-sm text-muted-foreground mt-2">
                {repository.description}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="flex items-center gap-2"
              >
                {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedUrl ? "Copied" : "Copy URL"}
              </Button>
              <Button
                size="sm"
                onClick={() => window.open(repository.html_url, "_blank")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on GitHub
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="clone">Clone</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(repository.stargazers_count)}</p>
                  <p className="text-sm text-muted-foreground">Stars</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <GitFork className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(repository.forks_count)}</p>
                  <p className="text-sm text-muted-foreground">Forks</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Eye className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(repository.watchers_count)}</p>
                  <p className="text-sm text-muted-foreground">Watchers</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{repository.open_issues_count}</p>
                  <p className="text-sm text-muted-foreground">Issues</p>
                </div>
              </div>
            </div>

            {/* Language and License */}
            <div className="flex items-center gap-6">
              {repository.language && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full ring-2 ring-border"
                    style={{ backgroundColor: getLanguageColor(repository.language) }}
                  />
                  <span className="text-sm font-medium text-foreground">{repository.language}</span>
                </div>
              )}
              {repository.license && (
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{repository.license.name}</span>
                </div>
              )}
            </div>

            {/* Topics */}
            {repository.topics.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {repository.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-sm">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Repository Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Size</span>
                    <span className="font-medium">{formatSize(repository.size * 1024)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Default Branch</span>
                    <span className="font-medium">{repository.default_branch}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="font-medium">{formatDate(repository.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="font-medium">{formatDate(repository.updated_at)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Total Stars</span>
                    <span className="font-medium">{formatNumber(repository.stargazers_count)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Total Forks</span>
                    <span className="font-medium">{formatNumber(repository.forks_count)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Watchers</span>
                    <span className="font-medium">{formatNumber(repository.watchers_count)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Issues & PRs</span>
                    <span className="font-medium">{repository.open_issues_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clone" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Clone Repository</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">HTTPS</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono text-foreground">
                      {cloneUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(cloneUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">SSH</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono text-foreground">
                      git@github.com:{repository.full_name}.git
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(`git@github.com:${repository.full_name}.git`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">About this repository</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {repository.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Repository Information</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Full Name:</strong> {repository.full_name}</p>
                    <p><strong>Language:</strong> {repository.language || "Not specified"}</p>
                    <p><strong>License:</strong> {repository.license?.name || "No license"}</p>
                    <p><strong>Size:</strong> {formatSize(repository.size * 1024)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Timeline</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Created:</strong> {formatDate(repository.created_at)}</p>
                    <p><strong>Last Updated:</strong> {formatDate(repository.updated_at)}</p>
                    <p><strong>Default Branch:</strong> {repository.default_branch}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
