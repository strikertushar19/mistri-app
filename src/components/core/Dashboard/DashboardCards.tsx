"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Github,
  GitlabIcon as Gitlab,
  FileArchive,
  Cloud,
  Clock,
  MoreHorizontal,
  ExternalLink,
  GitBranch
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Integration Components
interface IntegrationCardProps {
  platform: "github" | "gitlab" | "zip" | "aws" | "azure" | "gcp";
  name: string;
  description: string;
  status: "connected" | "pending" | "available";
  repoCount?: number;
  lastSync?: string;
}

export function IntegrationCard({
  platform,
  name,
  description,
  status,
  repoCount,
  lastSync
}: IntegrationCardProps) {
  const platformIcons = {
    github: <Github className="w-6 h-6" />,
    gitlab: <Gitlab className="w-6 h-6" />,
    zip: <FileArchive className="w-6 h-6" />,
    aws: <Cloud className="w-6 h-6" />,
    azure: <Cloud className="w-6 h-6" />,
    gcp: <Cloud className="w-6 h-6" />
  };

  const statusColors = {
    connected: "text-green-700 bg-green-100",
    pending: "text-yellow-700 bg-yellow-100",
    available: "text-gray-600 bg-gray-100"
  };

  const statusText = {
    connected: "Connected",
    pending: "Syncing",
    available: "Available"
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6 hover:shadow-sm transition-all duration-200 shadow-input">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-secondary rounded-lg text-muted-foreground">
            {platformIcons[platform]}
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {status === "connected" && repoCount && (
        <div className="mb-3">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-muted-foreground">Repositories: <span className="font-medium">{repoCount}</span></span>
            {lastSync && (
              <span className="text-muted-foreground">Last sync: <span className="font-medium">{lastSync}</span></span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          statusColors[status]
        )}>
          {statusText[status]}
        </span>
        
        {status === "available" ? (
          <Button size="sm" className="bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground">
            Connect
          </Button>
        ) : status === "connected" ? (
          <Button variant="outline" size="sm">
            Manage
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <Clock className="w-3 h-3 mr-1" />
            Syncing...
          </Button>
        )}
      </div>
    </div>
  );
}

function IntegrationCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-6 shadow-input">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded-md" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}


export function IntegrationsSection({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Integrations</h2>
          <Button variant="outline" className="text-sm">
            View all
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
          <IntegrationCardSkeleton />
        </div>
      </div>
    )
  }

  const integrations = [
    {
      platform: "github" as const,
      name: "GitHub",
      description: "Connect your GitHub repositories",
      status: "connected" as const,
      repoCount: 8,
      lastSync: "2 mins ago"
    },
    {
      platform: "gitlab" as const,
      name: "GitLab",
      description: "Connect your GitLab repositories",
      status: "available" as const
    },
    {
      platform: "zip" as const,
      name: "ZIP Upload",
      description: "Upload code as ZIP files",
      status: "available" as const
    },
    {
      platform: "aws" as const,
      name: "AWS CodeCommit",
      description: "Connect AWS CodeCommit repos",
      status: "pending" as const
    },
    {
      platform: "azure" as const,
      name: "Azure DevOps",
      description: "Connect Azure DevOps repos",
      status: "available" as const
    },
    {
      platform: "gcp" as const,
      name: "Google Cloud",
      description: "Connect Google Cloud Source repos",
      status: "available" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Integrations</h2>
        <Button variant="outline" className="text-sm">
          View all
          <ExternalLink className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration, index) => (
          <IntegrationCard key={index} {...integration} />
        ))}
      </div>
    </div>
  );
}

// Analysis Components
interface AnalysisCardProps {
  repository: string;
  branch: string;
  analysisType: "LLD" | "HLD" | "Security" | "Performance";
  score: number;
  status: "completed" | "in_progress" | "failed";
  lastRun: string;
  issues: number;
  commits: number;
}

export function AnalysisCard({
  repository,
  branch,
  analysisType,
  score,
  status,
  lastRun,
  issues,
  commits
}: AnalysisCardProps) {
  const statusColors = {
    completed: "text-green-700 bg-green-100",
    in_progress: "text-blue-700 bg-blue-100",
    failed: "text-red-700 bg-red-100"
  };

  const statusText = {
    completed: "Completed",
    in_progress: "Running",
    failed: "Failed"
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6 hover:shadow-sm transition-all duration-200 shadow-input">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-secondary rounded-lg">
            <GitBranch className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{repository}</h3>
            <p className="text-sm text-muted-foreground">{branch} • {analysisType} Analysis</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Score</p>
          <p className={cn("text-lg font-bold", getScoreColor(score))}>
            {score}/10
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Issues</p>
          <p className="text-lg font-bold text-card-foreground">{issues}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Commits</p>
          <p className="text-lg font-bold text-card-foreground">{commits}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          statusColors[status]
        )}>
          {statusText[status]}
        </span>
        <span className="text-sm text-muted-foreground">
          {lastRun}
        </span>
      </div>
    </div>
  );
}

function AnalysisCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-6 shadow-input">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <Skeleton className="h-6 w-6 rounded-md" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-5 w-8" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-5 w-10" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

export function RecentAnalysis({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent Analysis</h2>
          <Button variant="outline" className="text-sm">
            View all
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <AnalysisCardSkeleton />
          <AnalysisCardSkeleton />
        </div>
      </div>
    );
  }

  const analyses = [
    {
      repository: "mistri-backend",
      branch: "main",
      analysisType: "LLD" as const,
      score: 8.5,
      status: "completed" as const,
      lastRun: "2 hours ago",
      issues: 3,
      commits: 47
    },
    {
      repository: "frontend-app",
      branch: "develop",
      analysisType: "HLD" as const,
      score: 7.2,
      status: "completed" as const,
      lastRun: "5 hours ago",
      issues: 8,
      commits: 23
    },
    {
      repository: "api-gateway",
      branch: "main",
      analysisType: "Security" as const,
      score: 9.1,
      status: "in_progress" as const,
      lastRun: "Running...",
      issues: 1,
      commits: 15
    },
    {
      repository: "data-pipeline",
      branch: "feature/v2",
      analysisType: "Performance" as const,
      score: 6.8,
      status: "completed" as const,
      lastRun: "1 day ago",
      issues: 12,
      commits: 31
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Recent Analysis</h2>
        <Button variant="outline" className="text-sm">
          View all
          <ExternalLink className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {analyses.map((analysis, index) => (
          <AnalysisCard key={index} {...analysis} />
        ))}
      </div>
    </div>
  );
}