"use client"

import { useState, useEffect } from "react"
import { Repository, Organization, repositoryAPI } from "@/lib/api/repositories"
import { RepositoryDisplay } from "./repository-display"
import { Button } from "@/components/ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  GitBranch, 
  MessageSquare, 
  X, 
  Maximize2, 
  Minimize2,
  Database,
  Trash2
} from "lucide-react"
import Image from "next/image"

interface RepositoryToolsProps {
  onRepositorySelect?: (repo: Repository) => void
}

export function RepositoryTools({ 
  onRepositorySelect
}: RepositoryToolsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'github' | 'gitlab' | 'bitbucket'>('github')
  const [cacheStats, setCacheStats] = useState<{ providers: string[], totalEntries: number }>({ providers: [], totalEntries: 0 })
  const [isInitialLoad, setIsInitialLoad] = useState(false)

  const handleRepositorySelect = (repo: Repository) => {
    onRepositorySelect?.(repo)
    // You can add logic here to insert repository info into chat
    console.log('Selected repository:', repo)
  }

  const handleOrganizationSelect = (org: Organization) => {
    // Organizations are now read-only, no longer selectable
    console.log('Organization (read-only):', org)
  }

  const updateCacheStats = () => {
    setCacheStats(repositoryAPI.getCacheStats())
  }

  const clearAllCache = () => {
    repositoryAPI.clearCache()
    updateCacheStats()
  }

  useEffect(() => {
    updateCacheStats()
    // Update cache stats every 30 seconds
    const interval = setInterval(updateCacheStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const providerIcons = {
    github: <Image src="/github-mark.svg" alt="GitHub" width={16} height={16} className="h-4 w-4" />,
    gitlab: <Image src="/gitlab-svgrepo-com.svg" alt="GitLab" width={16} height={16} className="h-4 w-4" />,
    bitbucket: <Image src="/bitbucket.svg" alt="Bitbucket" width={16} height={16} className="h-4 w-4" />
  }

  const handleExpand = async () => {
    setIsExpanded(true)
    
    // Fetch all providers in parallel on first expansion
    if (!isInitialLoad) {
      setIsInitialLoad(true)
      console.log('🚀 Fetching all providers in parallel...')
      
      // Fetch all providers simultaneously
      Promise.allSettled([
        repositoryAPI.getGitHubRepositories(1, 100),
        repositoryAPI.getGitLabRepositories(1, 100),
        repositoryAPI.getBitbucketRepositories(1, 100)
      ]).then((results) => {
        console.log('✅ All provider data fetched:', results.map((result, index) => ({
          provider: ['GitHub', 'GitLab', 'Bitbucket'][index],
          status: result.status,
          success: result.status === 'fulfilled'
        })))
      })
    }
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          onClick={handleExpand}
          className="bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--text-inverted)] shadow-lg rounded-full p-3 flex items-center space-x-2"
          size="sm"
        >
          <GitBranch className="h-5 w-5" />
          <span className="text-sm font-medium">Add Repos</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-96 max-h-[600px] bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-light)]">
        <div className="flex items-center space-x-2">
          <GitBranch className="h-5 w-5 text-[var(--text-primary)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Repository Tools</h3>
          {/* {cacheStats.totalEntries > 0 && (
            <div className="flex items-center space-x-1 text-xs text-[var(--text-secondary)]">
              <Database className="h-3 w-3" />
              <span>{cacheStats.totalEntries} cached</span>
            </div>
          )} */}
        </div>
        <div className="flex items-center space-x-1">
          {cacheStats.totalEntries > 0 && (
            <Button
              onClick={clearAllCache}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Clear all cache"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {/* Repository Limit Notice */}
        {/* <div className="mb-4 p-3 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-lg">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <Database className="h-4 w-4" />
            <span className="font-medium">Repository Limit</span>
          </div>
          <p className="text-xs text-blue-500 font-extrabold mt-1">
            Currently limited to <strong>1 repository</strong> per chat. Multiple repository support coming soon!
          </p>
        </div> */}
        
        <Tabs value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="github" className="flex items-center space-x-2">
              {providerIcons.github}
              <span>GitHub</span>
            </TabsTrigger>
            <TabsTrigger value="gitlab" className="flex items-center space-x-2">
              {providerIcons.gitlab}
              <span>GitLab</span>
            </TabsTrigger>
            <TabsTrigger value="bitbucket" className="flex items-center space-x-2">
              {providerIcons.bitbucket}
              <span>Bitbucket</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="mt-0">
            <RepositoryDisplay
              provider="github"
              onRepositorySelect={handleRepositorySelect}
            />
          </TabsContent>

          <TabsContent value="gitlab" className="mt-0">
            <RepositoryDisplay
              provider="gitlab"
              onRepositorySelect={handleRepositorySelect}
            />
          </TabsContent>

          <TabsContent value="bitbucket" className="mt-0">
            <RepositoryDisplay
              provider="bitbucket"
              onRepositorySelect={handleRepositorySelect}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-light)] bg-[var(--bg-secondary)] rounded-b-lg">
        <p className="text-xs text-[var(--text-secondary)] text-center">
          Click on repositories to add or remove them from your chat context
        </p>
        <p className="text-xs dark:text-yellow-500 font-extrabold text-center mt-1">
          ⚠️ Currently limited to 1 repository selection in context. Multiple repo support coming soon!
        </p>
      </div>
    </div>
  )
}
