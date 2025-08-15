"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Code2, 
  Layers, 
  GitBranch, 
  FileCode, 
  Database, 
  Shield, 
  Zap,
  Play,
  Loader2
} from "lucide-react"

interface AnalysisTypesProps {
  selectedType: string | null
  onTypeSelect: (type: string) => void
  onStartAnalysis: () => void
  isAnalyzing: boolean
  disabled: boolean
}

const analysisTypes = [
  {
    id: "lld",
    name: "Low Level Design (LLD)",
    description: "Detailed component-level analysis and design patterns",
    icon: Code2,
    features: ["Class diagrams", "Method signatures", "Data structures", "Algorithms"],
    estimatedTime: "5-10 minutes",
    priority: "high"
  },
  {
    id: "hld",
    name: "High Level Design (HLD)",
    description: "System architecture and component relationships",
    icon: Layers,
    features: ["System architecture", "Component interactions", "Data flow", "Deployment"],
    estimatedTime: "3-5 minutes",
    priority: "medium"
  },
  {
    id: "code-quality",
    name: "Code Quality Analysis",
    description: "Code quality metrics and best practices",
    icon: FileCode,
    features: ["Code complexity", "Code smells", "Best practices", "Performance"],
    estimatedTime: "2-3 minutes",
    priority: "medium"
  },
  {
    id: "security",
    name: "Security Analysis",
    description: "Security vulnerabilities and compliance checks",
    icon: Shield,
    features: ["Vulnerability scan", "Dependency check", "Compliance", "Threat modeling"],
    estimatedTime: "4-6 minutes",
    priority: "high"
  },
  {
    id: "performance",
    name: "Performance Analysis",
    description: "Performance bottlenecks and optimization opportunities",
    icon: Zap,
    features: ["Bottleneck detection", "Memory usage", "CPU profiling", "Optimization"],
    estimatedTime: "3-4 minutes",
    priority: "medium"
  },
  {
    id: "database",
    name: "Database Analysis",
    description: "Database schema and query optimization",
    icon: Database,
    features: ["Schema analysis", "Query optimization", "Indexing", "Relationships"],
    estimatedTime: "2-4 minutes",
    priority: "low"
  }
]

export function AnalysisTypes({ 
  selectedType, 
  onTypeSelect, 
  onStartAnalysis, 
  isAnalyzing, 
  disabled 
}: AnalysisTypesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Analysis Types
        </CardTitle>
        <CardDescription>
          Select the type of analysis you want to perform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {analysisTypes.map((type) => {
            const Icon = type.icon
            const isSelected = selectedType === type.id
            
            return (
              <div
                key={type.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-accent/50"
                }`}
                onClick={() => onTypeSelect(type.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{type.name}</h4>
                      <Badge 
                        variant={type.priority === "high" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {type.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {type.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {type.features.slice(0, 2).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {type.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{type.features.length - 2} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        ⏱️ {type.estimatedTime}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {selectedType && (
          <div className="pt-4 border-t">
            <Button 
              onClick={onStartAnalysis}
              disabled={disabled || isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Analysis
                </>
              )}
            </Button>
            
            {isAnalyzing && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analysis Progress</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
