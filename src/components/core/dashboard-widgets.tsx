"use client";

import { MagicCard } from "@/components/ui/magic-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Users,
  Eye,
  Download
} from "lucide-react";
import { motion } from "motion/react";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  className 
}: ProgressRingProps) {
  const normalizedRadius = (size - strokeWidth * 2) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative", className)}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          className="text-primary transition-all duration-1000 ease-in-out"
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          className="text-muted-foreground/20"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{progress}%</span>
      </div>
    </div>
  );
}

export function ProjectProgressCard() {
  const { theme } = useTheme();
  
  return (
    <MagicCard
      className="p-6 border border-border/50 rounded-xl"
      gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Project Progress</h3>
          <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span>+12%</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <ProgressRing progress={73} />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tasks Completed</span>
            <span className="font-medium">47/65</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deadline</span>
            <span className="font-medium">12 days left</span>
          </div>
        </div>
      </div>
    </MagicCard>
  );
}

export function TeamActivityCard() {
  const { theme } = useTheme();
  
  const teamMembers = [
    { name: "Alice Johnson", status: "online", lastActive: "2 min ago", avatar: "AJ" },
    { name: "Bob Smith", status: "away", lastActive: "1 hour ago", avatar: "BS" },
    { name: "Carol Davis", status: "online", lastActive: "Just now", avatar: "CD" },
    { name: "David Wilson", status: "offline", lastActive: "3 hours ago", avatar: "DW" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "offline": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <MagicCard
      className="p-6 border border-border/50 rounded-xl relative overflow-hidden"
      gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
    >
      <GridPattern
        squares={[[1, 1], [2, 3], [4, 2]]}
        className="absolute inset-0 opacity-10 [mask-image:radial-gradient(200px_circle_at_center,white,transparent)]"
      />
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Team Activity</h3>
          <Users className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="space-y-3">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-background/30 backdrop-blur-sm"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                  {member.avatar}
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                  getStatusColor(member.status)
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.lastActive}</p>
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {member.status}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MagicCard>
  );
}

export function RecentTasksCard() {
  const { theme } = useTheme();
  
  const tasks = [
    { id: 1, title: "Update user authentication", status: "completed", priority: "high" },
    { id: 2, title: "Design new dashboard layout", status: "in-progress", priority: "medium" },
    { id: 3, title: "Fix mobile responsiveness", status: "pending", priority: "high" },
    { id: 4, title: "Write API documentation", status: "completed", priority: "low" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in-progress": return <Clock className="w-4 h-4 text-blue-500" />;
      case "pending": return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-500/10";
      case "medium": return "text-yellow-500 bg-yellow-500/10";
      case "low": return "text-green-500 bg-green-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <MagicCard
      className="p-6 border border-border/50 rounded-xl"
      gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Tasks</h3>
          <ShimmerButton 
            className="text-xs px-3 py-1"
            shimmerColor="#3b82f6"
            background="rgba(59, 130, 246, 0.1)"
          >
            View All
          </ShimmerButton>
        </div>
        
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
            >
              {getStatusIcon(task.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium capitalize",
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {task.status.replace("-", " ")}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MagicCard>
  );
}

export function AnalyticsCard() {
  const { theme } = useTheme();
  
  const stats = [
    { label: "Page Views", value: "12.3K", change: "+5.2%", trend: "up" },
    { label: "Downloads", value: "847", change: "+12.1%", trend: "up" },
    { label: "Bounce Rate", value: "2.4%", change: "-0.8%", trend: "down" },
  ];

  return (
    <MagicCard
      className="p-6 border border-border/50 rounded-xl"
      gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Analytics Overview</h3>
          <Eye className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-background/30"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {stat.label === "Page Views" && <Eye className="w-4 h-4 text-primary" />}
                  {stat.label === "Downloads" && <Download className="w-4 h-4 text-primary" />}
                  {stat.label === "Bounce Rate" && <TrendingDown className="w-4 h-4 text-primary" />}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center space-x-1 text-sm font-medium",
                stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{stat.change}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MagicCard>
  );
}