"use client";

import { cn } from "@/lib/utils";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  BarChart3,
  Calendar,
  Filter,
  Plus,
  MoreHorizontal,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CleanMetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  subtitle?: string;
}

export function CleanMetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  subtitle 
}: CleanMetricCardProps) {
  const changeColor = {
    positive: "text-green-600",
    negative: "text-orange-500", 
    neutral: "text-gray-500"
  }[changeType];

  const changeIcon = changeType === "positive" ? 
    <TrendingUp className="w-3 h-3" /> : 
    <TrendingDown className="w-3 h-3" />;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-50 rounded-lg">
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

export function CleanDashboardMetrics() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <CleanMetricCard
        title="New subscriptions"
        value="22"
        change="15%"
        changeType="positive"
        icon={<Users className="w-5 h-5 text-gray-600" />}
        subtitle="compared to last week"
      />
      <CleanMetricCard
        title="New orders"
        value="320"
        change="4%"
        changeType="negative"
        icon={<ShoppingCart className="w-5 h-5 text-gray-600" />}
        subtitle="compared to last week"
      />
      <CleanMetricCard
        title="Avg. order revenue"
        value="$1,080"
        change="8%"
        changeType="positive"
        icon={<DollarSign className="w-5 h-5 text-gray-600" />}
        subtitle="compared to last week"
      />
      <CleanMetricCard
        title="Conversion Rate"
        value="3.2%"
        change="2%"
        changeType="positive"
        icon={<BarChart3 className="w-5 h-5 text-gray-600" />}
        subtitle="compared to last week"
      />
    </div>
  );
}

interface CampaignCardProps {
  platform: "facebook" | "google" | "instagram";
  title: string;
  status: "Draft" | "In Progress" | "Archived";
  statusCount?: number;
  avatars: string[];
  startDate?: string;
  endDate?: string;
  lastUpdated: string;
  progress?: number;
}

export function CampaignCard({
  platform,
  title,
  status,
  statusCount,
  avatars,
  startDate,
  endDate,
  lastUpdated,
  progress
}: CampaignCardProps) {
  const platformIcons = {
    facebook: "🔵",
    google: "🔍", 
    instagram: "📷"
  };

  const statusColors = {
    "Draft": "text-gray-600 bg-gray-100",
    "In Progress": "text-green-700 bg-green-100",
    "Archived": "text-gray-600 bg-gray-100"
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{platformIcons[platform]}</div>
          <div className="flex -space-x-2">
            {avatars.slice(0, 3).map((avatar, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
              >
                {avatar}
              </div>
            ))}
            {avatars.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                +{avatars.length - 3}
              </div>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
        {title}
      </h3>

      {startDate && endDate && (
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-sm text-gray-600">Start:</span>
          <span className="text-sm font-medium">{startDate}</span>
          <span className="text-sm text-gray-600">Ends:</span>
          <span className="text-sm font-medium">{endDate}</span>
        </div>
      )}

      {progress && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          statusColors[status]
        )}>
          {status}: {statusCount || "Not Started"}
        </span>
        <span className="text-sm text-gray-500">
          Last updated: {lastUpdated}
        </span>
      </div>
    </div>
  );
}

export function RecentCampaigns() {
  const campaigns = [
    {
      platform: "facebook" as const,
      title: "10 Simple steps to revolutionise workflows with our product",
      status: "Draft" as const,
      statusCount: 2,
      avatars: ["AJ", "BS", "CD"],
      lastUpdated: "Apr 10, 2023"
    },
    {
      platform: "google" as const,
      title: "Boost your performance: start using our amazing product",
      status: "In Progress" as const,
      statusCount: 2,
      avatars: ["EF", "GH"],
      startDate: "Jun 1, 2023",
      endDate: "Aug 1, 2023",
      lastUpdated: "July 10, 2023",
      progress: 65
    },
    {
      platform: "google" as const,
      title: "The power of our product: A new era in SaaS",
      status: "Archived" as const,
      statusCount: 1,
      avatars: ["IJ", "KL", "MN", "OP"],
      lastUpdated: "Apr 10, 2023"
    },
    {
      platform: "instagram" as const,
      title: "Beyond Boundaries: Explore our new product",
      status: "Draft" as const,
      avatars: ["QR", "ST"],
      lastUpdated: "Apr 10, 2023"
    },
    {
      platform: "facebook" as const,
      title: "Skyrocket your productivity: our product is revealed",
      status: "In Progress" as const,
      avatars: ["UV", "WX"],
      startDate: "Jul 1, 2023",
      endDate: "Sep 30, 2023",
      lastUpdated: "July 10, 2023",
      progress: 45
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recent campaigns</h2>
        <Button variant="outline" className="text-sm">
          View all
          <ExternalLink className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Draft</span>
          <span className="font-medium">2</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">In Progress</span>
          <span className="font-medium">2</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Archived</span>
          <span className="font-medium">1</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign, index) => (
          <CampaignCard key={index} {...campaign} />
        ))}
        
        {/* Add Campaign Card */}
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
          <Plus className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">Add campaign</span>
        </div>
      </div>
    </div>
  );
}