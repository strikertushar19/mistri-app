"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GitBranch, GitPullRequest, Layers, TrendingUp, TrendingDown, BarChart3, Activity, Calendar } from "lucide-react"
import { fetchSummaryStats, SummaryStats } from "@/lib/api/summary"

export default function DashboardPage() {
  const [summaryData, setSummaryData] = useState<SummaryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSummaryData() {
      try {
        setLoading(true)
        const data = await fetchSummaryStats()
        console.log('Summary data received:', data) // Debug log
        setSummaryData(data)
        setError(null)
      } catch (err) {
        console.error('Failed to load summary data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load summary data')
      } finally {
        setLoading(false)
      }
    }
    
    loadSummaryData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-red-600 mb-2">Failed to load dashboard data</p>
            <p className="text-muted-foreground text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const data = summaryData || {
    repositories_analyzed: 0,
    diagrams_generated: 0,
    pull_requests_analyzed: 0,
    design_patterns_found: 0,
    total_analyses: 0,
    popular_patterns: [] as Array<{
      pattern_name: string;
      count: number;
      last_seen: string;
    }>,
    diagram_types: [] as Array<{
      diagram_type: string;
      count: number;
      last_seen: string;
    }>,
    last_updated: new Date().toISOString()
  }

  // Ensure arrays are always defined (defensive programming)
  const popularPatterns = data.popular_patterns || []
  const diagramTypes = data.diagram_types || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your analysis activities and insights
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Repositories Analyzed</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.repositories_analyzed}</div>
              <p className="text-xs text-muted-foreground">
                Total repositories analyzed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diagrams Generated</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.diagrams_generated}</div>
              <p className="text-xs text-muted-foreground">
                Total diagrams created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pull Requests Analyzed</CardTitle>
              <GitPullRequest className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.pull_requests_analyzed}</div>
              <p className="text-xs text-muted-foreground">
                PR analysis completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Design Patterns Found</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.design_patterns_found}</div>
              <p className="text-xs text-muted-foreground">
                Patterns identified
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Popular Design Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Popular Design Patterns
                  {popularPatterns.length > 6 && (
                    <span className="text-xs text-muted-foreground font-normal">
                      (scroll to see more)
                    </span>
                  )}
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{popularPatterns.length} unique patterns</div>
                  <div>{popularPatterns.reduce((sum, p) => sum + (p.count || 0), 0)} total usage</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {popularPatterns.length > 0 ? (
                <div className="max-h-64 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {popularPatterns.map((pattern, index) => {
                    // Calculate total usage across all patterns
                    const totalUsage = popularPatterns.reduce((sum, p) => sum + (p.count || 0), 0)
                    // Calculate percentage based on total usage
                    const percentage = totalUsage > 0 ? ((pattern?.count || 0) / totalUsage) * 100 : 0
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{pattern?.pattern_name || 'Unknown Pattern'}</span>
                          <span className="text-sm text-muted-foreground">{pattern?.count || 0} times</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          {percentage.toFixed(1)}% of total usage
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No design patterns found yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Diagram Types Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Diagram Types Generated
                  {diagramTypes.length > 6 && (
                    <span className="text-xs text-muted-foreground font-normal">
                      (scroll to see more)
                    </span>
                  )}
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{diagramTypes.length} unique types</div>
                  <div>{diagramTypes.reduce((sum, d) => sum + (d.count || 0), 0)} total created</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {diagramTypes.length > 0 ? (
                <div className="max-h-64 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {diagramTypes.map((diagram, index) => {
                    // Calculate total usage across all diagram types
                    const totalUsage = diagramTypes.reduce((sum, d) => sum + (d.count || 0), 0)
                    // Calculate percentage based on total usage
                    const percentage = totalUsage > 0 ? ((diagram?.count || 0) / totalUsage) * 100 : 0
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{diagram?.diagram_type || 'Unknown Type'}</span>
                          <span className="text-sm text-muted-foreground">{diagram?.count || 0} created</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-pink-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground text-center">
                          {percentage.toFixed(1)}% of total usage
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No diagrams generated yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Last updated</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {data.last_updated ? (() => {
                  const date = new Date(data.last_updated)
                  const now = new Date()
                  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
                  
                  if (diffInHours < 1) {
                    return 'Just now'
                  } else if (diffInHours < 24) {
                    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
                  } else if (diffInHours < 48) {
                    return 'Yesterday'
                  } else {
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  }
                })() : 'Never'}
              </span>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Dashboard data is automatically updated when new analyses complete
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
