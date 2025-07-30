"use client";

import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GridPattern } from "@/components/ui/grid-pattern";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useRef } from "react";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Target,
  Calendar,
  Settings
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  description?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  description 
}: MetricCardProps) {
  const { theme } = useTheme();
  
  const changeColor = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400", 
    neutral: "text-gray-600 dark:text-gray-400"
  }[changeType];

  return (
    <MagicCard
      className="p-6 border border-border/50 rounded-xl"
      gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-sm font-medium", changeColor)}>
            {change}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    </MagicCard>
  );
}

export function QuickActionsCard() {
  return (
    <MagicCard className="p-6 border border-border/50 rounded-xl">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <ShimmerButton
            className="w-full justify-start"
            shimmerColor="#ffffff"
            background="rgba(59, 130, 246, 0.1)"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </ShimmerButton>
          <ShimmerButton
            className="w-full justify-start"
            shimmerColor="#ffffff"
            background="rgba(34, 197, 94, 0.1)"
          >
            <Target className="w-4 h-4 mr-2" />
            Goals
          </ShimmerButton>
          <ShimmerButton
            className="w-full justify-start"
            shimmerColor="#ffffff"
            background="rgba(168, 85, 247, 0.1)"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </ShimmerButton>
          <ShimmerButton
            className="w-full justify-start"
            shimmerColor="#ffffff"
            background="rgba(239, 68, 68, 0.1)"
          >
            <Activity className="w-4 h-4 mr-2" />
            Reports
          </ShimmerButton>
        </div>
      </div>
    </MagicCard>
  );
}

export function ActivityFeedCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const item1Ref = useRef<HTMLDivElement>(null);
  const item2Ref = useRef<HTMLDivElement>(null);
  const item3Ref = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  const activities = [
    { id: 1, action: "New user registered", time: "2 minutes ago", type: "user" },
    { id: 2, action: "Payment processed", time: "5 minutes ago", type: "payment" },
    { id: 3, action: "Report generated", time: "10 minutes ago", type: "report" },
  ];

  return (
    <MagicCard className="p-6 border border-border/50 rounded-xl relative overflow-hidden">
      <div ref={containerRef} className="relative">
        <GridPattern
          squares={[
            [1, 1], [3, 2], [5, 1], [2, 4], [4, 3]
          ]}
          className="absolute inset-0 opacity-20 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
        />
        
        <div className="relative z-10 space-y-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const ref = index === 0 ? item1Ref : index === 1 ? item2Ref : item3Ref;
              return (
                <div
                  key={activity.id}
                  ref={ref}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30"
                >
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Center point for beams */}
          <div ref={centerRef} className="absolute top-1/2 left-1/2 w-1 h-1 opacity-0" />
        </div>

        {/* Animated beams connecting activities */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={item1Ref}
          toRef={centerRef}
          curvature={-20}
          duration={3}
          gradientStartColor="#3b82f6"
          gradientStopColor="#8b5cf6"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={item2Ref}
          toRef={centerRef}
          duration={3}
          delay={1}
          gradientStartColor="#10b981"
          gradientStopColor="#3b82f6"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={item3Ref}
          toRef={centerRef}
          curvature={20}
          duration={3}
          delay={2}
          gradientStartColor="#f59e0b"
          gradientStopColor="#10b981"
        />
      </div>
    </MagicCard>
  );
}

export function DashboardMetrics() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Revenue"
        value="$45,231"
        change="+20.1%"
        changeType="positive"
        icon={<DollarSign className="w-5 h-5" />}
        description="from last month"
      />
      <MetricCard
        title="Active Users"
        value="2,350"
        change="+15.3%"
        changeType="positive"
        icon={<Users className="w-5 h-5" />}
        description="from last month"
      />
      <MetricCard
        title="Growth Rate"
        value="12.5%"
        change="+2.1%"
        changeType="positive"
        icon={<TrendingUp className="w-5 h-5" />}
        description="from last month"
      />
      <MetricCard
        title="Conversion"
        value="3.2%"
        change="-0.5%"
        changeType="negative"
        icon={<BarChart3 className="w-5 h-5" />}
        description="from last month"
      />
    </div>
  );
}