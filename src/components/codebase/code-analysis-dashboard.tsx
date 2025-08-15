"use client"

import { useState } from "react"
import { RepositoryConnector } from "./repository-connector"
import { AnalysisTypes } from "./analysis-types"
import { AnalysisResults } from "./analysis-results"
import { RecentAnalyses } from "./recent-analyses"
import { AnalysisStats } from "./analysis-stats"

export function CodeAnalysisDashboard() {
  const [selectedRepository, setSelectedRepository] = useState<string | null>(null)
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleStartAnalysis = async () => {
    if (!selectedRepository || !selectedAnalysisType) return
    
    setIsAnalyzing(true)
    // Simulate analysis process
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Code Analysis</h2>
        <p className="text-muted-foreground">
          Deep analysis of your codebase for Low Level Design (LLD) and High Level Design (HLD)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Repository & Analysis Setup */}
        <div className="lg:col-span-1 space-y-6">
          <RepositoryConnector 
            selectedRepository={selectedRepository}
            onRepositorySelect={setSelectedRepository}
          />
          
          <AnalysisTypes 
            selectedType={selectedAnalysisType}
            onTypeSelect={setSelectedAnalysisType}
            onStartAnalysis={handleStartAnalysis}
            isAnalyzing={isAnalyzing}
            disabled={!selectedRepository}
          />
        </div>

        {/* Right Column - Results & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <AnalysisStats />
          <AnalysisResults isAnalyzing={isAnalyzing} />
          <RecentAnalyses />
        </div>
      </div>
    </div>
  )
}
