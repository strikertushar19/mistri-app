"use client";

import { cn } from "@/lib/utils";
import { 
  GitBranch,
  Code2,
  Shield,
  Layers,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  subtitle?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  subtitle 
}: MetricCardProps) {
  const changeColor = {
    positive: "text-green-600",
    negative: "text-red-500", 
    neutral: "text-muted-foreground"
  }[changeType];

  const changeIcon = changeType === "positive" ? 
    <TrendingUp className="w-3 h-3" /> : 
    <TrendingDown className="w-3 h-3" />;

  return (
    <div className="bg-card rounded-xl border border-border/50 p-6 hover:shadow-sm transition-all duration-200 shadow-input">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-secondary rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold text-card-foreground mt-1">{value}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center space-x-1">
        <div className={cn("flex items-center space-x-1", changeColor)}>
          {changeIcon}
          <span className="text-sm font-medium">{change}</span>
        </div>
        {subtitle && (
          <span className="text-sm text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-6 shadow-input">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16 mt-2" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center space-x-1">
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}


export function DashboardMetrics({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Active Repositories"
        value="12"
        change="2 new"
        changeType="positive"
        icon={<GitBranch className="w-5 h-5 text-muted-foreground" />}
        subtitle="this month"
      />
      <MetricCard
        title="Code Quality Score"
        value="8.7/10"
        change="+0.3"
        changeType="positive"
        icon={<Code2 className="w-5 h-5 text-muted-foreground" />}
        subtitle="average across repos"
      />
      <MetricCard
        title="Security Issues"
        value="3"
        change="-5"
        changeType="positive"
        icon={<Shield className="w-5 h-5 text-muted-foreground" />}
        subtitle="resolved this week"
      />
      <MetricCard
        title="Architecture Debt"
        value="15%"
        change="-2%"
        changeType="positive"
        icon={<Layers className="w-5 h-5 text-muted-foreground" />}
        subtitle="technical debt ratio"
      />
    </div>
  );
}