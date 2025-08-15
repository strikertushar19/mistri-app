"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Github, Gitlab, Upload, Link, CheckCircle } from "lucide-react"

interface RepositoryConnectorProps {
  selectedRepository: string | null
  onRepositorySelect: (repo: string) => void
}

const demoRepositories = [
  {
    id: "repo-1",
    name: "mistri-app",
    provider: "github",
    url: "https://github.com/user/mistri-app",
    description: "Main application repository",
    lastAnalyzed: "2 hours ago",
    status: "connected"
  },
  {
    id: "repo-2", 
    name: "backend-api",
    provider: "gitlab",
    url: "https://gitlab.com/user/backend-api",
    description: "Backend API services",
    lastAnalyzed: "1 day ago",
    status: "connected"
  },
  {
    id: "repo-3",
    name: "frontend-ui",
    provider: "github", 
    url: "https://bitbucket.org/user/frontend-ui",
    description: "Frontend UI components",
    lastAnalyzed: "3 days ago",
    status: "connected"
  }
]

export function RepositoryConnector({ selectedRepository, onRepositorySelect }: RepositoryConnectorProps) {
  const [activeTab, setActiveTab] = useState("connected")
  const [newRepoUrl, setNewRepoUrl] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnectRepository = async () => {
    if (!newRepoUrl) return
    
    setIsConnecting(true)
    // Simulate API call
    setTimeout(() => {
      setIsConnecting(false)
      setNewRepoUrl("")
    }, 2000)
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "github": return <Github className="h-4 w-4" />
      case "gitlab": return <Gitlab className="h-4 w-4" />
      case "bitbucket": return <Github className="h-4 w-4" />
      default: return <Link className="h-4 w-4" />
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "github": return "bg-black text-white"
      case "gitlab": return "bg-orange-500 text-white"
      case "bitbucket": return "bg-blue-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Repository Connection
        </CardTitle>
        <CardDescription>
          Connect your repositories for code analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connected">Connected</TabsTrigger>
            <TabsTrigger value="add">Add New</TabsTrigger>
          </TabsList>

          <TabsContent value="connected" className="space-y-3">
            {demoRepositories.map((repo) => (
              <div
                key={repo.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRepository === repo.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => onRepositorySelect(repo.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${getProviderColor(repo.provider)}`}>
                      {getProviderIcon(repo.provider)}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{repo.name}</h4>
                      <p className="text-xs text-muted-foreground">{repo.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {repo.lastAnalyzed}
                    </Badge>
                    {selectedRepository === repo.id && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/user/repo"
                value={newRepoUrl}
                onChange={(e) => setNewRepoUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Repository Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="gitlab">GitLab</SelectItem>
                  <SelectItem value="bitbucket">Bitbucket</SelectItem>
                  <SelectItem value="custom">Custom Git</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleConnectRepository}
              disabled={!newRepoUrl || isConnecting}
              className="w-full"
            >
              {isConnecting ? "Connecting..." : "Connect Repository"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload Custom Code
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
