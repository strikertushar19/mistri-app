"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Code2, 
  Layers, 
  FileText, 
  Download, 
  Share2, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react"

interface AnalysisResultsProps {
  isAnalyzing: boolean
}

const demoResults = {
  lld: {
    status: "completed",
    score: 85,
    issues: 12,
    recommendations: 8,
    components: [
      {
        name: "UserService",
        type: "Service",
        complexity: "Medium",
        issues: 2,
        status: "good"
      },
      {
        name: "AuthController",
        type: "Controller",
        complexity: "High",
        issues: 4,
        status: "warning"
      },
      {
        name: "DatabaseRepository",
        type: "Repository",
        complexity: "Low",
        issues: 1,
        status: "good"
      }
    ],
    patterns: [
      "Singleton Pattern",
      "Factory Pattern",
      "Observer Pattern",
      "Strategy Pattern"
    ]
  },
  hld: {
    status: "completed",
    score: 92,
    issues: 5,
    recommendations: 3,
    architecture: {
      type: "Microservices",
      layers: ["Presentation", "Business Logic", "Data Access"],
      components: ["API Gateway", "User Service", "Auth Service", "Database"]
    },
    dataFlow: [
      "Client → API Gateway → Service → Database",
      "Service → Message Queue → Another Service"
    ]
  }
}

export function AnalysisResults({ isAnalyzing }: AnalysisResultsProps) {
  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Analyzing your codebase...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              Detailed analysis of your codebase structure and patterns
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="lld" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lld" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Low Level Design
            </TabsTrigger>
            <TabsTrigger value="hld" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              High Level Design
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lld" className="space-y-6">
            {/* LLD Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Overall Score</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{demoResults.lld.score}%</div>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Issues Found</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{demoResults.lld.issues}</div>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Recommendations</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{demoResults.lld.recommendations}</div>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Analysis Time</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">8m 32s</div>
              </div>
            </div>

            {/* Components Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Component Analysis</h3>
              <div className="space-y-3">
                {demoResults.lld.components.map((component, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{component.name}</h4>
                        <Badge variant="outline">{component.type}</Badge>
                        <Badge 
                          variant={component.complexity === "High" ? "destructive" : "secondary"}
                        >
                          {component.complexity} Complexity
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{component.issues} issues</Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Design Patterns */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Design Patterns Detected</h3>
              <div className="flex flex-wrap gap-2">
                {demoResults.lld.patterns.map((pattern, index) => (
                  <Badge key={index} variant="secondary">
                    {pattern}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hld" className="space-y-6">
            {/* HLD Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Architecture Score</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{demoResults.hld.score}%</div>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Architecture Issues</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{demoResults.hld.issues}</div>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Improvements</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{demoResults.hld.recommendations}</div>
              </div>
              
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Analysis Time</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">5m 18s</div>
              </div>
            </div>

            {/* Architecture Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Architecture Overview</h3>
              <div className="p-4 rounded-lg border bg-card">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Type: </span>
                    <Badge variant="outline">{demoResults.hld.architecture.type}</Badge>
                  </div>
                  
                  <div>
                    <span className="font-medium">Layers: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {demoResults.hld.architecture.layers.map((layer, index) => (
                        <Badge key={index} variant="secondary">
                          {layer}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Components: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {demoResults.hld.architecture.components.map((component, index) => (
                        <Badge key={index} variant="outline">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Flow */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Data Flow Patterns</h3>
              <div className="space-y-2">
                {demoResults.hld.dataFlow.map((flow, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-sm font-mono">{flow}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
