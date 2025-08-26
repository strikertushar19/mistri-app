"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, BarChart3, FileText, GitBranch, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AnalysisResultProps {
  analysisId: string
  repositoryName: string
  analysisType: string
  summary?: string
  keyInsights?: string[]
  className?: string
}

export function AnalysisResult({ 
  analysisId, 
  repositoryName, 
  analysisType, 
  summary, 
  keyInsights, 
  className 
}: AnalysisResultProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'lld_analysis':
        return <BarChart3 className="h-4 w-4" />
      case 'design_pattern':
        return <FileText className="h-4 w-4" />
      case 'architecture_summary':
        return <GitBranch className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'lld_analysis':
        return 'Low-Level Design'
      case 'design_pattern':
        return 'Design Patterns'
      case 'architecture_summary':
        return 'Architecture'
      case 'general_analysis':
        return 'General Analysis'
      default:
        return type.replace('_', ' ')
    }
  }

  return (
    <Card className={cn("border-2 border-blue-200 ", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getAnalysisIcon(analysisType)}
            <CardTitle className="text-lg">
              Analysis Complete! 📊
            </CardTitle>
          </div>
          <Badge variant="outline" className="capitalize">
            {getAnalysisTypeLabel(analysisType)}
          </Badge>
        </div>
        <CardDescription>
          Repository: {repositoryName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary */}
        {summary && (
          <div>
            <p className="text-sm text-muted-foreground">{summary}</p>
          </div>
        )}

        {/* Key Insights */}
        {keyInsights && keyInsights.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <h4 className="font-medium text-sm">Key Insights</h4>
            </div>
            <ul className="space-y-1">
              {keyInsights.slice(0, isExpanded ? undefined : 3).map((insight, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{insight}</span>
                </li>
              ))}
            </ul>
            {keyInsights.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 h-6 text-xs"
              >
                {isExpanded ? 'Show less' : `Show ${keyInsights.length - 3} more`}
              </Button>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="pt-2 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              💡 Want to see the detailed analysis?
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Navigate using Next.js router for proper routing
                router.push(`/analysis/${analysisId}`)
              }}
              className="flex items-center space-x-1"
            >
              <span>View Details</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Analysis ID: <code className="bg-blue-100 px-1 rounded">{analysisId}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to extract analysis ID from chat message
export function extractAnalysisIdFromMessage(content: string): string | null {
  // Look for analysis ID pattern: `123e4567-e89b-12d3-a456-426614174000`
  const analysisIdPattern = /`([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})`/
  const match = content.match(analysisIdPattern)
  return match ? match[1] : null
}

// Helper function to check if message contains analysis result
export function isAnalysisResultMessage(content: string): boolean {
  return (content.includes('Analysis Complete! 📊') || content.includes('Analysis Already Exists! 📊')) && 
         content.includes('Analysis ID:') &&
         extractAnalysisIdFromMessage(content) !== null
}

// Helper function to extract analysis data from message content
export function extractAnalysisDataFromMessage(content: string): {
  analysisId: string | null
  repositoryName: string | null
  analysisType: string | null
  summary: string | null
  keyInsights: string[]
} {
  const analysisId = extractAnalysisIdFromMessage(content)
  
  // Extract repository name
  const repoMatch = content.match(/Repository:\s*([^\n]+)/)
  const repositoryName = repoMatch ? repoMatch[1].trim() : null
  
  // Extract analysis type - try new format first, then fallback to old format
  let analysisType: string | null = null
  
  // New format: "Low-Level Design" on its own line after "Analysis Complete! 📊"
  const newTypeMatch = content.match(/## Analysis Complete! 📊\n\n([^\n]+)\n/)
  if (newTypeMatch) {
    analysisType = newTypeMatch[1].trim()
  } else {
    // Old format: "Analysis Type: something"
    const typeMatch = content.match(/Analysis Type:\s*([^\n]+)/)
    analysisType = typeMatch ? typeMatch[1].trim() : null
  }
  
  // Extract summary - try to get the text between repository info and "💡 Want to see"
  const summaryMatch = content.match(/Repository:.*\n\n([\s\S]*?)(?=\n\n💡 Want to see|$)/)
  const summary = summaryMatch ? summaryMatch[1].trim() : null
  
  // Extract key insights - this might not be present in the new format
  const insightsMatch = content.match(/### Key Insights:\s*\n([\s\S]*?)(?=\n\n### |💡 Want to see|$)/)
  const keyInsights = insightsMatch 
    ? insightsMatch[1]
        .split('\n')
        .map(line => line.replace(/^•\s*/, '').trim())
        .filter(line => line.length > 0)
    : []
  
  return {
    analysisId,
    repositoryName,
    analysisType,
    summary,
    keyInsights
  }
}
