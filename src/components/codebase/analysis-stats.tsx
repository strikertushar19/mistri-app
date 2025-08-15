"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Code2, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  GitBranch,
  FileCode
} from "lucide-react"

const demoStats = {
  totalAnalyses: 24,
  thisWeek: 8,
  averageScore: 87,
  totalIssues: 156,
  resolvedIssues: 142,
  repositories: 6,
  codeQuality: 92,
  securityScore: 89,
  performanceScore: 85
}

export function AnalysisStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
          <Code2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{demoStats.totalAnalyses}</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+{demoStats.thisWeek}</span> this week
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{demoStats.averageScore}%</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-green-600">+2.1%</span> from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Issues Resolved</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{demoStats.resolvedIssues}</div>
          <p className="text-xs text-muted-foreground">
            of {demoStats.totalIssues} total issues
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Repositories</CardTitle>
          <GitBranch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{demoStats.repositories}</div>
          <p className="text-xs text-muted-foreground">
            connected repositories
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
