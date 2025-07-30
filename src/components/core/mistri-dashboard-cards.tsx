"use client";

import { cn } from "@/lib/utils";
import { 
  GitBranch,
  Code2,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  FileCode,
  Layers,
  Database,
  Server,
  Cloud,
  Github,
  GitlabIcon as Gitlab,
  FileArchive,
  Aws,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Star,
  Eye,
  GitCommit
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MistriMetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  subtitle?: string;
}

export function MistriMetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  subtitle 
}: MistriMetricCardProps) {
  const changeColor = {
    positive: "text-green-600",
    negative: "text-red-500", 
    neutral: "text-gray-500"
  }[changeType];

  const changeIcon = changeType === "positive" ? 
    <TrendingUp className="w-3 h-3" /> : 
    <TrendingDown className="w-3 h-3" />;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center space-x-1">
        <div className={cn("flex items-center space-x-1", changeColor)}>
          {changeIcon}
          <span className="text-sm font-medium">{change}</span>
        </div>
        {subtitle && (
          <span className="text-sm text-gray-500">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export function MistriDashboardMetrics() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MistriMetricCard
        title="Active Repositories"
        value="12"
        change="2 new"
        changeType="positive"
        icon={<GitBranch className="w-5 h-5 text-blue-600" />}
        subtitle="this month"
      />
      <MistriMetricCard
        title="Code Quality Score"
        value="8.7/10"
        change="+0.3"
        changeType="positive"
        icon={<Code2 className="w-5 h-5 text-green-600" />}
        subtitle="average across repos"
      />
      <MistriMetricCard
        title="Security Issues"
        value="3"
        change="-5"
        changeType="positive"
        icon={<Shield className="w-5 h-5 text-orange-600" />}
        subtitle="resolved this week"
      />
      <MistriMetricCard
        title="Architecture Debt"
        value="15%"
        change="-2%"
        changeType="positive"
        icon={<Layers className="w-5 h-5 text-purple-600" />}
        subtitle="technical debt ratio"
      />
    </div>
  );
}

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
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
            {platformIcons[platform]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {status === "connected" && repoCount && (
        <div className="mb-3">
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">Repositories: <span className="font-medium">{repoCount}</span></span>
            {lastSync && (
              <span className="text-gray-600">Last sync: <span className="font-medium">{lastSync}</span></span>
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
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
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

export function IntegrationsSection() {
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
        <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
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
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <GitBranch className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{repository}</h3>
            <p className="text-sm text-gray-600">{branch} • {analysisType} Analysis</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Score</p>
          <p className={cn("text-lg font-bold", getScoreColor(score))}>
            {score}/10
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Issues</p>
          <p className="text-lg font-bold text-gray-900">{issues}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Commits</p>
          <p className="text-lg font-bold text-gray-900">{commits}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          statusColors[status]
        )}>
          {statusText[status]}
        </span>
        <span className="text-sm text-gray-500">
          {lastRun}
        </span>
      </div>
    </div>
  );
}

export function RecentAnalysis() {
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
        <h2 className="text-xl font-semibold text-gray-900">Recent Analysis</h2>
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