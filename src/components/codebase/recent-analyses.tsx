"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  Code2, 
  Layers, 
  FileCode, 
  Shield, 
  Zap,
  Database,
  Eye,
  Download
} from "lucide-react"

const recentAnalyses = [
  {
    id: "analysis-1",
    repository: "mistri-app",
    type: "lld",
    typeName: "Low Level Design",
    status: "completed",
    score: 85,
    issues: 12,
    completedAt: "2 hours ago",
    duration: "8m 32s"
  },
  {
    id: "analysis-2",
    repository: "backend-api",
    type: "hld",
    typeName: "High Level Design",
    status: "completed",
    score: 92,
    issues: 5,
    completedAt: "1 day ago",
    duration: "5m 18s"
  },
  {
    id: "analysis-3",
    repository: "frontend-ui",
    type: "security",
    typeName: "Security Analysis",
    status: "completed",
    score: 89,
    issues: 8,
    completedAt: "2 days ago",
    duration: "6m 45s"
  },
  {
    id: "analysis-4",
    repository: "mistri-app",
    type: "performance",
    typeName: "Performance Analysis",
    status: "completed",
    score: 78,
    issues: 15,
    completedAt: "3 days ago",
    duration: "4m 12s"
  },
  {
    id: "analysis-5",
    repository: "backend-api",
    type: "code-quality",
    typeName: "Code Quality",
    status: "completed",
    score: 91,
    issues: 6,
    completedAt: "1 week ago",
    duration: "3m 28s"
  }
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "lld": return <Code2 className="h-4 w-4" />
    case "hld": return <Layers className="h-4 w-4" />
    case "code-quality": return <FileCode className="h-4 w-4" />
    case "security": return <Shield className="h-4 w-4" />
    case "performance": return <Zap className="h-4 w-4" />
    case "database": return <Database className="h-4 w-4" />
    default: return <Code2 className="h-4 w-4" />
  }
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600"
  if (score >= 80) return "text-yellow-600"
  if (score >= 70) return "text-orange-600"
  return "text-red-600"
}

const getScoreBadgeVariant = (score: number) => {
  if (score >= 90) return "default"
  if (score >= 80) return "secondary"
  if (score >= 70) return "outline"
  return "destructive"
}

export function RecentAnalyses() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Analyses
            </CardTitle>
            <CardDescription>
              Your recent code analysis history
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAnalyses.map((analysis) => (
            <div key={analysis.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  {getTypeIcon(analysis.type)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{analysis.repository}</h4>
                    <Badge variant="outline" className="text-xs">
                      {analysis.typeName}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Completed {analysis.completedAt}</span>
                    <span>Duration: {analysis.duration}</span>
                    <span>{analysis.issues} issues found</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}%
                  </div>
                  <Badge variant={getScoreBadgeVariant(analysis.score)} className="text-xs">
                    {analysis.score >= 90 ? "Excellent" : 
                     analysis.score >= 80 ? "Good" : 
                     analysis.score >= 70 ? "Fair" : "Poor"}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
